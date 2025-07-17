import React from "react";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { Button } from "../button";

// Importer l’extension dans le setup global, pas ici

describe("Button a11y", () => {
  it("doit être accessible sans violation majeure", async () => {
    const { container } = render(<Button>Valider</Button>);
    const results = await axe(container);
    expect(results.violations.length).toBe(0);
  });
}); 