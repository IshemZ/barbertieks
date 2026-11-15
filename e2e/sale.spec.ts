import { expect, test } from "@playwright/test";

// Code caisse de développement (voir README) et salarié de supabase/seed.sql.
const DEV_PIN = "1234";

test("un coiffeur enregistre une vente en 4 étapes", async ({ page }) => {
  await page.goto("/");
  for (const digit of DEV_PIN) {
    await page.getByRole("button", { name: digit, exact: true }).click();
  }

  await expect(page.getByRole("heading", { name: "Quel article ?" })).toBeVisible();
  await page.getByRole("button", { name: /Coupe signature/ }).click();
  await page.getByRole("button", { name: "CB" }).click();
  await page.getByRole("button", { name: "Mehdi" }).click();

  await expect(page.getByRole("heading", { name: "Récapitulatif" })).toBeVisible();
  await expect(page.getByTestId("recap")).toContainText("Coupe signature");
  await page.getByRole("button", { name: "Valider la vente" }).click();

  await expect(page.getByText("Vente enregistrée")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Quel article ?" })).toBeVisible();
});
