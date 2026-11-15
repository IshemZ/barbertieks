import Link from "next/link";
import { signOut } from "./actions";
import { SummaryView } from "./summary-view";
import { requireManager } from "@/lib/manager-session";
import { addDays, dayLabel, dayRange, isDateString, monthLabel, monthRange, parisDate } from "@/lib/paris-time";
import { fetchEmployeeNames, fetchSales } from "@/lib/sales-queries";
import { summarizeSales } from "@/lib/sales-summary";

export const metadata = { title: "Espace gérant · Barber Tieks" };

const navClass = "rounded-xl bg-zinc-100 px-4 py-3 text-lg font-medium active:bg-zinc-300 dark:bg-zinc-800";

export default async function ManagerHomePage({ searchParams }: PageProps<"/gerant">) {
  await requireManager();

  const { jour } = await searchParams;
  const today = parisDate();
  const day = isDateString(jour) ? jour : today;

  // Une seule lecture pour le mois ; le jour en est extrait.
  const [monthSales, employeeNames] = await Promise.all([fetchSales(monthRange(day)), fetchEmployeeNames()]);
  const { start, end } = dayRange(day);
  const daySales = monthSales.filter((s) => {
    const at = Date.parse(s.created_at);
    return at >= Date.parse(start) && at < Date.parse(end);
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Chiffres du salon</h1>
        <form action={signOut}>
          <button type="submit" className="rounded-xl px-3 py-2 text-lg font-medium underline">
            Se déconnecter
          </button>
        </form>
      </header>

      <nav aria-label="Choix du jour" className="flex flex-wrap gap-2">
        <Link href={`/gerant?jour=${addDays(day, -1)}`} className={navClass}>
          ← Jour précédent
        </Link>
        {day < today && (
          <Link href={`/gerant?jour=${addDays(day, 1)}`} className={navClass}>
            Jour suivant →
          </Link>
        )}
        {day !== today && (
          <Link href="/gerant" className={navClass}>
            Aujourd&apos;hui
          </Link>
        )}
      </nav>

      <SummaryView
        title={day === today ? `Aujourd'hui, ${dayLabel(day)}` : dayLabel(day)}
        summary={summarizeSales(daySales)}
        employeeNames={employeeNames}
      />
      <SummaryView title={monthLabel(day)} summary={summarizeSales(monthSales)} employeeNames={employeeNames} />
    </main>
  );
}
