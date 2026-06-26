import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ayuda · SOSVEN",
  description: "Cómo usar SOSVEN para buscar, reportar y ayudar a reunir familias.",
};

const STEPS = [
  {
    title: "Reporta una desaparición",
    body: "Completa el formulario con nombre, foto, descripción física y el último lugar donde fue vista la persona.",
    href: "/reportar",
    cta: "Reportar ahora",
  },
  {
    title: "Busca a alguien",
    body: "Usa el buscador y los filtros por nombre, ciudad o cédula para revisar los reportes activos.",
    href: "/",
    cta: "Buscar personas",
  },
  {
    title: "Reporta un avistamiento",
    body: "Si reconoces a alguien, entra a su perfil y reporta dónde lo viste. El equipo contactará a la familia.",
    href: "/",
    cta: "Ver perfiles",
  },
];

export default function AyudaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Cómo funciona SOSVEN</h1>
      <p className="mt-2 max-w-2xl text-muted">
        SOSVEN conecta a familias separadas tras el terremoto. Cualquier persona
        puede reportar, buscar y aportar información de forma gratuita.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-white">
              {i + 1}
            </div>
            <h2 className="mt-3 font-bold text-ink">{s.title}</h2>
            <p className="mt-1 text-sm text-muted">{s.body}</p>
            <Link href={s.href} className="mt-3 inline-block text-sm font-semibold text-brand hover:underline">
              {s.cta} →
            </Link>
          </div>
        ))}
      </div>

      <section id="contacto" className="mt-10 rounded-2xl bg-navy p-8 text-white">
        <h2 className="text-lg font-bold">Línea de crisis 24/7</h2>
        <p className="mt-1 text-white/80">
          Atención humanitaria para reportar o solicitar información.
        </p>
        <a href="tel:0800767836" className="mt-3 block text-3xl font-extrabold text-flag-yellow">
          0800-SOS-VEN
        </a>
        <p className="mt-4 text-sm text-white/80">
          Emergencias de vida o muerte:{" "}
          <a href="tel:911" className="font-bold text-white">911</a> ·{" "}
          <a href="tel:171" className="font-bold text-white">171</a>
        </p>
      </section>
    </div>
  );
}
