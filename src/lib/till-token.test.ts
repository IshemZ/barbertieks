import { describe, expect, it } from "vitest";
import { hashPin, isPinFormat, signSession, verifyPin, verifySession } from "./till-token";

describe("isPinFormat", () => {
  it("accepte exactement 4 chiffres", () => {
    expect(isPinFormat("0427")).toBe(true);
  });

  it("refuse tout le reste", () => {
    for (const pin of ["", "123", "12345", "12a4", " 1234"]) {
      expect(isPinFormat(pin)).toBe(false);
    }
  });
});

describe("hashPin / verifyPin", () => {
  it("vérifie le bon code", () => {
    expect(verifyPin("1234", hashPin("1234"))).toBe(true);
  });

  it("refuse un mauvais code", () => {
    expect(verifyPin("1235", hashPin("1234"))).toBe(false);
  });

  it("produit un hash différent à chaque fois (sel aléatoire)", () => {
    expect(hashPin("1234")).not.toBe(hashPin("1234"));
  });

  it("ne contient pas de $ (interprété par les fichiers .env)", () => {
    expect(hashPin("1234")).not.toContain("$");
  });

  it("refuse un hash mal formé", () => {
    expect(verifyPin("1234", "n'importe quoi")).toBe(false);
  });
});

describe("signSession / verifySession", () => {
  const now = Date.parse("2026-11-15T10:00:00Z");
  const later = now + 60_000;

  it("accepte un jeton valide non expiré", () => {
    expect(verifySession(signSession(later, "clé"), "clé", now)).toBe(true);
  });

  it("refuse un jeton expiré", () => {
    expect(verifySession(signSession(now - 1, "clé"), "clé", now)).toBe(false);
  });

  it("refuse un jeton signé avec une autre clé", () => {
    expect(verifySession(signSession(later, "autre"), "clé", now)).toBe(false);
  });

  it("refuse un jeton dont l'échéance a été modifiée", () => {
    const [, signature] = signSession(later, "clé").split(".");
    expect(verifySession(`${later + 1}.${signature}`, "clé", now)).toBe(false);
  });

  it("refuse un jeton mal formé", () => {
    for (const token of ["", "abc", "123.", ".abc", "x.y.z"]) {
      expect(verifySession(token, "clé", now)).toBe(false);
    }
  });
});
