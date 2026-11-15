import { describe, expect, it } from "vitest";
import { summarizeSales, type SaleLine } from "./sales-summary";

const sale = (overrides: Partial<SaleLine>): SaleLine => ({
  price_cents: 1500,
  kind: "service",
  payment_method: "cash",
  employee_id: "a",
  ...overrides,
});

describe("summarizeSales", () => {
  it("renvoie des totaux à zéro sans vente", () => {
    const s = summarizeSales([]);
    expect(s.total).toBe(0);
    expect(s.count).toBe(0);
    expect(s.byKind).toEqual({ service: 0, product: 0 });
    expect(s.byPayment).toEqual({ cash: 0, card: 0, transfer: 0 });
    expect(s.byEmployee).toEqual({});
  });

  it("sépare le CA produits du CA prestations", () => {
    const s = summarizeSales([
      sale({ price_cents: 2500 }),
      sale({ price_cents: 1000, kind: "product" }),
    ]);
    expect(s.total).toBe(3500);
    expect(s.byKind).toEqual({ service: 2500, product: 1000 });
  });

  it("ventile le CA par mode de paiement", () => {
    const s = summarizeSales([
      sale({ payment_method: "cash" }),
      sale({ payment_method: "card" }),
      sale({ payment_method: "card" }),
      sale({ payment_method: "transfer" }),
    ]);
    expect(s.byPayment).toEqual({ cash: 1500, card: 3000, transfer: 1500 });
  });

  it("ventile le CA par personne et par mode de paiement, produits inclus", () => {
    const s = summarizeSales([
      sale({ employee_id: "a", payment_method: "cash" }),
      sale({ employee_id: "a", payment_method: "card", kind: "product", price_cents: 1000 }),
      sale({ employee_id: "b", payment_method: "card" }),
    ]);
    expect(s.byEmployee).toEqual({
      a: {
        total: 2500,
        byKind: { service: 1500, product: 1000 },
        byPayment: { cash: 1500, card: 1000, transfer: 0 },
      },
      b: {
        total: 1500,
        byKind: { service: 1500, product: 0 },
        byPayment: { cash: 0, card: 1500, transfer: 0 },
      },
    });
  });
});
