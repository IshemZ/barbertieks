"use server";

import { redirect } from "next/navigation";
import { MANAGER_LOGIN_PATH } from "@/lib/manager-session";
import { supabaseServer } from "@/lib/supabase-server";

export type SignInState = { error: string | null };

export async function signIn(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Saisissez l'e-mail et le mot de passe." };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      error: error.status === 429 ? "Trop d'essais. Réessayez dans quelques minutes." : "E-mail ou mot de passe incorrect.",
    };
  }
  redirect("/gerant");
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect(MANAGER_LOGIN_PATH);
}
