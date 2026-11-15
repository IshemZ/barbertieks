import { signOut } from "./actions";
import { requireManager } from "@/lib/manager-session";

export const metadata = { title: "Espace gérant · Barber Tieks" };

export default async function ManagerHomePage() {
  await requireManager();

  // Tableau de bord : étape suivante de la V1.
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Chiffres du salon</h1>
        <form action={signOut}>
          <button type="submit" className="rounded-xl px-3 py-2 text-lg font-medium underline">
            Se déconnecter
          </button>
        </form>
      </header>
    </main>
  );
}
