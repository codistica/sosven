import type { Person } from "@/lib/db/schema";
import { disappearedLabel } from "@/lib/format";

/** Red "Desaparecido hace N días" / green "Encontrado" pill. */
export function StatusBadge({
  person,
  className = "",
}: {
  person: Pick<Person, "status" | "lastSeenDate">;
  className?: string;
}) {
  if (person.status === "encontrado") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-success ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Encontrado
      </span>
    );
  }
  if (person.status === "avistado") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-flag-yellow px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-navy ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-navy/80" />
        Avistado
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-flag-red px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
      {disappearedLabel(person)}
    </span>
  );
}
