import { createClient } from "@supabase/supabase-js";
import { E2E_MANAGER } from "./manager";

/** Crée le compte gérant de test s'il n'existe pas encore (base locale uniquement). */
export default async function globalSetup() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Variables Supabase absentes : remplir .env.local (voir README).");
  if (!/^http:\/\/(127\.0\.0\.1|localhost)[:/]/.test(url)) {
    throw new Error(`Les tests E2E ne tournent que sur la base locale, pas sur ${url}.`);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.auth.admin.createUser({ ...E2E_MANAGER, email_confirm: true });
  if (error && error.code !== "email_exists") throw error;
}
