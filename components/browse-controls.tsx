"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { FILTERS, type Filter } from "@/lib/format";

export function BrowseControls({
  query,
  filter,
}: {
  query: string;
  filter: Filter;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(query);
  const [pending, startTransition] = useTransition();

  function push(next: { q?: string; filter?: Filter }) {
    const sp = new URLSearchParams(params.toString());
    const q = next.q ?? value;
    const f = next.filter ?? filter;
    if (q) sp.set("q", q);
    else sp.delete("q");
    if (f && f !== "todos") sp.set("filter", f);
    else sp.delete("filter");
    startTransition(() => router.push(`/?${sp.toString()}`, { scroll: false }));
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          push({ q: value });
        }}
        className="flex w-full items-center gap-2 rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5"
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
    </div>
  );
}
