import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EncabezadoMesa } from "../mesa/EncabezadoMesa";

describe("EncabezadoMesa", () => {
    it("muestra el nombre de la cafetería como título", () => {
        render(<EncabezadoMesa mesa={null} />);

        expect(
            screen.getByRole("heading", {
                level: 1,
                name: "Cafetería Origen",
            }),
        ).toBeInTheDocument();
    });

    it("muestra el número de mesa cuando hay mesa", () => {
        render(<EncabezadoMesa mesa={7} />);

        expect(screen.getByText("Mesa 7")).toBeInTheDocument();
    });

    it("indica que el pedido se retira en la barra cuando no hay mesa", () => {
        render(<EncabezadoMesa mesa={null} />);

        expect(screen.getByText("retirar en la barra")).toBeInTheDocument();
        expect(screen.queryByText(/^Mesa \d+$/)).not.toBeInTheDocument();
    });
});