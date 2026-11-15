"use client";

import { startTransition, useActionState, useState } from "react";
import type { UnlockState } from "./actions/till";

const PIN_LENGTH = 4;
const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

type Props = {
  action: (previous: UnlockState, formData: FormData) => Promise<UnlockState>;
};

/** Pavé numérique d'ouverture de la caisse : le code part tout seul au 4e chiffre. */
export function PinPad({ action }: Props) {
  const [state, dispatch, pending] = useActionState(action, { error: null });
  const [pin, setPin] = useState("");

  function type(digit: string) {
    const next = pin + digit;
    if (next.length < PIN_LENGTH) {
      setPin(next);
      return;
    }
    setPin("");
    const formData = new FormData();
    formData.set("pin", next);
    startTransition(() => dispatch(formData));
  }

  const keyClass =
    "h-20 rounded-2xl bg-zinc-100 text-3xl font-semibold active:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-800 dark:active:bg-zinc-600";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-6 py-10">
      <h1 className="text-center text-2xl font-semibold">Code caisse</h1>

      <div data-testid="pin-dots" className="flex justify-center gap-4" aria-hidden>
        {Array.from({ length: PIN_LENGTH }, (_, i) => (
          <span
            key={i}
            data-filled={i < pin.length}
            className="size-5 rounded-full border-2 border-current data-[filled=true]:bg-current"
          />
        ))}
      </div>

      <p role="alert" className="h-6 text-center text-lg font-medium text-red-600">
        {pending ? "" : state.error}
      </p>

      <div className="grid grid-cols-3 gap-3">
        {DIGITS.map((digit) => (
          <button key={digit} type="button" className={keyClass} disabled={pending} onClick={() => type(digit)}>
            {digit}
          </button>
        ))}
        <span />
        <button type="button" className={keyClass} disabled={pending} onClick={() => type("0")}>
          0
        </button>
        <button
          type="button"
          aria-label="Effacer"
          className={keyClass}
          disabled={pending || pin.length === 0}
          onClick={() => setPin(pin.slice(0, -1))}
        >
          ⌫
        </button>
      </div>
    </main>
  );
}
