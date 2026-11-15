import { describe, expect, it } from "vitest";
import { parseSaleInput } from "./sale-input";

const valid = {
  itemId: "6f1c2a4e-3b7d-4c1a-9e2f-0a1b2c3d4e5f",
  paymentMethod: "card",
  employeeId: "0b9c8d7e-6f5a-4b3c-8d2e-1f0a9b8c7d6e",
};

describe("parseSaleInput", () => {
  it("accepte une saisie complète", () => {
    expect(parseSaleInput(valid)).toEqual(valid);
  });

  it("refuse un mode de paiement inconnu", () => {
    expect(parseSaleInput({ ...valid, paymentMethod: "cheque" })).toBeNull();
  });

  it("refuse un identifiant qui n'est pas un UUID", () => {
    expect(parseSaleInput({ ...valid, itemId: "1; drop table sales" })).toBeNull();
    expect(parseSaleInput({ ...valid, employeeId: "" })).toBeNull();
  });

  it("refuse une saisie qui n'est pas un objet", () => {
    for (const input of [null, undefined, "x", 42]) {
      expect(parseSaleInput(input)).toBeNull();
    }
  });

  it("ignore un prix envoyé par le navigateur", () => {
    expect(parseSaleInput({ ...valid, price_cents: 1 })).toEqual(valid);
  });
});
