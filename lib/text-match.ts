/**
 * Lightweight fuzzy name matching for check-in reconciliation. We deliberately
 * tolerate misspellings and first/last-name order: the cédula is the strong
 * identifier, and the name is a secondary guard against a mistyped cédula
 * marking the wrong person as found. Dice coefficient over character bigrams of
 * the accent-stripped, space-collapsed name (spaces removed so "Juan Pérez" and
 * "perez juan" still score high).
 */

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]/g, ""); // keep letters/digits only (also drops spaces)
}

function bigrams(s: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.length - 1; i++) out.push(s.slice(i, i + 2));
  return out;
}

/** Similarity in [0, 1]. 1 = identical after normalization. */
export function nameSimilarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.length < 2 || nb.length < 2) return 0;

  const A = bigrams(na);
  const B = bigrams(nb);
  const counts = new Map<string, number>();
  for (const g of A) counts.set(g, (counts.get(g) ?? 0) + 1);

  let intersection = 0;
  for (const g of B) {
    const c = counts.get(g) ?? 0;
    if (c > 0) {
      intersection++;
      counts.set(g, c - 1);
    }
  }
  return (2 * intersection) / (A.length + B.length);
}

/** A check-in is the same person when cédula matches and the name is ≥ this. */
export const NAME_MATCH_THRESHOLD = 0.6;
