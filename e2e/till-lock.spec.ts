import { expect, test } from "@playwright/test";
import { DEV_PIN, typePin } from "./till";

test("l'accueil propose la caisse du salon ou l'espace gérant", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Espace gérant" }).click();
  await expect(page).toHaveURL(/\/gerant\/connexion$/);

  await page.goto("/");
  await page.getByRole("link", { name: "Caisse du salon" }).click();
  await expect(page.getByRole("heading", { name: "Code caisse" })).toBeVisible();
});

test("un mauvais code est refusé", async ({ page }) => {
  await page.goto("/caisse");
  await typePin(page, "0000");
  await expect(page.getByText("Code incorrect")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Code caisse" })).toBeVisible();
});

test("le bon code ouvre la caisse, qui s'affiche ensuite directement à l'accueil", async ({ page }) => {
  await page.goto("/caisse");
  await typePin(page, DEV_PIN);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Quel article ?" })).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Quel article ?" })).toBeVisible();
  await page.getByRole("link", { name: "Espace gérant" }).click();
  await expect(page).toHaveURL(/\/gerant\/connexion$/);
});
