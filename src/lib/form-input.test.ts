import { describe, expect, it } from "vitest";
import { centsToInput, parseEuros, parseItemKind, parseName } from "./form-input";

describe("parseName", () => {
  it("nettoie les espaces superflus", () => {
    expect(parseName("  Coupe   enfant ")).toBe("Coupe enfant");
  });

  it("refuse un nom vide ou trop long", () => {
    expect(parseName("   ")).toBeNull();
    expect(parseName("x".repeat(61))).toBeNull();
    expect(parseName(null)).toBeNull();
  });
});

describe("parseEuros", () => {
  it("convertit un prix en euros en centimes", () => {
    expect(parseEuros("15")).toBe(1500);
    expect(parseEuros("7,5")).toBe(750);
    expect(parseEuros("7,50")).toBe(750);
    expect(parseEuros("12.99")).toBe(1299);
    expect(parseEuros(" 20 ")).toBe(2000);
  });

  it("refuse un prix nul, négatif, mal formé ou démesuré", () => {
    for (const value of ["0", "0,00", "-5", "abc", "", "1,234", "10 €", "1000,01", null]) {
      expect(parseEuros(value)).toBeNull();
    }
  });
});

describe("centsToInput", () => {
  it("prépare un prix pour le champ de saisie", () => {
    expect(centsToInput(1500)).toBe("15");
    expect(centsToInput(750)).toBe("7,50");
  });
});

describe("parseItemKind", () => {
  it("accepte prestation ou produit seulement", () => {
    expect(parseItemKind("service")).toBe("service");
    expect(parseItemKind("product")).toBe("product");
    expect(parseItemKind("autre")).toBeNull();
  });
});
