import "server-only";
import type { SaleLine } from "./sales-summary";
import { supabaseAdmin } from "./supabase-admin";
import type { Range } from "./paris-time";

export type SaleRow = SaleLine & { created_at: string };

// PostgREST renvoie au plus 1000 lignes par requête : un mois chargé peut dépasser.
const PAGE_SIZE = 1000;

/** Ventes de l'intervalle [start, end[, toutes pages confondues. */
export async function fetchSales({ start, end }: Range): Promise<SaleRow[]> {
  const db = supabaseAdmin();
  const rows: SaleRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await db
      .from("sales")
      .select("created_at, price_cents, kind, payment_method, employee_id")
      .gte("created_at", start)
      .lt("created_at", end)
      .order("created_at")
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < PAGE_SIZE) return rows;
  }
}

/** Noms de tous les salariés, archivés compris (ils restent dans l'historique). */
export async function fetchEmployeeNames(): Promise<Record<string, string>> {
  const { data, error } = await supabaseAdmin().from("employees").select("id, name");
  if (error) throw error;
  return Object.fromEntries(data.map((e) => [e.id, e.name]));
}
