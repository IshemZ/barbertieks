const euros = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

/** Formate un montant stocké en centimes, ex. 1500 → « 15,00 € ». */
export function formatEuros(cents: number): string {
  return euros.format(cents / 100);
}
