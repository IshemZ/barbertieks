import { createClient } from "@supabase/supabase-js";
import { E2E_MANAGER } from "./manager";

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
}
