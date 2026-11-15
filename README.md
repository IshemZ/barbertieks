# Barber Tieks

Outil d'enregistrement des recettes du salon Barber Tieks (Next.js + Supabase).

## Mise en place

Suivre les étapes dans l'ordre. Chaque étape dépend de la précédente.

### Prérequis

- Node 26 (`nvm use` lit `.nvmrc`).
- Docker Desktop, pour la base Supabase locale.
- Un compte sur [supabase.com](https://supabase.com).

### 1. Installer les dépendances

```bash
npm install
```

La CLI Supabase est installée comme dépendance de dev : on l'appelle avec `npx supabase`.

### 2. Lancer la base locale

1. Ouvrir Docker Desktop et attendre qu'il soit démarré.
2. Démarrer Supabase en local :

   ```bash
   npx supabase start
   ```

   La commande applique les migrations de `supabase/migrations/`, puis `supabase/seed.sql` (données de test).
   Elle affiche à la fin l'URL de l'API, la clé publishable et la clé secrète locales.

3. Vérifier le schéma dans le Studio local : <http://localhost:54323>.
   On doit voir les tables `employees`, `catalog_items` (13 articles) et `sales`.

Arrêter la base locale : `npx supabase stop`.
Repartir de zéro (efface les données locales) : `npx supabase db reset`.

### 3. Créer le projet Supabase de production

1. Sur supabase.com, créer un projet. Choisir une région en Europe, par exemple Paris (`eu-west-3`).
2. Noter le mot de passe de la base : la CLI le demandera.
3. Noter la référence du projet (`<ref>`), visible dans l'URL du tableau de bord : `https://supabase.com/dashboard/project/<ref>`.

### 4. Lier le dépôt au projet de production

```bash
npx supabase login
npx supabase link --project-ref <ref>
```

### 5. Envoyer le schéma en production

```bash
npx supabase db push
```

Seules les migrations sont appliquées. `seed.sql` n'est jamais envoyé en production.

### 6. Désactiver les inscriptions et créer le compte gérant

1. Dans le tableau de bord Supabase : Authentication > Sign In / Providers. Désactiver « Allow new users to sign up ».
2. Dans Authentication > Users : « Add user » > « Create new user ». Saisir l'e-mail et le mot de passe du gérant. Cocher « Auto Confirm User ».

Il n'existe qu'un seul compte : celui du gérant. Les coiffeurs utilisent le code caisse.

### 7. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Remplir `.env.local` :

| Variable                               | Où la trouver                                          |
| -------------------------------------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | Project Settings > API (ou sortie de `supabase start`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings > API Keys > Publishable key          |
| `SUPABASE_SECRET_KEY`                  | Project Settings > API Keys > Secret key               |
| `TILL_PIN_HASH`                        | `npm run hash-pin` (voir ci-dessous)                   |
| `TILL_SESSION_SECRET`                  | Chaîne aléatoire : `openssl rand -base64 32`           |

En développement local, utiliser l'URL et les clés affichées par `npx supabase status`.

#### Code caisse

```bash
npm run hash-pin
```

La commande demande le code à 4 chiffres et affiche la ligne `TILL_PIN_HASH=…` à copier dans `.env.local` (ou dans Vercel en production).

- En local, utiliser le code `1234` : les tests E2E le saisissent.
- Changer le code ferme la caisse sur tous les téléphones. Il faudra saisir le nouveau code.

> **Sécurité** : `SUPABASE_SECRET_KEY` donne un accès total à la base. Ne jamais la préfixer par `NEXT_PUBLIC_`, ne jamais la commiter. `.env.local` est ignoré par Git.

### 8. Créer le compte gérant en local

```bash
npm run create-manager
```

La commande demande l'e-mail et le mot de passe (12 caractères minimum), puis crée le compte dans la base de `.env.local`.
Le mot de passe s'affiche pendant la saisie : à n'utiliser que pour un compte local.
En production, créer le compte depuis le tableau de bord Supabase (étape 6).

Les tests E2E créent leur propre compte (`gerant-e2e@example.test`) dans la base locale.

### 9. Lancer l'application

```bash
npm run dev
```

- Caisse : <http://localhost:3000> (code `1234` en local).
- Espace gérant : <http://localhost:3000/gerant>.

## Commandes utiles

| Commande               | Rôle                                         |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Serveur de développement                     |
| `npm run build`        | Build de production (vérifie les types)      |
| `npm run lint`         | ESLint                                       |
| `npm test`             | Tests unitaires (Vitest)                     |
| `npm run test:e2e`     | Tests E2E (Playwright)                       |
| `npx supabase db diff` | Générer une migration depuis le Studio local |
