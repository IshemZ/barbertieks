import { expect, type Page } from "@playwright/test";

// Code caisse de développement : TILL_PIN_HASH doit être le hash de « 1234 » (voir README).
export const DEV_PIN = "1234";

export async function typePin(page: Page, pin: string) {
  for (const digit of pin) {
    await page.getByRole("button", { name: digit, exact: true }).click();
  }
}

/** Ouvre la caisse sur ce navigateur et attend l'étape 1 de la vente. */
export async function unlockTill(page: Page) {
  await page.goto("/caisse");
  if (await page.getByRole("heading", { name: "Code caisse" }).isVisible()) await typePin(page, DEV_PIN);
  await expect(page.getByRole("heading", { name: "Quel article ?" })).toBeVisible();
}
