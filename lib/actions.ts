"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { connectToDatabase, hasDatabase } from "./db";
import { PersonModel, SightingModel, CheckInModel } from "./db/models";
import { MISSING_STATUSES, type Person, type PersonCursor, type PersonStatus } from "./db/schema";
import { uploadPhoto } from "./blob";
import { canonicalizeCedula, isValidCedula } from "./cedula";
import { searchPersonsPage } from "./data";
import { ageBand, type Filter } from "./format";
import { nameSimilarity, NAME_MATCH_THRESHOLD } from "./text-match";

const REQUIRE_DB =
  "La base de datos no está configurada. Define MONGODB_URI para guardar reportes.";

/** Collect the given keys as trimmed strings, mapping empty values to undefined. */
function formValues(fd: FormData, keys: string[]): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const k of keys) {
    const v = fd.get(k);
    const s = typeof v === "string" ? v.trim() : "";
    out[k] = s.length ? s : undefined;
  }
  return out;
}

const PHONE_RE = /^[\d+()\-\s]{6,20}$/;
const CEDULA_MSG = "Cédula inválida (usa el formato V-12.345.678)";
const cedulaRequired = z
  .string({ required_error: "La cédula es obligatoria" })
  .refine(isValidCedula, CEDULA_MSG);
// Optional on the report: minors without a cédula are allowed (see createReport).
const cedulaOptional = z.string().refine(isValidCedula, CEDULA_MSG).optional();

const reportSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio").max(80, "Nombre demasiado largo"),
  lastName: z.string().min(1, "El apellido es obligatorio").max(80, "Apellido demasiado largo"),
  age: z.coerce.number().int("Edad inválida").min(0).max(120, "Edad fuera de rango").optional(),
  gender: z.enum(["masculino", "femenino", "otro"]).default("otro"),
  nationality: z.string().max(60).optional(),
  idDocument: cedulaOptional,

  heightCm: z.coerce.number().int().min(30, "Estatura fuera de rango").max(250, "Estatura fuera de rango").optional(),
  weightKg: z.coerce.number().min(2, "Peso fuera de rango").max(400, "Peso fuera de rango").optional(),
  build: z.string().max(60).optional(),
  hairColor: z.string().max(40).optional(),
  hairLength: z.string().max(40).optional(),
  eyeColor: z.string().max(40).optional(),
  skinTone: z.string().max(40).optional(),
  distinguishingMarks: z.string().max(1000).optional(),

  lastSeenLocation: z.string().max(200).optional(),
  lastSeenCity: z.string().max(120).optional(),
  lastSeenDate: z
    .string()
    .min(1, "La fecha de desaparición es obligatoria")
    .refine((s) => !Number.isNaN(Date.parse(s)), "Fecha inválida")
    .refine((s) => Date.parse(s) <= Date.now() + 86_400_000, "La fecha no puede ser futura"),
  circumstances: z.string().max(2000).optional(),

  reporterName: z.string().max(80).optional(),
  reporterRelationship: z.string().max(60).optional(),
  reporterPhone: z.string().regex(PHONE_RE, "Teléfono inválido").optional(),
  reporterEmail: z.string().email("Correo electrónico inválido").optional(),
});

const REPORT_KEYS = Object.keys(reportSchema.shape);

const sightingSchema = z.object({
  personId: z.string().min(1, "Falta el identificador de la persona"),
  location: z.string().min(1, "Indica dónde ocurrió el avistamiento").max(200),
  note: z.string().max(1000).optional(),
  reporterName: z.string().max(80).optional(),
  contact: z.string().max(120).optional(),
});

const SIGHTING_KEYS = Object.keys(sightingSchema.shape);

const checkinSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio").max(80),
  lastName: z.string().min(1, "El apellido es obligatorio").max(80),
  idDocument: cedulaRequired,
});

const CHECKIN_KEYS = Object.keys(checkinSchema.shape);

export type ActionState = { ok: boolean; error?: string; id?: string; message?: string };

/** Create a missing-person report from the multi-panel form. */
export async function createReport(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = reportSchema.safeParse(formValues(formData, REPORT_KEYS));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  if (!hasDatabase) return { ok: false, error: REQUIRE_DB };

  const data = parsed.data;
  // Cédula is mandatory unless the report is flagged as a minor without one.
  const minorNoId = formData.get("noCedula") === "on";
  if (!minorNoId && !data.idDocument) {
    return {
      ok: false,
      error: "La cédula es obligatoria (o marca «menor de edad sin cédula»).",
    };
  }
  const idDocument = data.idDocument ? canonicalizeCedula(data.idDocument) : null;

  let photoUrl: string | null = null;
  try {
    photoUrl = await uploadPhoto(formData.get("photo") as File | null);
  } catch (e) {
    console.error("uploadPhoto failed:", e);
    photoUrl = null; // Non-fatal: keep the report even if the upload fails.
  }

  await connectToDatabase();

  // If this person already self-reported as safe (matching cédula AND name),
  // the report is born "encontrado".
  const safe = idDocument ? await CheckInModel.findOne({ idDocument }).lean().exec() : null;
  const autoFound =
    !!safe &&
    nameSimilarity(`${safe.firstName} ${safe.lastName}`, `${data.firstName} ${data.lastName}`) >=
      NAME_MATCH_THRESHOLD;
  const status: PersonStatus = autoFound ? "encontrado" : "desaparecido";

  const doc = await PersonModel.create({
    firstName: data.firstName,
    lastName: data.lastName,
    age: data.age ?? null,
    ageBand: ageBand(data.age ?? null),
    gender: data.gender,
    nationality: data.nationality ?? "Venezolana",
    idDocument,
    heightCm: data.heightCm ?? null,
    weightKg: data.weightKg ?? null,
    build: data.build ?? null,
    hairColor: data.hairColor ?? null,
    hairLength: data.hairLength ?? null,
    eyeColor: data.eyeColor ?? null,
    skinTone: data.skinTone ?? null,
    distinguishingMarks: data.distinguishingMarks ?? null,
    lastSeenLocation: data.lastSeenLocation ?? null,
    lastSeenCity: data.lastSeenCity ?? null,
    lastSeenDate: data.lastSeenDate,
    circumstances: data.circumstances ?? null,
    photoUrl,
    status,
    reporterName: data.reporterName ?? null,
    reporterPhone: data.reporterPhone ?? null,
    reporterEmail: data.reporterEmail ?? null,
    reporterRelationship: data.reporterRelationship ?? null,
  });

  revalidatePath("/");
  if (autoFound) revalidatePath("/encontrados");
  redirect(`/persona/${doc._id}?nuevo=1${autoFound ? "&salvo=1" : ""}`);
}

/** Report a sighting (avistamiento) for a person. */
export async function reportSighting(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = sightingSchema.safeParse(formValues(formData, SIGHTING_KEYS));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  if (!hasDatabase) return { ok: false, error: REQUIRE_DB };

  const data = parsed.data;
  await connectToDatabase();
  await SightingModel.create({
    personId: data.personId,
    location: data.location,
    note: data.note ?? null,
    reporterName: data.reporterName ?? null,
    contact: data.contact ?? null,
  });

  // A sighting promotes a still-missing person to "avistado" (a better status).
  // We never downgrade someone already marked "encontrado".
  await PersonModel.updateOne(
    { _id: data.personId, status: "desaparecido" },
    { $set: { status: "avistado" } },
  );

  revalidatePath(`/persona/${data.personId}`);
  revalidatePath("/");
  return { ok: true };
}

/**
 * Well-being check-in ("estoy a salvo"). If a still-missing report exists for
 * this cédula, mark it `encontrado`. Otherwise remember the check-in so a later
 * missing report for the same cédula is created already found.
 */
export async function submitCheckIn(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = checkinSchema.safeParse(formValues(formData, CHECKIN_KEYS));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  if (!hasDatabase) return { ok: false, error: REQUIRE_DB };

  const { firstName, lastName } = parsed.data;
  const idDocument = canonicalizeCedula(parsed.data.idDocument);
  const fullName = `${firstName} ${lastName}`;
  await connectToDatabase();

  // Find still-missing reports for this cédula, but only mark the ones whose
  // name is close enough — the cédula could have been mistyped, and wrongly
  // marking someone "encontrado" would halt a real search.
  const candidates = await PersonModel.find({
    idDocument,
    status: { $in: MISSING_STATUSES },
  })
    .select("_id firstName lastName")
    .lean<{ _id: string; firstName: string; lastName: string }[]>()
    .exec();

  const matchIds = candidates
    .filter(
      (c) => nameSimilarity(`${c.firstName} ${c.lastName}`, fullName) >= NAME_MATCH_THRESHOLD,
    )
    .map((c) => c._id);

  if (matchIds.length > 0) {
    await PersonModel.updateMany(
      { _id: { $in: matchIds } },
      { $set: { status: "encontrado" } },
    );
    revalidatePath("/");
    revalidatePath("/encontrados");
    return {
      ok: true,
      message:
        "Encontramos un reporte de desaparición con tu cédula y lo marcamos como ENCONTRADO. ¡Gracias por avisar que estás a salvo!",
    };
  }

  // No matching open report — record the check-in (idempotent per cédula).
  await CheckInModel.updateOne(
    { idDocument },
    { $set: { firstName, lastName, idDocument } },
    { upsert: true },
  );
  return {
    ok: true,
    message:
      "Registramos que estás a salvo. Si alguien te reporta como desaparecido, su reporte se marcará automáticamente como encontrado.",
  };
}

/** Fetch the next page of the directory for infinite scroll. */
export async function loadMorePersons(input: {
  query?: string;
  filter?: Filter;
  status?: PersonStatus | PersonStatus[];
  cursor: PersonCursor | null;
}): Promise<{ items: Person[]; nextCursor: PersonCursor | null }> {
  return searchPersonsPage(input);
}
