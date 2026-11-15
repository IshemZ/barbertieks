import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Les tests lisent la même configuration que le serveur de dev (projet Supabase de développement).
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  // En local, 2 workers suffisent et ménagent la RAM du serveur de dev.
  workers: process.env.CI ? undefined : 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Lance le serveur de dev automatiquement (ou réutilise celui qui tourne déjà en local).
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
