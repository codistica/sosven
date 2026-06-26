import type { Person } from "./db/schema";

export type Filter = "todos" | "hombres" | "mujeres" | "ninos" | "adultos";

export const FILTERS: { key: Filter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "hombres", label: "Hombres" },
  { key: "mujeres", label: "Mujeres" },
  { key: "ninos", label: "Niños" },
  { key: "adultos", label: "Adultos Mayores" },
];

/** Whole days between the last-seen date and today. */
export function daysSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const then = new Date(dateStr);
  if (Number.isNaN(then.getTime())) return null;
  const ms = Date.now() - then.getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export function disappearedLabel(person: Pick<Person, "lastSeenDate">): string {
  const d = daysSince(person.lastSeenDate);
  if (d === null) return "Desaparecido";
  if (d === 0) return "Desaparecido hoy";
  if (d === 1) return "Desaparecido hace 1 día";
  return `Desaparecido hace ${d} días`;
}

export function fullName(p: Pick<Person, "firstName" | "lastName">): string {
  return `${p.firstName} ${p.lastName}`.trim();
}

export function ageLabel(age: number | null | undefined): string {
  return age == null ? "Edad desconocida" : `${age} años`;
}

export function matchesFilter(p: Person, filter: Filter): boolean {
  switch (filter) {
    case "hombres":
      return p.gender === "masculino";
    case "mujeres":
      return p.gender === "femenino";
    case "ninos":
      return p.age != null && p.age < 18;
    case "adultos":
      return p.age != null && p.age >= 60;
    default:
      return true;
  }
}

const fmt = new Intl.DateTimeFormat("es-VE", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "Sin fecha";
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? "Sin fecha" : fmt.format(d);
}
