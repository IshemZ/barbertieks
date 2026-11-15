import { expect, test, type Page } from "@playwright/test";
import { E2E_MANAGER } from "./manager";
import { unlockTill } from "./till";

async function signIn(page: Page, password: string) {
  await page.goto("/gerant/connexion");
  await page.getByLabel("E-mail").fill(E2E_MANAGER.email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

test("l'espace gérant redirige vers la connexion sans session", async ({ page }) => {
  await page.goto("/gerant");
  await expect(page).toHaveURL(/\/gerant\/connexion$/);
});

test("un mauvais mot de passe est refusé", async ({ page }) => {
  await signIn(page, "mauvais-mot-de-passe");
  await expect(page.getByText("E-mail ou mot de passe incorrect.")).toBeVisible();
  await expect(page).toHaveURL(/\/gerant\/connexion$/);
});

test("le gérant se connecte, reste connecté puis se déconnecte", async ({ page }) => {
  await signIn(page, E2E_MANAGER.password);
  await expect(page.getByRole("heading", { name: "Chiffres du salon" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Chiffres du salon" })).toBeVisible();

  await page.goto("/gerant/connexion");
  await expect(page).toHaveURL(/\/gerant$/);

  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page).toHaveURL(/\/gerant\/connexion$/);
  await page.goto("/gerant");
  await expect(page).toHaveURL(/\/gerant\/connexion$/);
});

test("la caisse ne donne pas accès à l'espace gérant", async ({ page }) => {
  await unlockTill(page);

  await page.goto("/gerant");
  await expect(page).toHaveURL(/\/gerant\/connexion$/);
});

test("le gérant connecté encaisse depuis son espace sans code caisse", async ({ page }) => {
  await signIn(page, E2E_MANAGER.password);
  await expect(page.getByRole("heading", { name: "Chiffres du salon" })).toBeVisible();

  await page.getByRole("link", { name: "Caisse", exact: true }).click();
  await page.getByRole("button", { name: /Coupe signature/ }).click();
  await page.getByRole("button", { name: "Espèces" }).click();
  await page.getByRole("button", { name: "Mehdi" }).click();
  await page.getByRole("button", { name: "Valider la vente" }).click();
  await expect(page.getByText("Vente enregistrée")).toBeVisible();

  await page.getByRole("link", { name: "Espace gérant" }).click();
  await expect(page.getByRole("heading", { name: "Chiffres du salon" })).toBeVisible();
});
