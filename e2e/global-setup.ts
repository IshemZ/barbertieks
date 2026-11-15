import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { E2E_MANAGER, FIXTURE_SALES } from "./manager";

// Seul projet Supabase sur lequel les tests E2E ont le droit d'écrire : barbertieks-dev.
// Écrit en dur (et non lu depuis .env.local) pour que les tests ne visent jamais la production par erreur.
const DEV_PROJECT_URL = "https://gjazsksnziluogpzitwa.supabase.co";

/** Crée le compte gérant de test s'il n'existe pas encore (projet de développement uniquement). */
export default async function globalSetup() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Variables Supabase absentes : remplir .env.local (voir README).");
  if (url.replace(/\/+$/, "") !== DEV_PROJECT_URL) {
    throw new Error(`Les tests E2E ne tournent que sur ${DEV_PROJECT_URL}, pas sur ${url}.`);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.auth.admin.createUser({ ...E2E_MANAGER, email_confirm: true });
  if (error && error.code !== "email_exists") throw error;

  await insertFixtureSales(supabase);
}

async function insertFixtureSales(supabase: SupabaseClient) {
  const { count, error } = await supabase
    .from("sales")
    .select("id", { count: "exact", head: true })
    .gte("created_at", "2019-12-31T23:00:00Z")
    .lt("created_at", "2020-01-31T23:00:00Z");
  if (error) throw error;
  if (count) return;

  const [items, employees] = await Promise.all([
    supabase.from("catalog_items").select("id, name, kind, price_cents"),
    supabase.from("employees").select("id, name"),
  ]);
  if (items.error) throw items.error;
  if (employees.error) throw employees.error;
  const item = (name: string) => items.data.find((i) => i.name === name)!;
  const employee = (name: string) => employees.data.find((e) => e.name === name)!.id;

  const rows = FIXTURE_SALES.map((s) => {
    const { id, name, kind, price_cents } = item(s.item);
    return {
      created_at: s.at,
      catalog_item_id: id,
      item_name: name,
      kind,
      price_cents,
      payment_method: s.payment,
      employee_id: employee(s.employee),
    };
  });
  const insert = await supabase.from("sales").insert(rows);
  if (insert.error) throw insert.error;
}
