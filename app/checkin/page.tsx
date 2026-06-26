import type { Metadata } from "next";
import { CheckinForm } from "@/components/checkin-form";

export const metadata: Metadata = {
  title: "Check-in de Bienestar · SOSVEN",
  description:
    "¿Estás a salvo tras el terremoto en Venezuela? Confírmalo aquí. Si alguien te reportó como desaparecido, tu reporte se marcará como encontrado.",
};

const STEPS = [
  "Si ya existe un reporte de desaparición con tu cédula, lo marcamos como encontrado al instante.",
  "Si nadie te ha reportado aún, guardamos tu confirmación.",
  "Si más tarde alguien te reporta, su reporte nacerá ya marcado como encontrado.",
];

export default function CheckinPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Estoy a salvo
        </span>
        <h1 className="mt-3 text-2xl font-extrabold text-ink sm:text-3xl">
          Check-in de Bienestar
        </h1>
        <p className="mt-2 text-muted">
          Si estás bien tras el terremoto, confírmalo con tu nombre y cédula.
          Ayudas a tu familia a dejar de buscarte y liberas recursos de rescate.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CheckinForm />
        </div>

        <aside className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-xs font-bold uppercase tracking-wide text-muted">
            ¿Cómo funciona?
          </h2>
          <ol className="mt-3 space-y-3 text-sm text-ink">
            {STEPS.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
