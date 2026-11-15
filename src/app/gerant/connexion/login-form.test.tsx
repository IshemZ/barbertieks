import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LoginForm, type LoginFormProps } from "./login-form";

afterEach(cleanup);

type Action = LoginFormProps["action"];

function submit(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));
}

describe("LoginForm", () => {
  it("envoie l'e-mail et le mot de passe", async () => {
    const action = vi.fn<Action>(async () => ({ error: null }));
    render(<LoginForm action={action} />);
    submit("gerant@example.com", "secret");

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    const formData = action.mock.calls[0][1];
    expect(formData.get("email")).toBe("gerant@example.com");
    expect(formData.get("password")).toBe("secret");
  });

  it("affiche l'erreur renvoyée par le serveur", async () => {
    const action = vi.fn<Action>(async () => ({ error: "E-mail ou mot de passe incorrect." }));
    render(<LoginForm action={action} />);
    submit("gerant@example.com", "faux");

    expect(await screen.findByText("E-mail ou mot de passe incorrect.")).toBeDefined();
  });
});
