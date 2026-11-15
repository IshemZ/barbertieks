import { useId, type ReactNode } from "react";
import { formatEuros } from "@/lib/money";
import { PAYMENT_LABELS, PAYMENT_METHODS } from "@/lib/payment";
import type { Breakdown, SalesSummary } from "@/lib/sales-summary";

type Props = {
  title: string;
  summary: SalesSummary;
  /** Noms des salariés par identifiant, archivés compris. */
  employeeNames: Record<string, string>;
};

/** Chiffres d'une période : CA total, par type d'article, par mode de paiement et par personne. */
export function SummaryView({ title, summary, employeeNames }: Props) {
  const titleId = useId();
  const people = Object.entries(summary.byEmployee).sort(([, a], [, b]) => b.total - a.total);

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-5 rounded-3xl bg-zinc-100 p-5 dark:bg-zinc-900">
      <div>
        <h2 id={titleId} className="text-lg font-medium text-zinc-500 first-letter:uppercase">
          {title}
        </h2>
        <p className="text-4xl font-semibold">{formatEuros(summary.total)}</p>
        <p className="text-zinc-500">
          {summary.count} {summary.count > 1 ? "ventes" : "vente"}
        </p>
      </div>

      {summary.count === 0 ? (
        <p className="text-lg">Aucune vente.</p>
      ) : (
        <>
          <Block title="Par type">
            <Rows
              rows={[
                ["Prestations", summary.byKind.service],
                ["Produits", summary.byKind.product],
              ]}
            />
          </Block>

          <Block title="Par paiement">
            <Rows rows={PAYMENT_METHODS.map((m) => [PAYMENT_LABELS[m], summary.byPayment[m]])} />
          </Block>

          <Block title="Par personne">
            <ul className="flex flex-col gap-3">
              {people.map(([id, breakdown]) => (
                <li key={id} className="flex flex-col">
                  <span className="flex justify-between text-lg">
                    <span className="font-medium">{employeeNames[id] ?? "Salarié inconnu"}</span>
                    <span className="font-semibold">{formatEuros(breakdown.total)}</span>
                  </span>
                  <span className="text-zinc-500">{personDetail(breakdown)}</span>
                </li>
              ))}
            </ul>
          </Block>
        </>
      )}
    </section>
  );
}

/** Ex. « Espèces 15,00 € · CB 10,00 € · dont produits 10,00 € » (modes à zéro omis). */
function personDetail(b: Breakdown): string {
  const parts = PAYMENT_METHODS.filter((m) => b.byPayment[m] > 0).map(
    (m) => `${PAYMENT_LABELS[m]} ${formatEuros(b.byPayment[m])}`,
  );
  if (b.byKind.product > 0) parts.push(`dont produits ${formatEuros(b.byKind.product)}`);
  return parts.join(" · ");
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-2">
      {children}
    </section>
  );
}

function Rows({ rows }: { rows: [string, number][] }) {
  return (
    <dl className="grid grid-cols-[1fr_auto] gap-y-1 text-lg">
      {rows.map(([label, cents]) => (
        <div key={label} className="contents">
          <dt>{label}</dt>
          <dd className="text-right font-medium">{formatEuros(cents)}</dd>
        </div>
      ))}
    </dl>
  );
}
