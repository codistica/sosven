"use client";

import { useActionState, useState } from "react";
import { createReport, type ActionState } from "@/lib/actions";
import { CedulaField } from "./cedula-field";
import {
  Panel,
  RadioGroup,
  SelectField,
  TextAreaField,
  TextField,
} from "./form-fields";

const initial: ActionState = { ok: false };

export function ReportForm() {
  const [state, action, pending] = useActionState(createReport, initial);
  const [noCedula, setNoCedula] = useState(false);
  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="space-y-6">
      <Panel step={1} title="Información de la persona">
        <TextField name="firstName" label="Primer nombre" required placeholder="Ej. Juan Carlos" />
        <TextField name="lastName" label="Apellido" required placeholder="Ej. Pérez" />
        <TextField name="age" label="Edad" type="number" min={0} max={120} placeholder="Años" optional />
        <RadioGroup
          name="gender"
          label="Sexo"
          options={[
            { value: "masculino", label: "Masculino" },
            { value: "femenino", label: "Femenino" },
            { value: "otro", label: "Otro" },
          ]}
        />
        <TextField name="nationality" label="Nacionalidad" placeholder="Venezolana" defaultValue="Venezolana" optional />
      </Panel>

      <Panel step={2} title="Documentación de identidad">
        {noCedula ? (
          <div className="rounded-lg border border-dashed border-line bg-surface px-3 py-2.5 text-sm text-muted sm:col-span-2">
            Sin cédula (menor de edad). No se requiere número de documento.
          </div>
        ) : (
          <CedulaField name="idDocument" label="Número de cédula" required full />
        )}
        <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
          <input
            type="checkbox"
            name="noCedula"
            checked={noCedula}
            onChange={(e) => setNoCedula(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          Es menor de edad sin cédula
        </label>
      </Panel>

      <Panel step={3} title="Descripción física">
        <TextField name="heightCm" label="Estatura (cm)" type="number" min={0} max={250} placeholder="170" optional />
        <TextField name="weightKg" label="Peso (kg)" type="number" min={0} max={400} placeholder="70" optional />
        <TextField name="build" label="Complexión" placeholder="Delgada, media, atlética…" optional />
        <SelectField
          name="hairColor"
          label="Color de cabello"
          optional
          options={["Negro", "Castaño", "Rubio", "Canoso", "Pelirrojo", "Otro"].map((c) => ({
            value: c,
            label: c,
          }))}
        />
        <SelectField
          name="hairLength"
          label="Largo de cabello"
          optional
          options={["Corto", "Medio", "Largo", "Calvo"].map((c) => ({ value: c, label: c }))}
        />
        <TextField name="eyeColor" label="Color de ojos" placeholder="Marrón, verde…" optional />
        <TextField name="skinTone" label="Tono de piel" placeholder="Clara, trigueña, oscura…" optional />
        <TextAreaField
          name="distinguishingMarks"
          label="Señas particulares"
          placeholder="Cicatrices, tatuajes, lentes, vestimenta…"
          optional
        />
      </Panel>

      <Panel step={4} title="Última localización conocida">
        <TextField
          name="lastSeenLocation"
          label="Dirección / punto de referencia"
          placeholder="Av., sector, plaza…"
          full
          optional
        />
        <TextField name="lastSeenCity" label="Ciudad / Estado" placeholder="Caracas, Distrito Capital" optional />
        <TextField
          name="lastSeenDate"
          label="Fecha de desaparición"
          type="date"
          required
          defaultValue="2026-06-24"
          max={todayISO}
        />
        <TextAreaField
          name="circumstances"
          label="Descripción de los hechos"
          placeholder="Cuenta lo importante: dónde, cuándo y en qué circunstancias…"
          optional
        />
      </Panel>

      <Panel step={5} title="Fotografías">
        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-ink">
            Foto reciente de la persona{" "}
            <span className="font-normal text-muted">(opcional)</span>
          </span>
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="block w-full rounded-lg border border-dashed border-line bg-surface px-3 py-6 text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
          />
          <span className="mt-1 block text-xs text-muted">
            Formatos: JPG, PNG, WEBP. Una foto clara ayuda muchísimo.
          </span>
        </label>
      </Panel>

      <Panel step={6} title="Tus datos de contacto">
        <TextField name="reporterName" label="Nombre del reportante" placeholder="Tu nombre" optional />
        <TextField name="reporterRelationship" label="Parentesco" placeholder="Madre, hermano, amigo…" optional />
        <TextField name="reporterPhone" label="Teléfono" type="tel" placeholder="+58 412 0000000" optional />
        <TextField name="reporterEmail" label="Correo electrónico" type="email" placeholder="correo@ejemplo.com" optional />
      </Panel>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-flag-red/30 bg-flag-red/5 px-4 py-3 text-sm font-medium text-flag-red"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Enviando reporte…" : "Enviar Reporte"}
      </button>
      <p className="text-center text-xs text-muted">
        Al enviar aceptas que SOSVEN trate esta información con fines exclusivamente
        humanitarios y de búsqueda.
      </p>
    </form>
  );
}
