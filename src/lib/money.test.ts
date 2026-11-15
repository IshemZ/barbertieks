import { describe, expect, it } from "vitest";
import { formatEuros } from "./money";

// Intl fr-FR utilise des espaces insécables : on les normalise pour lire les attentes.
const plain = (s: string) => s.replace(/[  ]/g, " ");

describe("formatEuros", () => {
  it("affiche des centimes au format fr-FR", () => {
    expect(plain(formatEuros(1500))).toBe("15,00 €");
  });

  it("affiche zéro", () => {
    expect(plain(formatEuros(0))).toBe("0,00 €");
  });

  it("sépare les milliers", () => {
    expect(plain(formatEuros(123456))).toBe("1 234,56 €");
  });
});
