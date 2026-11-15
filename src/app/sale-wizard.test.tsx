import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SaleWizard, type SaleWizardProps } from "./sale-wizard";

afterEach(cleanup);

const items: SaleWizardProps["items"] = [
  { id: "i1", name: "Coupe signature", kind: "service", price_cents: 1500 },
  { id: "i2", name: "Cire", kind: "product", price_cents: 1000 },
];
const employees: SaleWizardProps["employees"] = [
  { id: "e1", name: "Mehdi" },
  { id: "e2", name: "Yanis" },
];

type Action = SaleWizardProps["action"];
const plain = (s: string | null) => (s ?? "").replace(/[  ]/g, " ");
const tap = (name: string | RegExp) => fireEvent.click(screen.getByRole("button", { name }));
const heading = () => screen.getByRole("heading", { level: 1 }).textContent;

function fillUpToRecap() {
  tap(/Coupe signature/);
  tap("CB");
  tap("Mehdi");
}

describe("SaleWizard", () => {
  it("sépare les prestations des produits", () => {
    render(<SaleWizard items={items} employees={employees} action={vi.fn<Action>()} />);
    expect(screen.getByRole("heading", { name: "Prestations" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Produits" })).toBeDefined();
  });

  it("prévient quand le catalogue est vide", () => {
    render(<SaleWizard items={[]} employees={employees} action={vi.fn<Action>()} />);
    expect(screen.getByText("Aucun article. Le gérant doit en ajouter dans son espace.")).toBeDefined();
  });

  it("enchaîne article, paiement, salarié puis récapitulatif", () => {
    render(<SaleWizard items={items} employees={employees} action={vi.fn<Action>()} />);
    expect(heading()).toBe("Quel article ?");
    tap(/Coupe signature/);
    expect(heading()).toBe("Quel paiement ?");
    tap("CB");
    expect(heading()).toBe("Qui a fait la vente ?");
    tap("Mehdi");
    expect(heading()).toBe("Récapitulatif");

    const recap = plain(screen.getByTestId("recap").textContent);
    for (const text of ["Coupe signature", "15,00 €", "CB", "Mehdi"]) {
      expect(recap).toContain(text);
    }
  });

  it("revient à l'étape précédente avec Retour", () => {
    render(<SaleWizard items={items} employees={employees} action={vi.fn<Action>()} />);
    tap(/Coupe signature/);
    tap("Retour");
    expect(heading()).toBe("Quel article ?");
  });

  it("enregistre la vente puis repart sur une nouvelle vente", async () => {
    const action = vi.fn<Action>(async () => ({ ok: true }));
    render(<SaleWizard items={items} employees={employees} action={action} />);
    fillUpToRecap();
    tap("Valider la vente");

    expect(await screen.findByText("Vente enregistrée")).toBeDefined();
    expect(action).toHaveBeenCalledWith({ itemId: "i1", paymentMethod: "card", employeeId: "e1" });
    expect(heading()).toBe("Quel article ?");
  });

  it("reste sur le récapitulatif et affiche l'erreur si l'enregistrement échoue", async () => {
    const action = vi.fn<Action>(async () => ({ ok: false, error: "La vente n'a pas été enregistrée. Réessayez." }));
    render(<SaleWizard items={items} employees={employees} action={action} />);
    fillUpToRecap();
    tap("Valider la vente");

    expect(await screen.findByText("La vente n'a pas été enregistrée. Réessayez.")).toBeDefined();
    expect(heading()).toBe("Récapitulatif");
  });
});
