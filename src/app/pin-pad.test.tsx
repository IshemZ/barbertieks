import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PinPad } from "./pin-pad";
import type { UnlockState } from "./actions/till";

type UnlockAction = (previous: UnlockState, formData: FormData) => Promise<UnlockState>;

afterEach(cleanup);

const press = (label: string) => fireEvent.click(screen.getByRole("button", { name: label }));
const filled = () => screen.getByTestId("pin-dots").querySelectorAll("[data-filled=true]").length;

describe("PinPad", () => {
  it("envoie le code dès le 4e chiffre", async () => {
    const action = vi.fn<UnlockAction>(async () => ({ error: null }));
    render(<PinPad action={action} />);

    for (const digit of ["1", "2", "3"]) press(digit);
    expect(action).not.toHaveBeenCalled();
    expect(filled()).toBe(3);

    press("4");
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    const formData = action.mock.calls[0][1];
    expect(formData.get("pin")).toBe("1234");
  });

  it("efface le dernier chiffre", () => {
    render(<PinPad action={vi.fn<UnlockAction>()} />);
    press("1");
    press("2");
    press("Effacer");
    expect(filled()).toBe(1);
  });

  it("affiche l'erreur et vide le code si le code est faux", async () => {
    const action = vi.fn<UnlockAction>(async () => ({ error: "Code incorrect" }));
    render(<PinPad action={action} />);

    for (const digit of ["9", "9", "9", "9"]) press(digit);

    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Code incorrect");
    expect(filled()).toBe(0);
  });
});
