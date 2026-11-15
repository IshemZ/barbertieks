import Link from "next/link";
import { signOut } from "../actions";
import { requireManager } from "@/lib/manager-session";

const linkClass = "rounded-xl px-3 py-2 text-lg font-medium active:bg-zinc-200 dark:active:bg-zinc-800";

/** Navigation de l'espace gérant. Chaque page revérifie aussi la connexion (requireManager). */
export default async function ManagerLayout({ children }: LayoutProps<"/gerant">) {
  await requireManager();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-4">
      <nav aria-label="Espace gérant" className="flex flex-wrap items-center gap-1 border-b border-zinc-200 pb-3 dark:border-zinc-800">
        <Link href="/gerant" className={linkClass}>
          Chiffres
        </Link>
        <Link href="/gerant/salaries" className={linkClass}>
          Salariés
        </Link>
        <Link href="/gerant/catalogue" className={linkClass}>
          Catalogue
        </Link>
        <Link href="/" className={linkClass}>
          Caisse
        </Link>
        <form action={signOut} className="ml-auto">
          <button type="submit" className="rounded-xl px-3 py-2 text-lg font-medium text-zinc-500 underline">
            Se déconnecter
          </button>
        </form>
      </nav>
      <main className="flex flex-col gap-6">{children}</main>
    </div>
  );
}
