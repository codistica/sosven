"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { FILTERS, type Filter } from "@/lib/format";

/** Shared router helper: update q / filter while preserving other params. */
function useNav(basePath: string) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function push(next: { q?: string; filter?: Filter }) {
    const sp = new URLSearchParams(params.toString());
    if (next.q !== undefined) {
      if (next.q) sp.set("q", next.q);
      else sp.delete("q");
    }
    if (next.filter !== undefined) {
      if (next.filter && next.filter !== "todos") sp.set("filter", next.filter);
      else sp.delete("filter");
    }
    const qs = sp.toString();
    startTransition(() => router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false }));
  }

  return { push, pending };
}

/** Search box — lives in the hero. */
export function SearchBar({
  query,
  basePath = "/",
}: {
  query: string;
  basePath?: string;
}) {
  const { push, pending } = useNav(basePath);
  const [value, setValue] = useState(query);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        push({ q: value });
      }}
      className="flex w-full items-center gap-2 rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5"
      style={{
        boxShadow: "0 4px 15px 5px #00000080",
      }}
    >
      <span className="pl-2 text-slate-400">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar por nombre, cédula o ciudad…"
        aria-label="Buscar persona"
        className="min-w-0 flex-1 bg-transparent px-1 py-2 text-ink outline-none placeholder:text-slate-400"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        Buscar
      </button>
    </form>
  );
}

/** Filter pills — placed above the results list. */
export function FilterPills({
  filter,
  basePath = "/",
}: {
  filter: Filter;
  basePath?: string;
}) {
  const { push } = useNav(basePath);

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => {
        const active = f.key === filter;
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => push({ filter: f.key })}
            aria-pressed={active}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-navy text-white"
                : "bg-white text-ink ring-1 ring-line hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
