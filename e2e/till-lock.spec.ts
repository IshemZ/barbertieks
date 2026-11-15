import { expect, test, type Page } from "@playwright/test";

// Code caisse de développement : .env.local doit contenir le hash de « 1234 » (voir README).
const DEV_PIN = "1234";

async function typePin(page: Page, pin: string) {
  for (const digit of pin) {
    await page.getByRole("button", { name: digit, exact: true }).click();
  }
}

test("la caisse est verrouillée par défaut", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Code caisse" })).toBeVisible();
});

test("un mauvais code est refusé", async ({ page }) => {
  await page.goto("/");
  await typePin(page, "0000");
  await expect(page.getByText("Code incorrect")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Code caisse" })).toBeVisible();
});

test("le bon code ouvre la caisse, qui reste ouverte après rechargement", async ({ page }) => {
  await page.goto("/");
  await typePin(page, DEV_PIN);
  await expect(page.getByRole("heading", { name: "Quel article ?" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Quel article ?" })).toBeVisible();
});
