import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PersonCard } from "@/components/person-card";
import { StatusBadge } from "@/components/status-badge";
import { FoundReportPanel, SightingPanel } from "@/components/person-actions";
import { ShareRow } from "@/components/share-row";
import { getNearbyPersons, getPerson, getSightingCount } from "@/lib/data";
import { ageLabel, formatDate, fullName } from "@/lib/format";

export const dynamic = "force-dynamic";

const GENDER_LABEL: Record<string, string> = {
  masculino: "Masculino",
  femenino: "Femenino",
  otro: "Otro",
};

export default async function PersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nuevo?: string }>;
}) {
  const { id } = await params;
  const { nuevo } = await searchParams;
  const person = await getPerson(id);
  if (!person) notFound();

  const [nearby, sightings] = await Promise.all([
    getNearbyPersons(person),
    getSightingCount(person._id),
  ]);

  const physical: [string, string | null][] = [
    ["Estatura", person.heightCm ? `${person.heightCm} cm` : null],
    ["Peso", person.weightKg ? `${person.weightKg} kg` : null],
    ["Complexión", person.build],
    ["Color de cabello", person.hairColor],
    ["Largo de cabello", person.hairLength],
    ["Color de ojos", person.eyeColor],
    ["Tono de piel", person.skinTone],
  ];
  const personal: [string, string | null][] = [
    ["Cédula de identidad", person.idDocument],
    ["Nacionalidad", person.nationality],
    ["Última localización conocida", person.lastSeenLocation],
    ["Ciudad", person.lastSeenCity],
    ["Fecha de desaparición", formatDate(person.lastSeenDate)],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="text-sm text-muted">
        <Link href="/" className="hover:text-brand">Inicio</Link>
        <span className="px-1.5">/</span>
        <Link href="/" className="hover:text-brand">Personas Desaparecidas</Link>
        <span className="px-1.5">/</span>
        <span className="text-ink">{fullName(person)}</span>
      </nav>

      {nuevo && (
        <div className="mt-4 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success">
          Reporte publicado. Gracias por ayudar a difundir la búsqueda — comparte
          este perfil para llegar a más personas.
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            <div className="relative aspect-[16/10] w-full bg-slate-100">
              {person.photoUrl ? (
                <Image
                  src={person.photoUrl}
                  alt={fullName(person)}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 640px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="p-6">
              <StatusBadge person={person} />
              <h1 className="mt-3 text-2xl font-extrabold text-ink sm:text-3xl">
                {fullName(person)}
              </h1>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <Chip>{ageLabel(person.age)}</Chip>
                <Chip>{GENDER_LABEL[person.gender] ?? "—"}</Chip>
                {person.lastSeenCity && <Chip>{person.lastSeenCity}</Chip>}
              </div>
            </div>
          </div>

          <Section title="Información Personal">
            <DataGrid rows={personal} />
          </Section>

          <Section title="Descripción Física">
            <DataGrid rows={physical} />
            {person.distinguishingMarks && (
              <div className="mt-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Señas particulares
                </dt>
                <dd className="mt-1 text-sm text-ink">{person.distinguishingMarks}</dd>
              </div>
            )}
          </Section>

          {person.circumstances && (
            <Section title="Circunstancias de la Desaparición">
              <p className="text-sm leading-relaxed text-ink">{person.circumstances}</p>
            </Section>
          )}

          {nearby.length > 0 && (
            <Section title="Personas Vistas Cerca">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {nearby.map((p) => (
                  <PersonCard key={p._id} person={p} />
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="rounded-2xl bg-navy p-6 text-center text-white">
            <div className="text-4xl font-extrabold tabular-nums">{sightings}</div>
            <div className="mt-1 text-sm text-white/80">avistamientos reportados</div>
          </div>

          <FoundReportPanel personId={person._id} />

          <div className="rounded-xl border border-line bg-white p-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-muted">
              Contacto del reportante
            </h3>
            <p className="mt-2 font-semibold text-ink">{person.reporterName ?? "SOSVEN"}</p>
            {person.reporterRelationship && (
              <p className="text-sm text-muted">{person.reporterRelationship}</p>
            )}
            {person.reporterPhone && (
              <a
                href={`tel:${person.reporterPhone.replace(/[^\d+]/g, "")}`}
                className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-success-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-success"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.6c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1l-2.3 2.2Z" />
                </svg>
                Llamar Ahora
              </a>
            )}
          </div>

          <div className="rounded-xl border border-line bg-white p-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-muted">
              Compartir perfil
            </h3>
            <ShareRow name={fullName(person)} />
          </div>

          <SightingPanel personId={person._id} />
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-surface px-3 py-1 font-medium text-ink ring-1 ring-line">
      {children}
    </span>
  );
}
function DataGrid({ rows }: { rows: [string, string | null][] }) {
  const visible = rows.filter(([, v]) => v);
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {visible.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
          <dd className="mt-0.5 text-sm text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
