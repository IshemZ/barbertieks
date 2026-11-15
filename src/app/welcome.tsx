import Link from "next/link";

const choiceClass =
  "flex min-h-20 items-center justify-center rounded-2xl px-5 text-2xl font-semibold active:opacity-80";

/** Accueil d'un téléphone dont la caisse n'est pas encore ouverte : salon ou gérant. */
export function Welcome() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-10">
      <h1 className="text-center text-3xl font-semibold">Barber Tieks</h1>
      <Link href="/caisse" className={`${choiceClass} bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900`}>
        Caisse du salon
      </Link>
      <Link href="/gerant" className={`${choiceClass} bg-zinc-100 dark:bg-zinc-800`}>
        Espace gérant
      </Link>
    </main>
  );
}
