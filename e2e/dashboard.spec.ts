import { expect, test, type Page } from "@playwright/test";
import { E2E_MANAGER } from "./manager";

async function signIn(page: Page) {
  await page.goto("/gerant/connexion");
  await page.getByLabel("E-mail").fill(E2E_MANAGER.email);
  await page.getByLabel("Mot de passe").fill(E2E_MANAGER.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("heading", { name: "Chiffres du salon" })).toBeVisible();
}

const region = (page: Page, name: string | RegExp) => page.getByRole("region", { name, exact: true });

test("le gérant voit les chiffres du jour et du mois", async ({ page }) => {
  await signIn(page);
  await page.goto("/gerant?jour=2020-01-15");

  const day = region(page, "mercredi 15 janvier 2020");
  await expect(day).toContainText("55,00 €");
  await expect(day).toContainText("3 ventes");
  await expect(day.getByRole("region", { name: "Par type" })).toContainText(/Prestations45,00\s€Produits10,00\s€/);
  await expect(day.getByRole("region", { name: "Par paiement" })).toContainText(
    /Espèces15,00\s€CB10,00\s€Virement30,00\s€/,
  );
  const people = day.getByRole("region", { name: "Par personne" }).getByRole("listitem");
  await expect(people).toHaveCount(2);
  await expect(people.first()).toContainText("Salarié");
  await expect(people.first()).toContainText("30,00 €");

  const month = region(page, "janvier 2020");
  await expect(month).toContainText("65,00 €");
  await expect(month).toContainText("4 ventes");
});

test("le gérant navigue d'un jour à l'autre", async ({ page }) => {
  await signIn(page);
  await page.goto("/gerant?jour=2020-01-15");

  await page.getByRole("link", { name: "← Jour précédent" }).click();
  await expect(page).toHaveURL(/jour=2020-01-14$/);
  await expect(region(page, "mardi 14 janvier 2020")).toContainText("Aucune vente.");

  await page.getByRole("link", { name: "Aujourd'hui" }).click();
  await expect(region(page, /^Aujourd'hui/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Jour suivant →" })).toHaveCount(0);
});
