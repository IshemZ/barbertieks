import "server-only";
import { cookies } from "next/headers";
import { getManager } from "./manager-session";
import { isPinFormat, signSession, verifyPin, verifySession } from "./till-token";

const COOKIE_NAME = "till_session";
// La caisse reste ouverte un an sur le téléphone : pas de code à chaque vente.
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function config() {
  const pinHash = process.env.TILL_PIN_HASH;
  const secret = process.env.TILL_SESSION_SECRET;
  if (!pinHash || !secret) {
    throw new Error("TILL_PIN_HASH et TILL_SESSION_SECRET doivent être définis (voir README).");
  }
  // Le hash du code entre dans la clé : changer le code ferme toutes les caisses ouvertes.
  return { pinHash, key: `${secret}:${pinHash}` };
}

/** Vrai si ce navigateur a déjà ouvert la caisse avec le bon code. */
export async function isTillUnlocked(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token ? verifySession(token, config().key, Date.now()) : false;
}

/** Vrai si ce navigateur peut saisir des ventes : caisse ouverte avec le code, ou gérant connecté (il encaisse aussi). */
export async function canUseTill(): Promise<boolean> {
  return (await isTillUnlocked()) || Boolean(await getManager());
}

/** Vérifie le code et, s'il est bon, ouvre la caisse sur ce navigateur. À appeler depuis une Server Action. */
export async function unlockTillWithPin(pin: string): Promise<boolean> {
  const { pinHash, key } = config();
  if (!isPinFormat(pin) || !verifyPin(pin, pinHash)) return false;

  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  (await cookies()).set(COOKIE_NAME, signSession(expiresAt, key), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
  });
  return true;
}
