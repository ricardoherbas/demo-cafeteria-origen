
//prueba de humo: comprueba que vitest, jsdom y jest-dom funcionan juntos
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("entorno de tests", () => {
    it("tiene DOM y los matchers de jest-dom", () => {
        document.body.innerHTML = "<button disabled>Confirmar</button>";

        expect(screen.getByRole("button", { name: "Confirmar" })).toBeDisabled();
    });
});