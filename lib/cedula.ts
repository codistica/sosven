/**
 * Venezuelan cédula helpers — pure functions, safe to import from both client
 * components (live input formatting) and server code (validation + canonical
 * storage). Canonical form is `V-12.345.678`: a prefix letter, a dash, and the
 * number grouped in thousands with dots. Storing one canonical form lets us do
 * fast exact-match lookups (and back them with a btree index) for search and
 * for check-in identity matching.
 */

/** Format arbitrary input toward canonical form as the user types. */
export function formatCedula(raw: string): string {
  const letter = (raw.match(/[a-zA-Z]/)?.[0] ?? "V").toUpperCase();
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return digits ? `${letter}-${grouped}` : `${letter}-`;
}

/** Canonical, storage/match-ready form. Deterministic for equal cédulas. */
export function canonicalizeCedula(raw: string): string {
  return formatCedula(raw);
}

const CEDULA_RE = /^[VE]-\d{1,3}(\.\d{3})*$/i;

/** A well-formed cédula: V/E prefix + 5–8 digits in dotted groups. */
export function isValidCedula(raw: string): boolean {
  const value = raw.trim();
  if (!CEDULA_RE.test(value)) return false;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 5 && digits.length <= 8;
}
