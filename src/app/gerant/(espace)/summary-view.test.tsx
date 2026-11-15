import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { SummaryView } from "./summary-view";
import { summarizeSales } from "@/lib/sales-summary";

afterEach(cleanup);

const plain = (s: string | null) => (s ?? "").replace(/[  ]/g, " ").replace(/\s+/g, " ");
const names = { a: "Mehdi", b: "Yanis" };

const summary = summarizeSales([
  { employee_id: "a", kind: "service", payment_method: "cash", price_cents: 1500 },
  { employee_id: "b", kind: "service", payment_method: "card", price_cents: 2500 },
  { employee_id: "b", kind: "product", payment_method: "card", price_cents: 1000 },
  { employee_id: "a", kind: "service", payment_method: "transfer", price_cents: 1000 },
]);

const section = (name: string) => plain(screen.getByRole("region", { name }).textContent);

describe("SummaryView", () => {
  it("affiche le CA total et le nombre de ventes", () => {
    render(<SummaryView title="Jour" summary={summary} employeeNames={names} />);
    const total = section("Jour");
    expect(total).toContain("60,00 €");
    expect(total).toContain("4 ventes");
  });

  it("sépare prestations et produits, et ventile par mode de paiement", () => {
    render(<SummaryView title="Jour" summary={summary} employeeNames={names} />);
    expect(section("Par type")).toBe("Prestations50,00 €Produits10,00 €");
    expect(section("Par paiement")).toBe("Espèces15,00 €CB35,00 €Virement10,00 €");
  });

  it("liste les personnes du plus gros CA au plus petit, avec leur détail", () => {
    render(<SummaryView title="Jour" summary={summary} employeeNames={names} />);
    const people = within(screen.getByRole("region", { name: "Par personne" })).getAllByRole("listitem");
    expect(people.map((p) => plain(p.textContent))).toEqual([
      "Yanis35,00 €CB 35,00 € · dont produits 10,00 €",
      "Mehdi25,00 €Espèces 15,00 € · Virement 10,00 €",
    ]);
  });

  it("indique l'absence de vente", () => {
    render(<SummaryView title="Jour" summary={summarizeSales([])} employeeNames={names} />);
    expect(screen.getByText("Aucune vente.")).toBeDefined();
    expect(screen.queryByRole("region", { name: "Par personne" })).toBeNull();
  });
});
