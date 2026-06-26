import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-bold uppercase tracking-wide text-flag-red">No encontrada</p>
      <h1 className="mt-2 text-2xl font-extrabold text-ink">
        Esta persona no está en el registro
      </h1>
      <p className="mt-2 text-muted">
        Es posible que el perfil haya sido retirado o que el enlace sea incorrecto.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
