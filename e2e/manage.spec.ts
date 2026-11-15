import { expect, test, type Page } from "@playwright/test";
import { E2E_MANAGER } from "./manager";

// Noms uniques : les tests ne suppriment rien, ils archivent.
const stamp = () => `${Date.now()}`.slice(-6);

async function signIn(page: Page) {
  await page.goto("/gerant/connexion");
  await page.getByLabel("E-mail").fill(E2E_MANAGER.email);
  await page.getByLabel("Mot de passe").fill(E2E_MANAGER.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("heading", { name: "Chiffres du salon" })).toBeVisible();
}

async function openTillAtEmployeeStep(page: Page) {
  await page.goto("/");
  const pinPad = page.getByRole("heading", { name: "Code caisse" });
  if (await pinPad.isVisible()) {
    for (const digit of "1234") await page.getByRole("button", { name: digit, exact: true }).click();
  }
  await page.getByRole("button", { name: /Coupe signature/ }).click();
  await page.getByRole("button", { name: "Espèces" }).click();
  await expect(page.getByRole("heading", { name: "Qui a fait la vente ?" })).toBeVisible();
}

test("le gérant ajoute, renomme puis archive un salarié", async ({ page }) => {
  const name = `Test ${stamp()}`;
  await signIn(page);
  await page.getByRole("link", { name: "Salariés" }).click();

  await page.getByLabel("Prénom", { exact: true }).fill(name);
  await page.getByRole("button", { name: "Ajouter" }).click();
  const active = page.getByRole("list", { name: "Salariés actifs" });
  const row = active.getByRole("listitem").filter({ hasText: name });
  await expect(row).toBeVisible();

  await openTillAtEmployeeStep(page);
  await expect(page.getByRole("button", { name })).toBeVisible();

  await page.goto("/gerant/salaries");
  await row.getByText("Modifier le prénom").click();
  await row.getByLabel("Nouveau prénom").fill(`${name} bis`);
  await row.getByRole("button", { name: "Enregistrer" }).click();
  const renamed = active.getByRole("listitem").filter({ hasText: `${name} bis` });
  await expect(renamed).toBeVisible();

  await renamed.getByRole("button", { name: "Archiver" }).click();
  await expect(page.getByRole("list", { name: "Salariés archivés" })).toContainText(`${name} bis`);

  await openTillAtEmployeeStep(page);
  await expect(page.getByRole("button", { name: `${name} bis` })).toHaveCount(0);
});

test("le gérant ajoute, modifie puis archive un produit", async ({ page }) => {
  const name = `Produit test ${stamp()}`;
  await signIn(page);
  await page.getByRole("link", { name: "Catalogue" }).click();

  await page.getByLabel("Nom", { exact: true }).fill(name);
  await page.getByLabel("Produit", { exact: true }).check();
  await page.getByLabel("Prix en euros").first().fill("7,5");
  await page.getByRole("button", { name: "Ajouter" }).click();
  const products = page.getByRole("region", { name: "Produits" });
  const row = products.getByRole("listitem").filter({ hasText: name });
  await expect(row).toContainText(/7,50\s€/);

  await row.getByText("Modifier").click();
  await row.getByLabel("Prix en euros").fill("8");
  await row.getByRole("button", { name: "Enregistrer" }).click();
  await expect(row).toContainText(/8,00\s€/);

  await row.getByRole("button", { name: "Archiver" }).click();
  await expect(page.getByRole("list", { name: "Articles archivés" })).toContainText(name);
  await expect(products.getByRole("listitem").filter({ hasText: name })).toHaveCount(0);
});

test("un prix invalide est refusé avec un message clair", async ({ page }) => {
  await signIn(page);
  await page.goto("/gerant/catalogue");
  await page.getByLabel("Nom", { exact: true }).fill(`Trop cher ${stamp()}`);
  await page.getByLabel("Prestation", { exact: true }).check();
  await page.getByLabel("Prix en euros").first().fill("1500");
  await page.getByRole("button", { name: "Ajouter" }).click();
  await expect(page.getByText("Saisissez un prix entre 0,01 € et 1000 €, par exemple 15 ou 7,50.")).toBeVisible();
});
