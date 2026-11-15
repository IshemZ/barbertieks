import { recordSale } from "./actions/sales";
import { SaleWizard } from "./sale-wizard";
import { Welcome } from "./welcome";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { canUseTill } from "@/lib/till-session";

export default async function HomePage() {
  // Téléphone déjà ouvert avec le code, ou gérant connecté : la caisse directement, sans étape de plus par vente.
  if (!(await canUseTill())) return <Welcome />;

  const db = supabaseAdmin();
  const [items, employees] = await Promise.all([
    db.from("catalog_items").select("id, name, kind, price_cents").eq("active", true).order("position"),
    db.from("employees").select("id, name").eq("active", true).order("name"),
  ]);
  if (items.error) throw items.error;
  if (employees.error) throw employees.error;

  return <SaleWizard items={items.data} employees={employees.data} action={recordSale} />;
}
