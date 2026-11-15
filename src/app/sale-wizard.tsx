"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import type { RecordSaleResult } from "./actions/sales";
import { formatEuros } from "@/lib/money";
import { PAYMENT_LABELS, PAYMENT_METHODS, type PaymentMethod } from "@/lib/payment";
import type { SaleInput } from "@/lib/sale-input";
import type { ItemKind } from "@/lib/sales-summary";

type Item = { id: string; name: string; kind: ItemKind; price_cents: number };
type Employee = { id: string; name: string };

export type SaleWizardProps = {
  items: Item[];
  employees: Employee[];
  action: (input: SaleInput) => Promise<RecordSaleResult>;
};

const TITLES = ["Quel article ?", "Quel paiement ?", "Qui a fait la vente ?", "Récapitulatif"];

const choiceClass =
  "flex min-h-16 w-full items-center justify-between gap-4 rounded-2xl bg-zinc-100 px-5 py-4 text-left text-xl font-medium active:bg-zinc-300 dark:bg-zinc-800 dark:active:bg-zinc-600";

/** Saisie d'une vente en 4 étapes : article, paiement, salarié, récapitulatif. */
export function SaleWizard({ items, employees, action }: SaleWizardProps) {
  const [item, setItem] = useState<Item | null>(null);
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const step = !item ? 1 : !payment ? 2 : !employee ? 3 : 4;

  function back() {
    setError(null);
    if (employee) setEmployee(null);
    else if (payment) setPayment(null);
    else setItem(null);
  }

  function pickItem(next: Item) {
    setSaved(false);
    setItem(next);
  }

  function confirm() {
    if (!item || !payment || !employee) return;
    setError(null);
    startTransition(async () => {
      const result = await action({ itemId: item.id, paymentMethod: payment, employeeId: employee.id });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setItem(null);
      setPayment(null);
      setEmployee(null);
      setSaved(true);
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6">
      <header className="flex min-h-12 items-center justify-between">
        {step > 1 ? (
          <button type="button" onClick={back} disabled={pending} className="rounded-xl px-3 py-2 text-lg font-medium underline">
            Retour
          </button>
        ) : (
          <span />
        )}
        <span className="text-lg text-zinc-500">Étape {step}/4</span>
      </header>

      <h1 className="text-3xl font-semibold">{TITLES[step - 1]}</h1>

      {saved && (
        <p role="status" className="rounded-2xl bg-green-100 px-5 py-4 text-xl font-medium text-green-900">
          Vente enregistrée
        </p>
      )}

      {step === 1 && (
        <>
          <ItemGroup title="Prestations" items={items.filter((i) => i.kind === "service")} onPick={pickItem} />
          <ItemGroup title="Produits" items={items.filter((i) => i.kind === "product")} onPick={pickItem} />
          {items.length === 0 && <p className="text-lg">Aucun article. Le gérant doit en ajouter dans son espace.</p>}
          <Link href="/gerant" className="mt-auto self-center px-3 py-2 text-zinc-500 underline">
            Espace gérant
          </Link>
        </>
      )}

      {step === 2 && (
        <Choices>
          {PAYMENT_METHODS.map((method) => (
            <button key={method} type="button" className={choiceClass} onClick={() => setPayment(method)}>
              {PAYMENT_LABELS[method]}
            </button>
          ))}
        </Choices>
      )}

      {step === 3 &&
        (employees.length === 0 ? (
          <p className="text-lg">Aucun salarié. Le gérant doit en ajouter dans son espace.</p>
        ) : (
          <Choices>
            {employees.map((e) => (
              <button key={e.id} type="button" className={choiceClass} onClick={() => setEmployee(e)}>
                {e.name}
              </button>
            ))}
          </Choices>
        ))}

      {step === 4 && item && payment && employee && (
        <>
          <dl data-testid="recap" className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-xl">
            <dt className="text-zinc-500">Article</dt>
            <dd className="font-medium">{item.name}</dd>
            <dt className="text-zinc-500">Prix</dt>
            <dd className="font-medium">{formatEuros(item.price_cents)}</dd>
            <dt className="text-zinc-500">Paiement</dt>
            <dd className="font-medium">{PAYMENT_LABELS[payment]}</dd>
            <dt className="text-zinc-500">Salarié</dt>
            <dd className="font-medium">{employee.name}</dd>
          </dl>
          {error && <p className="text-lg font-medium text-red-600">{error}</p>}
          <button
            type="button"
            onClick={confirm}
            disabled={pending}
            className="mt-auto min-h-16 rounded-2xl bg-green-700 px-5 text-xl font-semibold text-white active:bg-green-900 disabled:opacity-60"
          >
            {pending ? "Enregistrement…" : "Valider la vente"}
          </button>
        </>
      )}
    </main>
  );
}

function Choices({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

function ItemGroup({ title, items, onPick }: { title: string; items: Item[]; onPick: (item: Item) => void }) {
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-zinc-500">{title}</h2>
      {items.map((item) => (
        <button key={item.id} type="button" className={choiceClass} onClick={() => onPick(item)}>
          <span>{item.name}</span>
          <span className="shrink-0 text-zinc-500">{formatEuros(item.price_cents)}</span>
        </button>
      ))}
    </section>
  );
}
