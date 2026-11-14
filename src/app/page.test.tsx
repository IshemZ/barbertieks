import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

test("la page d'accueil affiche un titre principal", () => {
  render(<Home />);
  expect(screen.getByRole("heading", { level: 1 })).toBeDefined();
});
