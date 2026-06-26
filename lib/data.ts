import "server-only";
import type { FilterQuery } from "mongoose";
import { connectToDatabase, hasDatabase } from "./db";
import { PersonModel, SightingModel, FoundReportModel } from "./db/models";
import type { Person } from "./db/schema";
import { samplePersons, sampleStats } from "./sample-data";
import { matchesFilter, type Filter } from "./format";

export type Stats = { desaparecidos: number; encontrados: number };

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Return lean Person docs as plain, serializable objects. */
function lean<T>(docs: T[]): T[] {
  return JSON.parse(JSON.stringify(docs)) as T[];
}

/** Aggregate counts for the hero stat counters. */
export async function getStats(): Promise<Stats> {
  if (!hasDatabase) return sampleStats;
  await connectToDatabase();
  const [desaparecidos, encontrados] = await Promise.all([
    PersonModel.countDocuments({ status: "desaparecido" }),
    PersonModel.countDocuments({ status: "encontrado" }),
  ]);
  return { desaparecidos, encontrados };
}

/** Browse / search the missing-persons directory. */
export async function searchPersons(opts: {
  query?: string;
  filter?: Filter;
}): Promise<Person[]> {
  const query = opts.query?.trim();
  const filter = opts.filter ?? "todos";

  if (!hasDatabase) {
    return samplePersons.filter((p) => {
      if (!matchesFilter(p, filter)) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        (p.lastSeenCity ?? "").toLowerCase().includes(q) ||
        (p.idDocument ?? "").toLowerCase().includes(q)
      );
    });
  }

  await connectToDatabase();
  const conds: FilterQuery<Person>[] = [];

  if (query) {
    const rx = new RegExp(escapeRegex(query), "i");
    conds.push({
      $or: [{ firstName: rx }, { lastName: rx }, { lastSeenCity: rx }, { idDocument: rx }],
    });
  }
  if (filter === "hombres") conds.push({ gender: "masculino" });
  if (filter === "mujeres") conds.push({ gender: "femenino" });
  if (filter === "ninos") conds.push({ age: { $lt: 18 } });
  if (filter === "adultos") conds.push({ age: { $gte: 60 } });

  const where: FilterQuery<Person> = conds.length ? { $and: conds } : {};
  const docs = await PersonModel.find(where)
    .sort({ createdAt: -1 })
    .limit(60)
    .lean<Person[]>()
    .exec();
  return lean(docs);
}

export async function getPerson(id: string): Promise<Person | null> {
  if (!hasDatabase) return samplePersons.find((p) => p._id === id) ?? null;
  await connectToDatabase();
  const doc = await PersonModel.findById(id).lean<Person>().exec();
  return doc ? lean([doc])[0] : null;
}

/** Other missing people last seen in the same city ("Personas Vistas Cerca"). */
export async function getNearbyPersons(person: Person, limit = 3): Promise<Person[]> {
  if (!hasDatabase) {
    return samplePersons
      .filter((p) => p._id !== person._id && p.lastSeenCity === person.lastSeenCity)
      .slice(0, limit);
  }
  if (!person.lastSeenCity) return [];
  await connectToDatabase();
  const docs = await PersonModel.find({
    lastSeenCity: person.lastSeenCity,
    _id: { $ne: person._id },
  })
    .limit(limit)
    .lean<Person[]>()
    .exec();
  return lean(docs);
}

export async function getSightingCount(personId: string): Promise<number> {
  if (!hasDatabase) {
    return 8 + (parseInt(personId.replace(/\D/g, "").slice(0, 2) || "4", 10) % 12);
  }
  await connectToDatabase();
  return SightingModel.countDocuments({ personId });
}

export async function getFoundCount(personId: string): Promise<number> {
  if (!hasDatabase) return 0;
  await connectToDatabase();
  return FoundReportModel.countDocuments({ personId });
}
