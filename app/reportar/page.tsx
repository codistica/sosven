import type { Metadata } from "next";
import { ReportForm } from "@/components/report-form";

export const metadata: Metadata = {
  title: "Reportar Persona Desaparecida · SOSVEN",
  description:
    "Completa el formulario para reportar a una persona desaparecida tras el terremoto en Venezuela. Mientras más información, mejor.",
};

const TIPS = [
  "Sube una o más fotos recientes y nítidas.",
  "Detalla señas particulares: cicatrices, tatuajes, lentes.",
  "Indica el último lugar y hora con la mayor precisión posible.",
  "Verifica que el número de contacto esté correcto.",
];

export default function ReportarPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
          Reportar Persona Desaparecida
        </h1>
        <p className="mt-2 text-muted">
          Completa el siguiente formulario con la mayor cantidad de información
          posible. Cada dato cuenta para ayudar en la búsqueda.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ReportForm />
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-brand p-6 text-white">
            <h2 className="font-bold">Consejos para un buen reporte</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/90">
              {TIPS.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-flag-red/30 bg-flag-red/5 p-6">
            <h2 className="text-xs font-bold uppercase tracking-wide text-flag-red">
              Emergencia
            </h2>
            <p className="mt-2 text-sm text-ink">
              Si es una situación de vida o muerte, llama de inmediato:
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-lg font-extrabold text-flag-red">
              <a href="tel:911">911</a>
              <a href="tel:171">171</a>
            </div>
            <a href="tel:0800767836" className="mt-2 block text-sm font-bold text-flag-red">
              Línea SOSVEN: 0800-SOS-VEN
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
