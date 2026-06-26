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

export type PersonStatus = "desaparecido" | "encontrado";

export interface Person {
  _id: string;

  // Identity
  firstName: string;
  lastName: string;
  age: number | null;
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
  contact: string | null;
  createdAt: Date;
}

export interface FoundReport {
  _id: string;
  personId: string;
  location: string | null;
  details: string | null;
  contact: string | null;
  status: "pendiente" | "verificado";
  createdAt: Date;
}

export const COLLECTIONS = {
  persons: "persons",
  sightings: "sightings",
  foundReports: "found_reports",
} as const;
