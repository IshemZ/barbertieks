import { expect, test } from "@playwright/test";
import { unlockTill } from "./till";

test("un coiffeur enregistre une vente en 4 étapes", async ({ page }) => {
  await unlockTill(page);
  await page.getByRole("button", { name: /Coupe signature/ }).click();
  await page.getByRole("button", { name: "CB" }).click();
  await page.getByRole("button", { name: "Mehdi" }).click();

  await expect(page.getByRole("heading", { name: "Récapitulatif" })).toBeVisible();
  await expect(page.getByTestId("recap")).toContainText("Coupe signature");
  await page.getByRole("button", { name: "Valider la vente" }).click();

  await expect(page.getByText("Vente enregistrée")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Quel article ?" })).toBeVisible();
});
