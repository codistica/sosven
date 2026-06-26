/**
 * MongoDB document shapes for SOSVEN. Mongo is schemaless, so these are plain
 * TypeScript interfaces used to type the collections. We use a string `_id`
 * (a UUID we generate) so URLs like /persona/:id stay clean and stable.
 *
 * Home-page filters map onto `gender` + `age`:
 *   Hombres -> gender = 'masculino'
 *   Mujeres -> gender = 'femenino'
 *   Niños   -> age < 18
 *   Adultos Mayores -> age >= 60
 */

export type PersonStatus = "desaparecido" | "avistado" | "encontrado";

/** Statuses that still count as "missing" (shown in the main directory). */
export const MISSING_STATUSES: PersonStatus[] = ["desaparecido", "avistado"];

export interface Person {
  _id: string;

  // Identity
  firstName: string;
  lastName: string;
  age: number | null;
  ageBand?: "menor" | "adulto" | "mayor" | null; // derived from age, for fast filtering
  gender: string; // masculino | femenino | otro
  nationality: string | null;
  idDocument: string | null; // cédula

  // Physical description
  heightCm: number | null;
  weightKg: number | null;
  build: string | null; // complexión
  hairColor: string | null;
  hairLength: string | null;
  eyeColor: string | null;
  skinTone: string | null;
  distinguishingMarks: string | null; // señas particulares

  // Disappearance
  lastSeenLocation: string | null;
  lastSeenCity: string | null;
  lastSeenDate: string | null; // ISO yyyy-mm-dd
  circumstances: string | null;

  // Media + status
  photoUrl: string | null;
  status: PersonStatus;

  // Person filing the report (contact)
  reporterName: string | null;
  reporterPhone: string | null;
  reporterEmail: string | null;
  reporterRelationship: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface Sighting {
  _id: string;
  personId: string;
  location: string | null;
  note: string | null;
  reporterName: string | null;
  contact: string | null;
  createdAt: Date;
}

/**
 * Well-being self-report ("estoy a salvo"). One per cédula. If a person checks
 * in before anyone files a missing report for them, the eventual report is
 * created already marked `encontrado`.
 */
export interface CheckIn {
  _id: string;
  firstName: string;
  lastName: string;
  idDocument: string; // canonical cédula, e.g. "V-12.345.678"
  createdAt: Date;
}

/** Keyset-pagination cursor: last item's createdAt + _id tiebreaker. */
export type PersonCursor = { t: string; id: string };

export const COLLECTIONS = {
  persons: "persons",
  sightings: "sightings",
  checkins: "checkins",
} as const;
