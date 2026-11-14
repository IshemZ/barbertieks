# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Produit

Application très simple, pensée pour smartphone (UI mobile-first).

- **Coiffeur** : enregistre ses encaissements, client par client (montant + mode de paiement).
- **Gérant** : voit le chiffre d'affaires du jour, et les recettes de chaque coiffeur ventilées par mode de paiement.

Un seul salon (pas de multi-tenant). Modes de paiement : espèces, CB, virement.

Priorité à la simplicité : saisie d'un encaissement en quelques tapotements, pas de fonctionnalités superflues.

## Langue

Tout en français : réponses à l'utilisateur, messages de commit, descriptions de PR, commentaires de code et noms de tests. Les identifiants de code (variables, fonctions, fichiers) restent en anglais.

## Commands

- `npm run dev` — dev server on http://localhost:3000
- `npm run build` — production build (also type-checks)
- `npm run lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)
- `npx tsc --noEmit` — type-check only
- `npm test` — Vitest, single run (`npm run test:watch` for watch mode)
- `npx vitest run src/app/page.test.tsx` — single unit test file (`-t "<name>"` to filter by test name)
- `npm run test:e2e` — Playwright (Chromium only); starts `npm run dev` itself or reuses a running server
- `npx playwright test e2e/home.spec.ts` — single E2E file

## Tests

- Unit tests: Vitest + React Testing Library, jsdom. Colocated as `src/**/*.test.{ts,tsx}` (only that glob is included, see `vitest.config.mts`). Vitest cannot render `async` Server Components: cover those with Playwright.
- E2E tests: Playwright in `e2e/*.spec.ts`, `baseURL` is `http://localhost:3000`, so use `page.goto("/")`.

## Stack

- Next.js 16.4.6 (App Router), React 19.3, TypeScript strict.
- Tailwind CSS 4.3 loaded through the `@tailwindcss/turbopack` loader declared in `next.config.ts` (`turbopack.rules` for `*.css`). There is no `postcss.config.*` and no `tailwind.config.*`: theme tokens live in `src/app/globals.css` under `@theme inline`.
- Node 26: `.nvmrc` pins `v26.13.0`, `package.json` `engines` requires `26.x`.

## Next.js docs

Next.js 16 differs from older versions (see AGENTS.md). Read the bundled docs before writing Next code: `node_modules/next/dist/docs/` (`01-app/` for the App Router, `03-architecture/`, `index.md`).
Example of a v16-specific API already in use: the global `LayoutProps<"/">` type in `src/app/layout.tsx` (route-aware typed props, no import).

## Structure

- App code lives under `src/`; import alias `@/*` maps to `./src/*`.
- `src/app/` holds routes. The app is still the create-next-app starter (`layout.tsx`, `page.tsx`, `globals.css`).

## Git

- Work on `develop`; PRs target `main`.
