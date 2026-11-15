import "server-only";
import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase-server";

export const MANAGER_LOGIN_PATH = "/gerant/connexion";

/** Gérant connecté, vérifié auprès de Supabase Auth (seul compte existant : inscriptions désactivées). */
export async function getManager() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/** À appeler en tête de chaque page et action de l'espace gérant. */
export async function requireManager() {
  const user = await getManager();
  if (!user) redirect(MANAGER_LOGIN_PATH);
  return user;
}
