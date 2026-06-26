import mongoose, { Schema, type Model } from "mongoose";
import { randomUUID } from "crypto";
import type { CheckIn, Person, Sighting } from "./schema";

/**
 * Mongoose models for SOSVEN. We use a string `_id` (a generated UUID) so
 * /persona/:id URLs are stable and the sample-data IDs interoperate. The
 * `mongoose.models.X || mongoose.model(...)` guard prevents "OverwriteModelError"
 * during HMR / repeated imports in serverless.
 */

const PersonSchema = new Schema<Person>(
  {
    _id: { type: String, default: () => randomUUID() },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    age: { type: Number, default: null },
    ageBand: { type: String, default: null }, // "menor" | "adulto" | "mayor"
    gender: { type: String, default: "otro" }, // masculino | femenino | otro
    nationality: { type: String, default: "Venezolana" },
    idDocument: { type: String, default: null },

    heightCm: { type: Number, default: null },
    weightKg: { type: Number, default: null },
    build: { type: String, default: null },
    hairColor: { type: String, default: null },
    hairLength: { type: String, default: null },
    eyeColor: { type: String, default: null },
    skinTone: { type: String, default: null },
    distinguishingMarks: { type: String, default: null },

    lastSeenLocation: { type: String, default: null },
    lastSeenCity: { type: String, default: null },
    lastSeenDate: { type: String, default: null },
    circumstances: { type: String, default: null },

    photoUrl: { type: String, default: null },
    status: {
      type: String,
      enum: ["desaparecido", "avistado", "encontrado"],
      default: "desaparecido",
    },

    reporterName: { type: String, default: null },
    reporterPhone: { type: String, default: null },
    reporterEmail: { type: String, default: null },
    reporterRelationship: { type: String, default: null },
  },
  { timestamps: true, collection: "persons" },
);

/*
 * Read-optimized indexes for a high-traffic, deeply-scrolled directory.
 * The list is always scoped by status and sorted by `createdAt` desc with an
 * `_id` tiebreaker (keyset pagination), so each filter mode gets a compound
 * index whose prefix matches its predicate and whose suffix matches the sort —
 * letting Mongo serve both the filter and the ordering from the index.
 */
// Browse within a status (filter = Todos) + status counts for the hero stats.
PersonSchema.index({ status: 1, createdAt: -1, _id: -1 });
// Gender filter (Hombres / Mujeres).
PersonSchema.index({ status: 1, gender: 1, createdAt: -1, _id: -1 });
// Age filter (Niños / Adultos Mayores) — equality on the bucket so the index
// also satisfies the sort (no in-memory sort).
PersonSchema.index({ status: 1, ageBand: 1, createdAt: -1, _id: -1 });
// Exact cédula lookups: search-by-cédula + check-in identity matching.
PersonSchema.index({ idDocument: 1 });
// "Personas vistas cerca" by city.
PersonSchema.index({ lastSeenCity: 1 });

const SightingSchema = new Schema<Sighting>(
  {
    _id: { type: String, default: () => randomUUID() },
    personId: { type: String, required: true, index: true },
    location: { type: String, default: null },
    note: { type: String, default: null },
    reporterName: { type: String, default: null },
    contact: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "sightings" },
);

export const PersonModel: Model<Person> =
  (mongoose.models.Person as Model<Person>) ||
  mongoose.model<Person>("Person", PersonSchema);

const CheckInSchema = new Schema<CheckIn>(
  {
    _id: { type: String, default: () => randomUUID() },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    // Unique canonical cédula: one self-report per person, and a fast lookup
    // both here and when reconciling against incoming missing reports.
    idDocument: { type: String, required: true, unique: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "checkins" },
);

export const SightingModel: Model<Sighting> =
  (mongoose.models.Sighting as Model<Sighting>) ||
  mongoose.model<Sighting>("Sighting", SightingSchema);

export const CheckInModel: Model<CheckIn> =
  (mongoose.models.CheckIn as Model<CheckIn>) ||
  mongoose.model<CheckIn>("CheckIn", CheckInSchema);
