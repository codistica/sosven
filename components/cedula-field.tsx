"use client";

import { useState } from "react";
import { formatCedula } from "@/lib/cedula";

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20";

/**
 * Masked cédula input: formats to "V-12.345.678" as the user types so the value
 * is always well-formed before it ever reaches the server.
 */
export function CedulaField({
  name,
  label,
  required,
  defaultValue = "",
  full,
}: {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  full?: boolean;
}) {
  const [value, setValue] = useState(() => (defaultValue ? formatCedula(defaultValue) : "V-"));

  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-sm font-medium text-ink">
        {label} {required && <span className="text-flag-red">*</span>}
      </span>
      <input
        name={name}
        value={value}
        onChange={(e) => setValue(formatCedula(e.target.value))}
        inputMode="numeric"
        autoComplete="off"
        placeholder="V-12.345.678"
        required={required}
        pattern="[VEve]-\d{1,3}(\.\d{3})*"
        title="Formato esperado: V-12.345.678"
        className={inputCls}
      />
      <span className="mt-1 block text-xs text-muted">
        Letra y número, p. ej. <span className="font-medium">V-12.345.678</span>
      </span>
    </label>
  );
}
