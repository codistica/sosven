import mongoose, { Schema, type Model } from "mongoose";
import { randomUUID } from "crypto";
import type { FoundReport, Person, Sighting } from "./schema";

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
      enum: ["desaparecido", "encontrado"],
      default: "desaparecido",
      index: true,
    },

    reporterName: { type: String, default: null },
    reporterPhone: { type: String, default: null },
    reporterEmail: { type: String, default: null },
    reporterRelationship: { type: String, default: null },
  },
  { timestamps: true, collection: "persons" },
);

// Indexes that back search + the home filters.
PersonSchema.index({ lastSeenCity: 1 });
PersonSchema.index({ createdAt: -1 });
PersonSchema.index({ firstName: "text", lastName: "text", lastSeenCity: "text" });

const SightingSchema = new Schema<Sighting>(
  {
    _id: { type: String, default: () => randomUUID() },
    personId: { type: String, required: true, index: true },
    location: { type: String, default: null },
    note: { type: String, default: null },
    contact: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "sightings" },
);

const FoundReportSchema = new Schema<FoundReport>(
  {
    _id: { type: String, default: () => randomUUID() },
    personId: { type: String, required: true, index: true },
    location: { type: String, default: null },
    details: { type: String, default: null },
    contact: { type: String, default: null },
    status: {
      type: String,
      enum: ["pendiente", "verificado"],
      default: "pendiente",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "found_reports" },
);

export const PersonModel: Model<Person> =
  (mongoose.models.Person as Model<Person>) ||
  mongoose.model<Person>("Person", PersonSchema);

export const SightingModel: Model<Sighting> =
  (mongoose.models.Sighting as Model<Sighting>) ||
  mongoose.model<Sighting>("Sighting", SightingSchema);

export const FoundReportModel: Model<FoundReport> =
  (mongoose.models.FoundReport as Model<FoundReport>) ||
  mongoose.model<FoundReport>("FoundReport", FoundReportSchema);
