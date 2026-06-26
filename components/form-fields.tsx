"use client";

import type { ReactNode } from "react";

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20";

export function Panel({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <legend className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wide text-brand">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-[11px] text-white">
          {step}
        </span>
        {title}
      </legend>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function TextField({
  name,
  label,
  type = "text",
  placeholder,
  required,
  full,
  ...rest
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  full?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-sm font-medium text-ink">
        {label} {required && <span className="text-flag-red">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className={inputCls}
        {...rest}
      />
    </label>
  );
}

export function TextAreaField({
  name,
  label,
  placeholder,
  full = true,
}: {
  name: string;
  label: string;
  placeholder?: string;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      <textarea name={name} rows={3} placeholder={placeholder} className={`${inputCls} resize-y`} />
    </label>
  );
}

export function SelectField({
  name,
  label,
  options,
  full,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      <select name={name} className={inputCls} defaultValue="">
        <option value="" disabled>
          Selecciona…
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function RadioGroup({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <div className="sm:col-span-2">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o, i) => (
          <label
            key={o.value}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand/5"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              defaultChecked={defaultValue ? o.value === defaultValue : i === 0}
              className="accent-brand"
            />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}
