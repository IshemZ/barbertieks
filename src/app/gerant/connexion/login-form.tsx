"use client";

import { useActionState } from "react";
import type { SignInState } from "../actions";

export type LoginFormProps = {
  action: (previous: SignInState, formData: FormData) => Promise<SignInState>;
};

const inputClass =
  "min-h-14 rounded-2xl border-2 border-zinc-300 bg-transparent px-4 text-xl focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:focus:border-zinc-100";

export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2 text-lg font-medium">
        E-mail
        <input name="email" type="email" autoComplete="email" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-2 text-lg font-medium">
        Mot de passe
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </label>
      {state.error && <p className="text-lg font-medium text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="min-h-16 rounded-2xl bg-zinc-900 text-xl font-semibold text-white active:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
