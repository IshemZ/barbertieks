"use server";

import { parseSaleInput } from "@/lib/sale-input";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { canUseTill } from "@/lib/till-session";

export type RecordSaleResult = { ok: true } | { ok: false; error: string };

const RETRY = "La vente n'a pas été enregistrée. Réessayez.";

export async function recordSale(input: unknown): Promise<RecordSaleResult> {
  if (!(await canUseTill())) {
    return { ok: false, error: "Caisse verrouillée. Rechargez la page et saisissez le code." };
  }

  const sale = parseSaleInput(input);
  if (!sale) return { ok: false, error: RETRY };

  const db = supabaseAdmin();
  // Nom, type et prix relus en base : le navigateur ne fixe jamais le montant.
  const [item, employee] = await Promise.all([
    db.from("catalog_items").select("id, name, kind, price_cents").eq("id", sale.itemId).eq("active", true).maybeSingle(),
    db.from("employees").select("id").eq("id", sale.employeeId).eq("active", true).maybeSingle(),
  ]);
  if (item.error || employee.error || !item.data || !employee.data) return { ok: false, error: RETRY };

  const { error } = await db.from("sales").insert({
    catalog_item_id: item.data.id,
    item_name: item.data.name,
    kind: item.data.kind,
    price_cents: item.data.price_cents,
    payment_method: sale.paymentMethod,
    employee_id: employee.data.id,
  });
  if (error) {
    console.error("Échec d'enregistrement d'une vente", error);
    return { ok: false, error: RETRY };
  }
  return { ok: true };
}
