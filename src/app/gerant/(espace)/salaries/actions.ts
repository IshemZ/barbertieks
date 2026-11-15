"use server";

import { refresh } from "next/cache";
import { isUuid, parseName, type FormState } from "@/lib/form-input";
import { requireManager } from "@/lib/manager-session";
import { supabaseAdmin } from "@/lib/supabase-admin";

const INVALID_NAME = "Saisissez un prénom (60 caractères maximum).";
const FAILED = "L'enregistrement a échoué. Réessayez.";

export async function addEmployee(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireManager();
  const name = parseName(formData.get("name"));
  if (!name) return { error: INVALID_NAME };

  const { error } = await supabaseAdmin().from("employees").insert({ name });
  if (error) return { error: FAILED };
  refresh();
  return { error: null };
}

export async function renameEmployee(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireManager();
  const id = formData.get("id");
  const name = parseName(formData.get("name"));
  if (!isUuid(id)) return { error: FAILED };
  if (!name) return { error: INVALID_NAME };

  const { error } = await supabaseAdmin().from("employees").update({ name }).eq("id", id);
  if (error) return { error: FAILED };
  refresh();
  return { error: null };
}

/** Archive ou réactive un salarié. Archivé, il disparaît de la caisse mais reste dans les chiffres. */
export async function setEmployeeActive(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireManager();
  const id = formData.get("id");
  if (!isUuid(id)) return { error: FAILED };

  const { error } = await supabaseAdmin()
    .from("employees")
    .update({ active: formData.get("active") === "true" })
    .eq("id", id);
  if (error) return { error: FAILED };
  refresh();
  return { error: null };
}
