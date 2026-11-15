// Compte gérant dédié aux tests E2E, créé dans le projet de développement par global-setup.ts.
export const E2E_MANAGER = {
  email: "gerant-e2e@example.test",
  password: "mot-de-passe-e2e",
};

// Ventes fixes de janvier 2020, avec les salariés de supabase/seed.sql.
// 15/01/2020 : 55 € (prestations 45 €, produits 10 €). Janvier 2020 : 65 €.
export const FIXTURE_SALES = [
  { at: "2020-01-03T11:00:00+01:00", item: "Barbe avec soin", payment: "cash", employee: "Mehdi" },
  { at: "2020-01-15T10:00:00+01:00", item: "Coupe signature", payment: "cash", employee: "Mehdi" },
  { at: "2020-01-15T10:20:00+01:00", item: "Cire", payment: "card", employee: "Mehdi" },
  // 23 h 30 à Paris : encore le 15 en heure locale, déjà le 15 à 22 h 30 UTC.
  { at: "2020-01-15T23:30:00+01:00", item: "Formule Prestige", payment: "transfer", employee: "Salarié" },
] as const;
