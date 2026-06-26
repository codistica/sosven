/**
 * Seed the SOSVEN database with randomly generated missing-person reports.
 *
 *   npm run db:seed -- <count>          e.g. npm run db:seed -- 500
 *   npm run db:seed -- --count 500
 *   npm run db:seed -- 500 --fresh      wipe the persons collection first
 *
 * Count is unbounded (default 50). Each report is composed from the fixed sets
 * below: two given names + two surnames, a random V-cédula, age 18–70, random
 * gender, body description, city, address, photo and reporter contact.
 *
 * Requires MONGODB_URI (and optionally MONGODB_DB) in .env.local or the env.
 */
import "dotenv/config";
import { randomUUID } from "crypto";
import mongoose from "mongoose";
import { connectToDatabase } from "./index";
import { PersonModel } from "./models";
import { ageBand } from "../format";
import { canonicalizeCedula } from "../cedula";
import type { Person, PersonStatus } from "./schema";

// ── Fixed sets (50 each where the task calls for it) ────────────────────────

const MALE_NAMES = [
  "José", "Juan", "Carlos", "Luis", "Miguel", "Pedro", "Jesús", "Manuel", "Rafael",
  "Francisco", "Antonio", "Daniel", "David", "Andrés", "Gabriel", "Alejandro",
  "Ricardo", "Eduardo", "Fernando", "Jorge", "Víctor", "Ángel", "Óscar", "Héctor", "Simón",
];

const FEMALE_NAMES = [
  "María", "Ana", "Carmen", "Rosa", "Luisa", "Gabriela", "Daniela", "Andrea",
  "Valentina", "Isabel", "Patricia", "Marbella", "Yolanda", "Mariana", "Elena",
  "Carolina", "Beatriz", "Mónica", "Teresa", "Verónica", "Adriana", "Gloria",
  "Nancy", "Yusmary", "Oriana",
];

// 50 names total (25 + 25).
const ALL_NAMES = [...MALE_NAMES, ...FEMALE_NAMES];

const SURNAMES = [
  "González", "Rodríguez", "Pérez", "García", "Hernández", "López", "Martínez",
  "Sánchez", "Ramírez", "Torres", "Flores", "Rivas", "Gómez", "Díaz", "Reyes",
  "Morales", "Cruz", "Ortiz", "Castillo", "Romero", "Suárez", "Mendoza", "Guerrero",
  "Medina", "Aguilar", "Vargas", "Rojas", "Marcano", "Blanco", "Bermúdez",
  "Carvajal", "Delgado", "Escalante", "Fonseca", "Guzmán", "Herrera", "Jiménez",
  "Lara", "Moreno", "Navarro", "Ochoa", "Paredes", "Quintero", "Salazar", "Tovar",
  "Urbina", "Velásquez", "Zambrano", "Acosta", "Bravo",
];

const CITIES = [
  "Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Ciudad Guayana",
  "Maturín", "Barcelona", "Cumaná", "Mérida", "San Cristóbal", "Barinas", "Cabimas",
  "Puerto La Cruz", "Petare", "Turmero", "Ciudad Bolívar", "Guarenas", "Los Teques",
  "Punto Fijo", "Acarigua", "Guacara", "Coro", "Carúpano", "El Tigre", "Cabudare",
  "Guanare", "Valera", "Charallave", "La Victoria", "Ocumare del Tuy", "Tucupita",
  "San Felipe", "Carora", "Anaco", "San Fernando de Apure", "Porlamar", "Calabozo",
  "Yaritagua", "Táriba", "Villa de Cura", "El Vigía", "Santa Teresa del Tuy", "Cúa",
  "Trujillo", "San Juan de los Morros", "Upata", "Machiques", "Quíbor", "Zaraza",
];

const ADDRESSES = [
  "Av. Bolívar, Sector Centro", "Calle Páez, Urb. La Floresta", "Av. Sucre, Sector El Calvario",
  "Calle Comercio, frente a la plaza", "Av. Libertador, Edif. Aurora", "Sector La Pastora, Calle Real",
  "Urb. Las Acacias, Calle 3", "Av. Universidad, cerca del mercado", "Barrio El Carmen, Callejón San José",
  "Av. Intercomunal, parada La Línea", "Calle Miranda, casa 24", "Sector Los Mangos, vereda 5",
  "Av. Principal de El Recreo", "Urb. Andrés Bello, Bloque 7", "Calle Zamora, Sector Pueblo Nuevo",
  "Av. Las Delicias, C.C. Paseo", "Barrio Unión, Calle Ppal.", "Sector La Coromoto, Manzana 12",
  "Av. Fuerzas Armadas, Esq. Sur", "Calle El Sol, Res. Las Palmas", "Urb. Santa Mónica, Calle B",
  "Av. Rómulo Gallegos, frente al liceo", "Sector San Rafael, Calle 8", "Barrio Bolívar, vereda 3",
  "Av. Casanova, Sabana Grande", "Calle Bermúdez, Sector Centro", "Urb. El Marqués, 5ta transversal",
  "Av. Páez, El Paraíso", "Sector La Trinidad, Calle Vargas", "Calle Ayacucho, Casco Histórico",
  "Av. Lara, frente al hospital", "Urb. Base Aragua, vereda 22", "Barrio 23 de Enero, Bloque 5",
  "Av. Michelena, Sector Camoruco", "Calle Carabobo, esquina Industria", "Sector Las Flores, Calle 1",
  "Av. Andrés Eloy Blanco", "Urb. La Isabelica, Sector 9", "Barrio José Félix Ribas, Zona 4",
  "Av. Constitución, Terminal Sur", "Calle Bolívar con Plaza", "Sector El Tigrito, vía principal",
  "Av. Cedeño, frente al CDI", "Urb. Negro Primero, Calle 2", "Barrio Brisas del Lago, vereda 9",
  "Av. 5 de Julio, centro", "Calle La Paz, Sector Pueblo Arriba", "Urb. Fundación Mendoza, Calle C",
  "Av. Aeropuerto, Sector La Pista", "Sector El Cementerio, Calle Final",
];

// 50 portraits split by gender so faces match the chosen sex.
const MEN_PHOTOS = Array.from({ length: 25 }, (_, i) => `https://randomuser.me/api/portraits/men/${i}.jpg`);
const WOMEN_PHOTOS = Array.from({ length: 25 }, (_, i) => `https://randomuser.me/api/portraits/women/${i}.jpg`);

const BUILDS = ["Delgada", "Media", "Atlética", "Robusta"];
const HAIR_COLORS = ["Negro", "Castaño", "Rubio", "Canoso", "Pelirrojo"];
const HAIR_LENGTHS = ["Corto", "Medio", "Largo", "Calvo"];
const EYE_COLORS = ["Marrón", "Negro", "Verde", "Azul", "Miel", "Gris"];
const SKIN_TONES = ["Clara", "Trigueña", "Morena", "Oscura"];
const RELATIONSHIPS = ["Madre", "Padre", "Hermano", "Hermana", "Hijo", "Hija", "Esposo", "Esposa", "Tío", "Tía", "Amigo", "Vecino", "Primo"];
const MARKS = [
  "Cicatriz pequeña en el rostro.", "Tatuaje en el antebrazo.", "Usa lentes.",
  "Lunar visible en la mejilla.", "Cicatriz en la rodilla.", "Usa audífono.",
  "Tatuaje en el cuello.", null, null, null,
];
const CIRCUMSTANCES = [
  "Visto por última vez tras el sismo.", "Se separó de su familia durante la evacuación.",
  "No regresó a casa después del temblor.", "Desorientado tras el terremoto.",
  "Se perdió entre la multitud.", "No se ha sabido de él/ella desde el día del sismo.",
];
const STATUSES: { value: PersonStatus; weight: number }[] = [
  { value: "desaparecido", weight: 0.7 },
  { value: "avistado", weight: 0.2 },
  { value: "encontrado", weight: 0.1 },
];

// ── Random helpers ──────────────────────────────────────────────────────────

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function pickTwo<T>(arr: T[]): [T, T] {
  const a = pick(arr);
  let b = pick(arr);
  while (b === a && arr.length > 1) b = pick(arr);
  return [a, b];
}

function weightedStatus(): PersonStatus {
  let r = Math.random();
  for (const s of STATUSES) {
    if (r < s.weight) return s.value;
    r -= s.weight;
  }
  return "desaparecido";
}

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function randomCedula(): string {
  return canonicalizeCedula(`V${randInt(3_000_000, 30_000_000)}`);
}

function randomPhone(): string {
  return `0${pick(["412", "414", "416", "424", "426"])}-${randInt(1_000_000, 9_999_999)}`;
}

function makePerson(): Person {
  const gender = (() => {
    const r = Math.random();
    return r < 0.48 ? "masculino" : r < 0.96 ? "femenino" : "otro";
  })();

  const namePool = gender === "masculino" ? MALE_NAMES : gender === "femenino" ? FEMALE_NAMES : ALL_NAMES;
  const [n1, n2] = pickTwo(namePool);
  const [s1, s2] = pickTwo(SURNAMES);
  const photoPool = gender === "femenino" ? WOMEN_PHOTOS : gender === "masculino" ? MEN_PHOTOS : pick([MEN_PHOTOS, WOMEN_PHOTOS]);

  const age = randInt(18, 70);
  const createdAt = new Date(Date.now() - randInt(0, 60) * 86_400_000);
  const reporter = `${pick(ALL_NAMES)} ${pick(SURNAMES)}`;

  return {
    _id: randomUUID(),
    firstName: `${n1} ${n2}`,
    lastName: `${s1} ${s2}`,
    age,
    ageBand: ageBand(age),
    gender,
    nationality: "Venezolana",
    idDocument: randomCedula(),
    heightCm: randInt(150, 195),
    weightKg: randInt(45, 110),
    build: pick(BUILDS),
    hairColor: pick(HAIR_COLORS),
    hairLength: pick(HAIR_LENGTHS),
    eyeColor: pick(EYE_COLORS),
    skinTone: pick(SKIN_TONES),
    distinguishingMarks: pick(MARKS),
    lastSeenLocation: pick(ADDRESSES),
    lastSeenCity: pick(CITIES),
    lastSeenDate: isoDaysAgo(randInt(0, 45)),
    circumstances: pick(CIRCUMSTANCES),
    photoUrl: pick(photoPool),
    status: weightedStatus(),
    reporterName: reporter,
    reporterPhone: randomPhone(),
    reporterEmail: `${n1}.${s1}@example.com`.toLowerCase().replace(/[^a-z.@]/g, ""),
    reporterRelationship: pick(RELATIONSHIPS),
    createdAt,
    updatedAt: createdAt,
  };
}

// ── CLI ─────────────────────────────────────────────────────────────────────

function parseArgs(argv: string[]): { count: number; fresh: boolean } {
  const fresh = argv.includes("--fresh");
  const flagIdx = argv.findIndex((a) => a === "--count" || a === "-n");
  let count = NaN;
  if (flagIdx >= 0) count = parseInt(argv[flagIdx + 1], 10);
  else {
    const positional = argv.find((a) => /^\d+$/.test(a));
    if (positional) count = parseInt(positional, 10);
  }
  if (!Number.isFinite(count) || count <= 0) count = 1000;
  return { count, fresh };
}

const BATCH = 1000;

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local before seeding.");
  }
  const { count, fresh } = parseArgs(process.argv.slice(2));
  await connectToDatabase();

  if (fresh) {
    const { deletedCount } = await PersonModel.deleteMany({});
    console.log(`Wiped ${deletedCount} existing personas (--fresh).`);
  }

  // Insert through the raw driver so our randomized createdAt is preserved
  // (Mongoose's timestamps would otherwise overwrite it with "now").
  type InsertDocs = Parameters<typeof PersonModel.collection.insertMany>[0];
  let inserted = 0;
  while (inserted < count) {
    const size = Math.min(BATCH, count - inserted);
    const batch = Array.from({ length: size }, makePerson);
    await PersonModel.collection.insertMany(batch as unknown as InsertDocs);
    inserted += size;
    console.log(`  …${inserted}/${count}`);
  }

  await PersonModel.syncIndexes();
  console.log(`Seeded ${count} personas into "${mongoose.connection.name}".`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
