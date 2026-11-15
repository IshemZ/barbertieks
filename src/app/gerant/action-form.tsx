"use client";

import { useActionState, type ReactNode } from "react";
import type { FormState } from "@/lib/form-input";

type Props = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  children: ReactNode;
  className?: string;
};

/** Formulaire de l'espace gérant : bloqué pendant l'envoi, affiche l'erreur renvoyée par le serveur. */
export function ActionForm({ action, children, className }: Props) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  return (
    <form action={formAction} className={className}>
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
      {state.error && <p className="basis-full text-lg font-medium text-red-600">{state.error}</p>}
    </form>
  );
}
