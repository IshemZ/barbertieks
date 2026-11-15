import { isUuid } from "./form-input";
import { isPaymentMethod, type PaymentMethod } from "./payment";

export type SaleInput = {
  itemId: string;
  paymentMethod: PaymentMethod;
  employeeId: string;
};

/**
 * Valide une vente envoyée par le navigateur. Seuls les identifiants et le mode de paiement
 * sont repris : le nom et le prix de l'article sont toujours relus en base.
 */
export function parseSaleInput(input: unknown): SaleInput | null {
  if (typeof input !== "object" || input === null) return null;
  const { itemId, paymentMethod, employeeId } = input as Record<string, unknown>;
  if (!isUuid(itemId)) return null;
  if (!isUuid(employeeId)) return null;
  if (!isPaymentMethod(paymentMethod)) return null;
  return { itemId, paymentMethod, employeeId };
}
