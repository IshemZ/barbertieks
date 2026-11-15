import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Welcome } from "./welcome";

afterEach(cleanup);

it("propose d'ouvrir la caisse du salon ou l'espace gérant", () => {
  render(<Welcome />);
  expect(screen.getByRole("link", { name: "Caisse du salon" }).getAttribute("href")).toBe("/caisse");
  expect(screen.getByRole("link", { name: "Espace gérant" }).getAttribute("href")).toBe("/gerant");
});
