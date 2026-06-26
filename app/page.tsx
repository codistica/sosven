import { Suspense } from "react";
import Link from "next/link";
import { BrowseControls } from "@/components/browse-controls";
import { PersonCard } from "@/components/person-card";
import { Stat } from "@/components/stat";
import { getStats, searchPersons } from "@/lib/data";
import { FILTERS, type Filter } from "@/lib/format";

export const dynamic = "force-dynamic";

function asFilter(v: string | undefined): Filter {
  return FILTERS.some((f) => f.key === v) ? (v as Filter) : "todos";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";
  const filter = asFilter(sp.filter);

  const [stats, results] = await Promise.all([
    getStats(),
    searchPersons({ query, filter }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand to-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
            Ayúdanos a Reunir Familias
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/85 sm:text-lg">
            Busca y reporta personas desaparecidas tras el terremoto en Venezuela.
            Cada reporte acerca a una familia a su reencuentro.
          </p>

          <div className="mt-8 max-w-2xl">
            <Suspense fallback={<div className="h-14 rounded-xl bg-white/10" />}>
              <BrowseControls query={query} filter={filter} />
            </Suspense>
          </div>

          <div className="mt-8 flex gap-10">
            <Stat value={stats.desaparecidos} label="Desaparecidos" />
            <Stat value={stats.encontrados} label="Encontrados" />
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-bold text-ink">
            {query ? `Resultados para “${query}”` : "Personas reportadas"}
          </h2>
          <span className="text-sm text-muted">
            {results.length} {results.length === 1 ? "persona" : "personas"}
          </span>
        </div>

        {results.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-line bg-surface p-10 text-center">
            <p className="font-medium text-ink">No se encontraron personas.</p>
            <p className="mt-1 text-sm text-muted">
              Prueba con otro nombre o ciudad, o{" "}
              <Link href="/reportar" className="font-semibold text-brand hover:underline">
                reporta una desaparición
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {results.map((person) => (
              <PersonCard key={person._id} person={person} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
