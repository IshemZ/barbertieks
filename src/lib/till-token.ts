// Primitives cryptographiques du verrou caisse, sans dépendance à Next.js
// (utilisées par le serveur et par le script `npm run hash-pin`).
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 32;

/** Le code caisse est composé d'exactement 4 chiffres. */
export function isPinFormat(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/** Hache un code au format « scrypt:<sel>:<hash> » (base64url, sans « $ » pour rester compatible .env). */
export function hashPin(pin: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(pin, salt, KEY_LENGTH);
  return `scrypt:${salt.toString("base64url")}:${hash.toString("base64url")}`;
}

export function verifyPin(pin: string, stored: string): boolean {
  const [algo, salt, hash] = stored.split(":");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  if (expected.length !== KEY_LENGTH) return false;
  const actual = scryptSync(pin, Buffer.from(salt, "base64url"), KEY_LENGTH);
  return timingSafeEqual(actual, expected);
}

function sign(payload: string, key: string): Buffer {
  return createHmac("sha256", key).update(payload).digest();
}

/** Jeton de session « <échéance en ms>.<signature HMAC> ». */
export function signSession(expiresAt: number, key: string): string {
  return `${expiresAt}.${sign(String(expiresAt), key).toString("base64url")}`;
}

export function verifySession(token: string, key: string, now: number): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [expiresAt, signature] = parts;
  if (!/^\d+$/.test(expiresAt) || !signature) return false;
  const expected = sign(expiresAt, key);
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  return Number(expiresAt) > now;
}
