# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Produit

Outil d'enregistrement des recettes pour Barber Tieks, un salon de coiffure unique (pas de multi-tenant). Remplace des notes prises à la main sur téléphone.

- Usage smartphone, utilisateurs peu à l'aise avec le numérique : UI mobile-first, très simple, saisie en quelques tapotements.
- **Coiffeurs** (le salarié et le gérant) : saisissent chaque passage client juste après la prestation, et voient leur propre total du jour.
- **Le gérant** (gérant) : consulte en plus les chiffres de tout le salon.

**Exigence n°1 du client : la simplicité.** L'outil ne doit pas être complexe, et le parcours utilisateur doit rester court. Avant d'ajouter un écran, un champ, une étape ou une option, vérifier qu'il est indispensable. Dans le doute, ne pas l'ajouter.

Règles métier clés :

- Un passage = une ou plusieurs prestations à prix fixe (on peut en ajouter pendant la visite) + éventuellement des ventes de produits.
- Chaque coiffeur a sa propre caisse. Modes de paiement : espèces, CB (TPE bancaire), virement.
- Chiffres attendus : CA du jour, CA par personne et par mode de paiement, CA produits séparé des prestations.
- Montants en euros : stocker en centimes (entiers), afficher au format fr-FR.

Décisions pour la V1 (validées avec le client) :

- Chaque coiffeur accède à l'interface sur son propre téléphone.
- Un passage est payé avec un seul mode de paiement.
- Tarifs fixes : aucune remise, aucun prix libre, aucun pourboire.
- Connexion par code pin, seul le gérant voit les chiffres du salon.
- Les ventes de produits comptent dans le CA du salon, mais pas dans le CA du salarié.
- Pas d'écran de clôture du jour.
- Pas de modification ni de suppression d'un passage saisi.
- Pas de calcul de marge produits.
- Base de données : Supabase (Postgres).

Date de livraison souhaitée : 30/11/2026.

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
