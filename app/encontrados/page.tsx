import { Suspense } from "react";
import type { Metadata } from "next";
import { FilterPills, SearchBar } from "@/components/browse-controls";
import { InfinitePersonList } from "@/components/infinite-person-list";
import { countPersons, searchPersonsPage } from "@/lib/data";
import { FILTERS, type Filter } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Personas Encontradas · SOSVEN",
  description:
    "Personas reportadas como desaparecidas que ya han sido encontradas tras el terremoto en Venezuela.",
};

function asFilter(v: string | undefined): Filter {
  return FILTERS.some((f) => f.key === v) ? (v as Filter) : "todos";
}

export default async function EncontradosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";
  const filter = asFilter(sp.filter);

  const [page, total] = await Promise.all([
    searchPersonsPage({ query, filter, status: "encontrado" }),
    countPersons({ query, filter, status: "encontrado" }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-success-600 via-success to-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            Reencuentros
          </span>
          <h1 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">
            Personas Encontradas
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/85 sm:text-lg">
            Estas personas, reportadas como desaparecidas, ya se han reencontrado
            con sus familias. Cada nombre aquí es una buena noticia.
          </p>

          <div className="mt-8 max-w-2xl">
            <Suspense fallback={<div className="h-14 rounded-xl bg-white/10" />}>
              <SearchBar query={query} basePath="/encontrados" />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-bold text-ink">
            {query ? `Resultados para “${query}”` : "Personas encontradas"}
          </h2>
          <span className="text-sm text-muted">
            {total} {total === 1 ? "persona" : "personas"}
          </span>
        </div>

        <div className="mt-4">
          <Suspense fallback={<div className="h-9" />}>
            <FilterPills filter={filter} basePath="/encontrados" />
          </Suspense>
        </div>

        <div className="mt-6">
          <InfinitePersonList
            key={`encontrado|${query}|${filter}`}
            initialItems={page.items}
            initialCursor={page.nextCursor}
            query={query}
            filter={filter}
            status="encontrado"
            emptyState={
              <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
                <p className="font-medium text-ink">Aún no hay personas encontradas registradas.</p>
                <p className="mt-1 text-sm text-muted">
                  Cuando una búsqueda tenga un final feliz, aparecerá aquí.
                </p>
              </div>
            }
          />
        </div>
      </section>
    </div>
  );
}
