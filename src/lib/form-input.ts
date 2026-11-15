import type { ItemKind } from "./sales-summary";

export const NAME_MAX_LENGTH = 60;
// Garde-fou contre une faute de frappe (ex. 1500 au lieu de 15,00).
const MAX_PRICE_CENTS = 100_000;

/** Nom de salarié ou d'article : espaces nettoyés, 1 à 60 caractères. */
export function parseName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ");
  return name.length > 0 && name.length <= NAME_MAX_LENGTH ? name : null;
}

/** Prix saisi en euros (« 15 », « 7,50 », « 12.99 ») converti en centimes. */
export function parseEuros(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,4})(?:[,.](\d{1,2}))?$/.exec(value.trim());
  if (!match) return null;
  const cents = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return cents > 0 && cents <= MAX_PRICE_CENTS ? cents : null;
}

/** Prix en centimes affiché dans un champ de saisie : « 15 » ou « 7,50 ». */
export function centsToInput(cents: number): string {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2).replace(".", ",");
}

export function parseItemKind(value: unknown): ItemKind | null {
  return value === "service" || value === "product" ? value : null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

/** Résultat d'un formulaire de l'espace gérant : message affiché sous le formulaire. */
export type FormState = { error: string | null };
