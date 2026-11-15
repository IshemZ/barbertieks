import { recordSale } from "./actions/sales";
import { unlockTill } from "./actions/till";
import { PinPad } from "./pin-pad";
import { SaleWizard } from "./sale-wizard";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isTillUnlocked } from "@/lib/till-session";

export default async function TillPage() {
  if (!(await isTillUnlocked())) return <PinPad action={unlockTill} />;

  const db = supabaseAdmin();
  const [items, employees] = await Promise.all([
    db.from("catalog_items").select("id, name, kind, price_cents").eq("active", true).order("position"),
    db.from("employees").select("id, name").eq("active", true).order("name"),
  ]);
  if (items.error) throw items.error;
  if (employees.error) throw employees.error;

  return <SaleWizard items={items.data} employees={employees.data} action={recordSale} />;
}
