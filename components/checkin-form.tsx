"use client";

import { useActionState } from "react";
import { submitCheckIn, type ActionState } from "@/lib/actions";
import { CedulaField } from "./cedula-field";

const initial: ActionState = { ok: false };
const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20";

export function CheckinForm() {
  const [state, action, pending] = useActionState(submitCheckIn, initial);

  return (
    <form action={action} className="space-y-5 rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="firstName" label="Nombre" placeholder="Tu primer nombre" />
        <Field name="lastName" label="Apellido" placeholder="Tu apellido" />
      </div>
      <CedulaField name="idDocument" label="Número de cédula" required full />

      {state.ok ? (
        <p className="flex items-start gap-2 rounded-lg bg-success/10 px-4 py-3 text-sm font-medium text-success">
          <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {state.message}
        </p>
      ) : state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-flag-red/30 bg-flag-red/5 px-4 py-3 text-sm font-medium text-flag-red"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-success-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-success disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Confirmar que estoy a salvo"}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  placeholder,
}: {
  name: string;
  label: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">
        {label} <span className="text-flag-red">*</span>
      </span>
      <input name={name} required placeholder={placeholder} className={inputCls} />
    </label>
  );
}
