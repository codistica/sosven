"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { connectToDatabase, hasDatabase } from "./db";
import { PersonModel, SightingModel, FoundReportModel } from "./db/models";
import { uploadPhoto } from "./blob";

const REQUIRE_DB =
  "La base de datos no está configurada. Define MONGODB_URI para guardar reportes.";

function str(v: FormDataEntryValue | null): string | undefined {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : undefined;
}
function num(v: FormDataEntryValue | null): number | undefined {
  const s = str(v);
  if (s === undefined) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

const reportSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().min(1, "El apellido es obligatorio"),
  lastSeenDate: z.string().min(1, "La fecha de desaparición es obligatoria"),
});

export type ActionState = { ok: boolean; error?: string; id?: string };

/** Create a missing-person report from the multi-panel form. */
export async function createReport(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = reportSchema.safeParse({
    firstName: str(formData.get("firstName")) ?? "",
    lastName: str(formData.get("lastName")) ?? "",
    lastSeenDate: str(formData.get("lastSeenDate")) ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  if (!hasDatabase) return { ok: false, error: REQUIRE_DB };

  let photoUrl: string | null = null;
  try {
    photoUrl = await uploadPhoto(formData.get("photo") as File | null);
  } catch {
    photoUrl = null; // Non-fatal: keep the report even if the upload fails.
  }

  await connectToDatabase();
  const doc = await PersonModel.create({
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    age: num(formData.get("age")) ?? null,
    gender: str(formData.get("gender")) ?? "otro",
    nationality: str(formData.get("nationality")) ?? "Venezolana",
    idDocument: str(formData.get("idDocument")) ?? null,
    heightCm: num(formData.get("heightCm")) ?? null,
    weightKg: num(formData.get("weightKg")) ?? null,
    build: str(formData.get("build")) ?? null,
    hairColor: str(formData.get("hairColor")) ?? null,
    hairLength: str(formData.get("hairLength")) ?? null,
    eyeColor: str(formData.get("eyeColor")) ?? null,
    skinTone: str(formData.get("skinTone")) ?? null,
    distinguishingMarks: str(formData.get("distinguishingMarks")) ?? null,
    lastSeenLocation: str(formData.get("lastSeenLocation")) ?? null,
    lastSeenCity: str(formData.get("lastSeenCity")) ?? null,
    lastSeenDate: parsed.data.lastSeenDate,
    circumstances: str(formData.get("circumstances")) ?? null,
    photoUrl,
    reporterName: str(formData.get("reporterName")) ?? null,
    reporterPhone: str(formData.get("reporterPhone")) ?? null,
    reporterEmail: str(formData.get("reporterEmail")) ?? null,
    reporterRelationship: str(formData.get("reporterRelationship")) ?? null,
  });

  revalidatePath("/");
  redirect(`/persona/${doc._id}?nuevo=1`);
}

/** Report a sighting (avistamiento) for a person. */
export async function reportSighting(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const personId = str(formData.get("personId"));
  if (!personId) return { ok: false, error: "Falta el identificador de la persona" };
  if (!hasDatabase) return { ok: false, error: REQUIRE_DB };

  await connectToDatabase();
  await SightingModel.create({
    personId,
    location: str(formData.get("location")) ?? null,
    note: str(formData.get("note")) ?? null,
    contact: str(formData.get("contact")) ?? null,
  });
  revalidatePath(`/persona/${personId}`);
  return { ok: true };
}

/** Report having found a person (reporte de hallazgo). */
export async function reportFound(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const personId = str(formData.get("personId"));
  if (!personId) return { ok: false, error: "Falta el identificador de la persona" };
  if (!hasDatabase) return { ok: false, error: REQUIRE_DB };

  await connectToDatabase();
  await FoundReportModel.create({
    personId,
    location: str(formData.get("location")) ?? null,
    details: str(formData.get("details")) ?? null,
    contact: str(formData.get("contact")) ?? null,
  });
  revalidatePath(`/persona/${personId}`);
  return { ok: true };
}
