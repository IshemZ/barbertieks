"use server";

import { redirect } from "next/navigation";
import { unlockTillWithPin } from "@/lib/till-session";

export type UnlockState = { error: string | null };

// Ralentit les essais au hasard : 10 000 codes possibles seulement.
const FAILURE_DELAY_MS = 1000;

export async function unlockTill(_previous: UnlockState, formData: FormData): Promise<UnlockState> {
  const pin = String(formData.get("pin") ?? "");
  if (await unlockTillWithPin(pin)) redirect("/");

  await new Promise((resolve) => setTimeout(resolve, FAILURE_DELAY_MS));
  return { error: "Code incorrect" };
}
