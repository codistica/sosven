"use client";

import { useActionState, useState } from "react";
import { reportFound, reportSighting, type ActionState } from "@/lib/actions";

const initial: ActionState = { ok: false };

/** Red "¿Encontré a esta persona?" panel that opens a hallazgo form. */
export function FoundReportPanel({ personId }: { personId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(reportFound, initial);

  return (
    <div className="rounded-xl border border-flag-red/30 bg-flag-red/5 p-5">
      <h3 className="flex items-center gap-2 font-bold text-flag-red">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        ¿Encontré a esta persona?
      </h3>
      <p className="mt-1 text-sm text-ink/80">
        Si tienes información sobre su paradero, repórtalo. Nuestro equipo
        contactará a la familia para verificar.
      </p>

      {state.ok ? (
        <p className="mt-3 rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success">
          ¡Gracias! Tu reporte fue recibido y será verificado por el equipo SOSVEN.
        </p>
      ) : !open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 w-full rounded-lg bg-flag-red px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-alert-700"
        >
          Reportar Hallazgo
        </button>
      ) : (
        <form action={action} className="mt-4 space-y-3">
          <input type="hidden" name="personId" value={personId} />
          <Field name="location" label="¿Dónde la viste?" placeholder="Lugar o referencia" />
          <Textarea name="details" label="Detalles" placeholder="Describe lo que sabes…" />
          <Field name="contact" label="Tu contacto" placeholder="Teléfono o correo" />
          {state.error && (
            <p role="alert" className="text-sm text-flag-red">
              {state.error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-lg bg-flag-red px-4 py-2.5 text-sm font-semibold text-white hover:bg-alert-700 disabled:opacity-60"
            >
              {pending ? "Enviando…" : "Enviar reporte"}
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

/** Secondary "report a sighting" form. */
export function SightingPanel({ personId }: { personId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(reportSighting, initial);

  if (state.ok) {
    return (
      <p className="rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success">
        Avistamiento registrado. Gracias por colaborar.
      </p>
    );
  }

  return open ? (
    <form action={action} className="space-y-3 rounded-xl border border-line bg-white p-4">
      <input type="hidden" name="personId" value={personId} />
      <Field name="location" label="Lugar del avistamiento" placeholder="Dirección o referencia" />
      <Textarea name="note" label="Nota" placeholder="¿Qué observaste?" />
      <Field name="contact" label="Tu contacto (opcional)" placeholder="Teléfono o correo" />
      {state.error && <p className="text-sm text-flag-red">{state.error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Registrar avistamiento"}
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
  ) : (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="w-full rounded-lg border border-brand px-4 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
    >
      Reportar un avistamiento
    </button>
  );
}

function Field({ name, label, placeholder }: { name: string; label: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      <input
        name={name}
        placeholder={placeholder}
        className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}
function Textarea({ name, label, placeholder }: { name: string; label: string; placeholder?: string }) {
  return (
    <label className="block">
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
