"use server";

import { refresh } from "next/cache";
import { isUuid, parseEuros, parseItemKind, parseName, type FormState } from "@/lib/form-input";
import { requireManager } from "@/lib/manager-session";
import { supabaseAdmin } from "@/lib/supabase-admin";

const INVALID_NAME = "Saisissez un nom (60 caractères maximum).";
const INVALID_PRICE = "Saisissez un prix entre 0,01 € et 1000 €, par exemple 15 ou 7,50.";
const FAILED = "L'enregistrement a échoué. Réessayez.";

export async function addItem(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireManager();
  const name = parseName(formData.get("name"));
  const kind = parseItemKind(formData.get("kind"));
  const price_cents = parseEuros(formData.get("price"));
  if (!name) return { error: INVALID_NAME };
  if (!kind) return { error: "Choisissez prestation ou produit." };
  if (!price_cents) return { error: INVALID_PRICE };

  const db = supabaseAdmin();
  // Le nouvel article se place à la fin de la liste en caisse.
  const last = await db.from("catalog_items").select("position").order("position", { ascending: false }).limit(1);
  if (last.error) return { error: FAILED };
  const position = (last.data[0]?.position ?? 0) + 1;

  const { error } = await db.from("catalog_items").insert({ name, kind, price_cents, position });
  if (error) return { error: FAILED };
  refresh();
  return { error: null };
}

/** Modifie nom et prix. Les ventes passées gardent le nom et le prix de l'époque. */
export async function updateItem(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireManager();
  const id = formData.get("id");
  const name = parseName(formData.get("name"));
  const price_cents = parseEuros(formData.get("price"));
  if (!isUuid(id)) return { error: FAILED };
  if (!name) return { error: INVALID_NAME };
  if (!price_cents) return { error: INVALID_PRICE };

  const { error } = await supabaseAdmin().from("catalog_items").update({ name, price_cents }).eq("id", id);
  if (error) return { error: FAILED };
  refresh();
  return { error: null };
}

/** Archive ou réactive un article. Archivé, il disparaît de la caisse mais reste dans l'historique. */
export async function setItemActive(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireManager();
  const id = formData.get("id");
  if (!isUuid(id)) return { error: FAILED };

  const { error } = await supabaseAdmin()
    .from("catalog_items")
    .update({ active: formData.get("active") === "true" })
    .eq("id", id);
  if (error) return { error: FAILED };
  refresh();
  return { error: null };
}
