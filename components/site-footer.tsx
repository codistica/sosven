import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="flag-bar" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Logo className="text-navy" />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Plataforma humanitaria dedicada a la búsqueda y reunificación de
            familias afectadas por el terremoto en Venezuela.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted">
            Línea de Crisis
          </h3>
          <a
            href="tel:0800767836"
            className="mt-2 block text-2xl font-extrabold text-flag-red"
          >
            0800-SOS-VEN
          </a>
          <p className="mt-1 text-sm text-muted">
            Atención 24/7 para reportar o solicitar información.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Enlaces</h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li>
              <Link href="/" className="text-ink hover:text-brand">
                Buscar personas
              </Link>
            </li>
            <li>
              <Link href="/reportar" className="text-ink hover:text-brand">
                Reportar desaparecido
              </Link>
            </li>
            <li>
              <Link href="/ayuda" className="text-ink hover:text-brand">
                Cómo ayudar
              </Link>
            </li>
            <li>
              <Link href="/ayuda#contacto" className="text-ink hover:text-brand">
                Contacto y soporte
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted sm:px-6 lg:px-8">
          © {new Date().getFullYear()} SOSVEN · Iniciativa humanitaria sin fines de
          lucro. Toda la información es tratada con confidencialidad.
        </div>
      </div>
    </footer>
  );
}
