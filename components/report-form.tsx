"use client";

import { useActionState } from "react";
import { createReport, type ActionState } from "@/lib/actions";
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

  return (
    <form action={action} className="space-y-6">
      <Panel step={1} title="Información de la persona">
        <TextField name="firstName" label="Primer nombre" required placeholder="Ej. Juan Carlos" />
        <TextField name="lastName" label="Apellido" required placeholder="Ej. Pérez" />
        <TextField name="age" label="Edad" type="number" min={0} max={120} placeholder="Años" />
        <RadioGroup
          name="gender"
          label="Sexo"
          options={[
            { value: "masculino", label: "Masculino" },
            { value: "femenino", label: "Femenino" },
            { value: "otro", label: "Otro" },
          ]}
        />
        <TextField name="nationality" label="Nacionalidad" placeholder="Venezolana" defaultValue="Venezolana" />
      </Panel>

      <Panel step={2} title="Documentación de identidad">
        <TextField name="idDocument" label="Número de cédula" placeholder="V-00.000.000" full />
      </Panel>

      <Panel step={3} title="Descripción física">
        <TextField name="heightCm" label="Estatura (cm)" type="number" min={0} max={250} placeholder="170" />
        <TextField name="weightKg" label="Peso (kg)" type="number" min={0} max={400} placeholder="70" />
        <TextField name="build" label="Complexión" placeholder="Delgada, media, atlética…" />
        <SelectField
          name="hairColor"
          label="Color de cabello"
          options={["Negro", "Castaño", "Rubio", "Canoso", "Pelirrojo", "Otro"].map((c) => ({
            value: c,
            label: c,
          }))}
        />
        <SelectField
          name="hairLength"
          label="Largo de cabello"
          options={["Corto", "Medio", "Largo", "Calvo"].map((c) => ({ value: c, label: c }))}
        />
        <TextField name="eyeColor" label="Color de ojos" placeholder="Marrón, verde…" />
        <TextField name="skinTone" label="Tono de piel" placeholder="Clara, trigueña, oscura…" />
        <TextAreaField
          name="distinguishingMarks"
          label="Señas particulares"
          placeholder="Cicatrices, tatuajes, lentes, vestimenta…"
        />
      </Panel>

      <Panel step={4} title="Última localización conocida">
        <TextField
          name="lastSeenLocation"
          label="Dirección / punto de referencia"
          placeholder="Av., sector, plaza…"
          full
        />
        <TextField name="lastSeenCity" label="Ciudad / Estado" placeholder="Caracas, Distrito Capital" />
        <TextField name="lastSeenDate" label="Fecha de desaparición" type="date" required />
        <TextAreaField
          name="circumstances"
          label="Descripción de los hechos"
          placeholder="Cuenta lo importante: dónde, cuándo y en qué circunstancias…"
        />
      </Panel>

      <Panel step={5} title="Fotografías">
        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-ink">
            Foto reciente de la persona
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
        <TextField name="reporterName" label="Nombre del reportante" placeholder="Tu nombre" />
        <TextField name="reporterRelationship" label="Parentesco" placeholder="Madre, hermano, amigo…" />
        <TextField name="reporterPhone" label="Teléfono" type="tel" placeholder="+58 412 0000000" />
        <TextField name="reporterEmail" label="Correo electrónico" type="email" placeholder="correo@ejemplo.com" />
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
