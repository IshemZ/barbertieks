import Link from "next/link";
import { signIn } from "../actions";
import { LoginForm } from "./login-form";

export const metadata = { title: "Connexion gérant · Barber Tieks" };

export default function ManagerLoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-6 py-10">
      <Link href="/" className="self-start text-lg font-medium underline">
        Retour
      </Link>
      <h1 className="text-3xl font-semibold">Espace gérant</h1>
      <LoginForm action={signIn} />
    </main>
  );
}
