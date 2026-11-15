import type { PaymentMethod } from "./payment";

export type { PaymentMethod };
export type ItemKind = "service" | "product";

export type SaleLine = {
  price_cents: number;
  kind: ItemKind;
  payment_method: PaymentMethod;
  employee_id: string;
};

export type Breakdown = {
  total: number;
  byKind: Record<ItemKind, number>;
  byPayment: Record<PaymentMethod, number>;
};

export type SalesSummary = Breakdown & {
  count: number;
  byEmployee: Record<string, Breakdown>;
};

const emptyBreakdown = (): Breakdown => ({
  total: 0,
  byKind: { service: 0, product: 0 },
  byPayment: { cash: 0, card: 0, transfer: 0 },
});

function add(b: Breakdown, sale: SaleLine) {
  b.total += sale.price_cents;
  b.byKind[sale.kind] += sale.price_cents;
  b.byPayment[sale.payment_method] += sale.price_cents;
}

/** Calcule le CA total, par type d'article, par mode de paiement et par personne (montants en centimes). */
export function summarizeSales(sales: SaleLine[]): SalesSummary {
  const summary: SalesSummary = { ...emptyBreakdown(), count: 0, byEmployee: {} };
  for (const sale of sales) {
    summary.count += 1;
    add(summary, sale);
    summary.byEmployee[sale.employee_id] ??= emptyBreakdown();
    add(summary.byEmployee[sale.employee_id], sale);
  }
  return summary;
}
