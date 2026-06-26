"use client";

import { useActionState, useEffect, useState } from "react";
import { reportSighting, type ActionState } from "@/lib/actions";
import type { Sighting } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";

const initial: ActionState = { ok: false };

/**
 * Primary call-to-action on a person's profile: report an "avistamiento"
 * (sighting). Elegant brand-colored panel that expands into a short form.
 */
export function AvistamientoPanel({ personId }: { personId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(reportSighting, initial);

  return (
    <div className="overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/5 to-brand/10 p-6">
      <h3 className="flex items-center gap-2 text-base font-bold text-brand">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        ¿La viste?
      </h3>
      <p className="mt-1 text-sm text-ink/80">
        Si crees haber visto a esta persona, reporta un avistamiento. Cada pista
        ayuda a la familia a seguir el rastro.
      </p>

      {state.ok ? (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2.5 text-sm font-medium text-success">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Avistamiento registrado. ¡Gracias por colaborar!
        </p>
      ) : !open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          Reportar un avistamiento
        </button>
      ) : (
        <form action={action} className="mt-4 space-y-3">
          <input type="hidden" name="personId" value={personId} />
          <Field name="location" label="¿Dónde la viste?" placeholder="Lugar o punto de referencia" required />
          <Textarea name="note" label="¿Qué observaste?" placeholder="Describe la situación, hora, con quién estaba…" />
          <Field name="reporterName" label="Tu nombre" placeholder="Opcional" />
          <Field name="contact" label="Tu contacto" placeholder="Teléfono o correo (opcional)" />
          {state.error && (
            <p role="alert" className="text-sm font-medium text-flag-red">
              {state.error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {pending ? "Enviando…" : "Enviar avistamiento"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-black/5"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/**
 * Navy counter box with the number of sightings, plus a button that opens a
 * modal listing each avistamiento and the reporter's contact information.
 */
export function SightingsSummary({
  count,
  sightings,
}: {
  count: number;
  sightings: Sighting[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="rounded-2xl bg-navy p-6 text-center text-white">
      <div className="text-4xl font-extrabold tabular-nums">{count}</div>
      <div className="mt-1 text-sm text-white/80">avistamientos reportados</div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={count === 0}
        className="mt-4 w-full rounded-lg border border-white/25 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Ver detalles de avistamientos
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Detalles de avistamientos"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-t-2xl bg-white text-left text-ink shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h3 className="text-base font-bold text-ink">
                Avistamientos reportados ({count})
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-black/5"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="max-h-[70vh] divide-y divide-line overflow-y-auto">
              {sightings.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted">
                  Aún no hay avistamientos.
                </p>
              ) : (
                sightings.map((s) => (
                  <article key={s._id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-ink">{s.location ?? "Lugar no indicado"}</p>
                      <time className="shrink-0 text-xs text-muted">{formatDate(s.createdAt as unknown as string)}</time>
                    </div>
                    {s.note && <p className="mt-1 text-sm text-ink/80">{s.note}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span className="text-muted">
                        Reportado por:{" "}
                        <span className="font-medium text-ink">{s.reporterName ?? "Anónimo"}</span>
                      </span>
                      {s.contact && (
                        <a
                          href={
                            s.contact.includes("@")
                              ? `mailto:${s.contact}`
                              : `tel:${s.contact.replace(/[^\d+]/g, "")}`
                          }
                          className="font-semibold text-brand hover:underline"
                        >
                          {s.contact}
                        </a>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  name,
  label,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-left">
      <span className="mb-1 block text-xs font-semibold text-muted">
        {label} {required && <span className="text-flag-red">*</span>}
      </span>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}

function Textarea({ name, label, placeholder }: { name: string; label: string; placeholder?: string }) {
  return (
    <label className="block text-left">
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      <textarea
        name={name}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-y rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}
