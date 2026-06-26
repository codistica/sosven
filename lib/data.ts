import "server-only";
import type { FilterQuery } from "mongoose";
import { connectToDatabase, hasDatabase } from "./db";
import { PersonModel, SightingModel } from "./db/models";
import {
  MISSING_STATUSES,
  type Person,
  type PersonCursor,
  type PersonStatus,
  type Sighting,
} from "./db/schema";
import { samplePersons, sampleStats } from "./sample-data";
import { matchesFilter, type Filter } from "./format";
import { canonicalizeCedula } from "./cedula";

export type Stats = { desaparecidos: number; avistados: number; encontrados: number };

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
  const [desaparecidos, avistados, encontrados] = await Promise.all([
    PersonModel.countDocuments({ status: "desaparecido" }),
    PersonModel.countDocuments({ status: "avistado" }),
    PersonModel.countDocuments({ status: "encontrado" }),
  ]);
  return { desaparecidos, avistados, encontrados };
}

export const PERSONS_PAGE_SIZE = 24;

function resolveStatuses(status?: PersonStatus | PersonStatus[]): PersonStatus[] {
  if (!status) return MISSING_STATUSES;
  return Array.isArray(status) ? status : [status];
}

/**
 * A query containing 5+ digits is treated as a cédula and resolved by an exact
 * match on the canonical idDocument — served by the {idDocument:1} index, so
 * "search by cédula" is an indexed point lookup. Otherwise we substring-match
 * the name/city.
 */
function searchClause(query: string): FilterQuery<Person> {
  const digits = query.replace(/\D/g, "");
  if (digits.length >= 5) {
    return { idDocument: canonicalizeCedula(query) };
  }
  const rx = new RegExp(escapeRegex(query), "i");
  return { $or: [{ firstName: rx }, { lastName: rx }, { lastSeenCity: rx }] };
}

/** Mongo predicates shared by the page + count queries (cursor excluded). */
function personConds(
  query: string | undefined,
  filter: Filter,
  statuses: PersonStatus[],
): FilterQuery<Person>[] {
  const conds: FilterQuery<Person>[] = [{ status: { $in: statuses } }];
  if (query) conds.push(searchClause(query));
  if (filter === "hombres") conds.push({ gender: "masculino" });
  if (filter === "mujeres") conds.push({ gender: "femenino" });
  if (filter === "ninos") conds.push({ ageBand: "menor" });
  if (filter === "adultos") conds.push({ ageBand: "mayor" });
  return conds;
}

/** Same matching logic as `personConds`, for the no-database sample fallback. */
function samplePredicate(
  query: string | undefined,
  filter: Filter,
  statuses: PersonStatus[],
): (p: Person) => boolean {
  const q = query?.toLowerCase();
  return (p) => {
    if (!statuses.includes(p.status)) return false;
    if (!matchesFilter(p, filter)) return false;
    if (!q) return true;
    return (
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      (p.lastSeenCity ?? "").toLowerCase().includes(q) ||
      (p.idDocument ?? "").toLowerCase().includes(q)
    );
  };
}

/** Total matching persons — for the results heading. Index-backed count. */
export async function countPersons(opts: {
  query?: string;
  filter?: Filter;
  status?: PersonStatus | PersonStatus[];
}): Promise<number> {
  const query = opts.query?.trim();
  const filter = opts.filter ?? "todos";
  const statuses = resolveStatuses(opts.status);
  if (!hasDatabase) {
    return samplePersons.filter(samplePredicate(query, filter, statuses)).length;
  }
  await connectToDatabase();
  return PersonModel.countDocuments({ $and: personConds(query, filter, statuses) });
}

/**
 * Cursor-paginated directory query for infinite scroll. Keyset pagination on
 * (createdAt desc, _id desc) — no `skip`, so deep pages stay O(page) and ride
 * the compound indexes. Returns the next page plus the cursor for the page
 * after it (null when exhausted). Defaults to the "missing" scope.
 */
export async function searchPersonsPage(opts: {
  query?: string;
  filter?: Filter;
  status?: PersonStatus | PersonStatus[];
  cursor?: PersonCursor | null;
  limit?: number;
}): Promise<{ items: Person[]; nextCursor: PersonCursor | null }> {
  const query = opts.query?.trim();
  const filter = opts.filter ?? "todos";
  const statuses = resolveStatuses(opts.status);
  const cursor = opts.cursor ?? null;
  const limit = opts.limit ?? PERSONS_PAGE_SIZE;

  if (!hasDatabase) {
    const all = samplePersons.filter(samplePredicate(query, filter, statuses));
    const start = cursor ? all.findIndex((p) => p._id === cursor.id) + 1 : 0;
    const items = all.slice(start, start + limit);
    const last = items[items.length - 1];
    const more = start + limit < all.length;
    return {
      items: lean(items),
      nextCursor: more && last ? { t: String(last.createdAt), id: last._id } : null,
    };
  }

  await connectToDatabase();
  const conds = personConds(query, filter, statuses);
  if (cursor) {
    const t = new Date(cursor.t);
    conds.push({
      $or: [{ createdAt: { $lt: t } }, { createdAt: t, _id: { $lt: cursor.id } }],
    });
  }
  const docs = await PersonModel.find({ $and: conds })
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .lean<Person[]>()
    .exec();

  const hasMore = docs.length > limit;
  const items = lean(hasMore ? docs.slice(0, limit) : docs);
  const last = items[items.length - 1];
  return {
    items,
    nextCursor:
      hasMore && last ? { t: new Date(last.createdAt).toISOString(), id: last._id } : null,
  };
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

/** Synthetic sightings used only when no database is configured. */
function sampleSightings(personId: string): Sighting[] {
  const seed = parseInt(personId.replace(/\D/g, "").slice(0, 2) || "3", 10);
  const count = 1 + (seed % 3);
  const places = ["Plaza Bolívar, Caracas", "Terminal La Bandera", "Mercado de Quinta Crespo"];
  return Array.from({ length: count }, (_, i) => ({
    _id: `${personId}-s${i}`,
    personId,
    location: places[(seed + i) % places.length],
    note: "Creí reconocer a la persona caminando por la zona.",
    reporterName: i === 0 ? "Vecino del sector" : "Anónimo",
    contact: i === 0 ? "+58 412 0000000" : null,
    createdAt: new Date(Date.now() - (i + 1) * 86_400_000),
  }));
}

export async function getSightings(personId: string): Promise<Sighting[]> {
  if (!hasDatabase) return sampleSightings(personId);
  await connectToDatabase();
  const docs = await SightingModel.find({ personId })
    .sort({ createdAt: -1 })
    .lean<Sighting[]>()
    .exec();
  return lean(docs);
}

