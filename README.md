# Barber Tieks

Outil d'enregistrement des recettes du salon Barber Tieks (Next.js + Supabase).

## Mise en place

Suivre les étapes dans l'ordre. Chaque étape dépend de la précédente.

### Prérequis

- Node 26 (`nvm use` lit `.nvmrc`).
- Un compte sur [supabase.com](https://supabase.com).

Il n'y a pas de base locale ni de Docker : le développement se fait sur un projet Supabase distant dédié (`barbertieks-dev`), séparé de la production.

### 1. Installer les dépendances

```bash
npm install
```

La CLI Supabase est installée comme dépendance de dev : on l'appelle avec `npx supabase`.
Elle vise la base locale par défaut : passer `--remote` pour viser le projet lié.

### 2. Créer le projet Supabase de développement

1. Sur supabase.com, créer un projet nommé `barbertieks-dev`, région en Europe.
2. Dans les réglages de sécurité, cocher « Enable Data API », « Automatically expose new tables » et « Enable automatic RLS ».
3. Noter le mot de passe de la base : la CLI le demandera.
4. Noter la référence du projet (`<ref-dev>`), visible dans l'URL du tableau de bord : `https://supabase.com/dashboard/project/<ref-dev>`.

### 3. Lier le dépôt au projet de développement et envoyer le schéma

```bash
npx supabase login
npx supabase link --project-ref <ref-dev>
npx supabase db push --remote --include-seed
```

`db push` applique les migrations de `supabase/migrations/`, puis `supabase/seed.sql` (données de test).
Vérifier dans le tableau de bord (Table Editor) : on doit voir les tables `employees`, `catalog_items` (13 articles) et `sales`.

### 4. Créer le projet Supabase de production

1. Créer un second projet, région Paris (`eu-west-3`), avec les mêmes réglages de sécurité qu'à l'étape 2.
2. Noter le mot de passe de la base et la référence du projet (`<ref-prod>`).

### 5. Envoyer le schéma en production

Le dépôt n'est lié qu'à un seul projet à la fois. Lier la production, envoyer le schéma, puis revenir sur le projet de développement :

```bash
npx supabase link --project-ref <ref-prod>
npx supabase db push --remote
npx supabase link --project-ref <ref-dev>
```

Ne jamais passer `--include-seed` en production : `seed.sql` contient des données de test.

### 6. Désactiver les inscriptions et créer le compte gérant

1. Dans le tableau de bord Supabase : Authentication > Sign In / Providers. Désactiver « Allow new users to sign up ».
2. Dans Authentication > Users : « Add user » > « Create new user ». Saisir l'e-mail et le mot de passe du gérant. Cocher « Auto Confirm User ».

Il n'existe qu'un seul compte : celui du gérant. Les coiffeurs utilisent le code caisse.

### 7. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Remplir `.env.local` :

| Variable                               | Où la trouver                                 |
| -------------------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Project Settings > API                        |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings > API Keys > Publishable key |
| `SUPABASE_SECRET_KEY`                  | Project Settings > API Keys > Secret key      |
| `TILL_PIN_HASH`                        | `npm run hash-pin` (voir ci-dessous)          |
| `TILL_SESSION_SECRET`                  | Chaîne aléatoire : `openssl rand -base64 32`  |

En développement, utiliser l'URL et les clés du projet `barbertieks-dev`.

#### Code caisse

```bash
npm run hash-pin
```

La commande demande le code à 4 chiffres et affiche la ligne `TILL_PIN_HASH=…` à copier dans `.env.local` (ou dans Vercel en production).

- En développement, utiliser le code `1234` : les tests E2E le saisissent.
- Changer le code ferme la caisse sur tous les téléphones. Il faudra saisir le nouveau code.

> **Sécurité** : `SUPABASE_SECRET_KEY` donne un accès total à la base. Ne jamais la préfixer par `NEXT_PUBLIC_`, ne jamais la commiter. `.env.local` est ignoré par Git.

### 8. Créer le compte gérant de développement

```bash
npm run create-manager
```

La commande demande l'e-mail et le mot de passe (12 caractères minimum), puis crée le compte dans la base de `.env.local` (le projet de développement).
Le mot de passe s'affiche pendant la saisie : à n'utiliser que pour un compte de test.
En production, créer le compte depuis le tableau de bord Supabase (étape 6).

Les tests E2E créent leur propre compte (`gerant-e2e@example.test`) dans la base de développement.

### 9. Lancer l'application

```bash
npm run dev
```

- Caisse : <http://localhost:3000> (code `1234` en développement).
- Espace gérant : <http://localhost:3000/gerant>.

## Commandes utiles

| Commande                           | Rôle                                                       |
| ---------------------------------- | ---------------------------------------------------------- |
| `npm run dev`                      | Serveur de développement                                   |
| `npm run build`                    | Build de production (vérifie les types)                    |
| `npm run lint`                     | ESLint                                                     |
| `npm test`                         | Tests unitaires (Vitest)                                   |
| `npm run test:e2e`                 | Tests E2E (Playwright)                                     |
| `npx supabase migration new <nom>` | Créer un fichier de migration vide                         |
| `npx supabase db push --remote`    | Appliquer les migrations au projet lié                     |
| `npm run db:types`                 | Régénérer `src/lib/database.types.ts` depuis le projet lié |
