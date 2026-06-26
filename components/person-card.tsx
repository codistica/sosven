import Image from "next/image";
import Link from "next/link";
import type { Person } from "@/lib/db/schema";
import { ageLabel, fullName } from "@/lib/format";
import { StatusBadge } from "./status-badge";

export function PersonCard({ person }: { person: Person }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {person.photoUrl ? (
          <Image
            src={person.photoUrl}
            alt={fullName(person)}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-slate-300">
            <svg viewBox="0 0 24 24" className="h-12 w-12" fill="currentColor">
              <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-8 2.67-8 6v2h16v-2c0-3.33-2.67-6-8-6Z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold leading-tight text-ink">{fullName(person)}</h3>
        <dl className="space-y-1 text-sm text-muted">
          <div className="flex items-center gap-1.5">
            <CalendarIcon /> {ageLabel(person.age)}
          </div>
          {person.lastSeenCity && (
            <div className="flex items-center gap-1.5">
              <PinIcon /> {person.lastSeenCity}
            </div>
          )}
        </dl>

        <div className="mt-1">
          <StatusBadge person={person} />
        </div>

        <Link
          href={`/persona/${person._id}`}
          className="mt-3 inline-flex items-center justify-center rounded-md border border-brand px-3 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
        >
          Ver Perfil
        </Link>
      </div>
    </article>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18M8 2v4M16 2v4" strokeLinecap="round" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
