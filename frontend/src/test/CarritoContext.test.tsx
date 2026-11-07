import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CarritoProvider, useCarrito } from "../carrito/CarritoContext";

function Consumidor() {
    const { estado, dispatch } = useCarrito();

    return (
        <div>
            <p>Productos: {estado.items.length}</p>
            <button
                onClick={() =>
                    dispatch({ tipo: "agregar", producto: { productoId: 19, nombre: "Muffin", precioUnitario: 2500 } })
                }
            >
                Agregar muffin
            </button>
            <button onClick={() => dispatch({ tipo: "vaciar" })}>Vaciar</button>
        </div>
    );
}

describe("CarritoContext", () => {
    it("provee un carrito vacío al empezar", () => {
        render(
            <CarritoProvider>
                <Consumidor />
            </CarritoProvider>,
        );

        expect(screen.getByText("Productos: 0")).toBeInTheDocument();
    });

    it("actualiza el estado cuando se despacha una acción", async () => {
        const usuario = userEvent.setup();
        render(
            <CarritoProvider>
                <Consumidor />
            </CarritoProvider>,
        );

        await usuario.click(screen.getByRole("button", { name: "Agregar muffin" }));
        expect(screen.getByText("Productos: 1")).toBeInTheDocument();

        await usuario.click(screen.getByRole("button", { name: "Vaciar" }));
        expect(screen.getByText("Productos: 0")).toBeInTheDocument();
    });

    it("lanza un error si useCarrito se usa fuera del CarritoProvider", () => {
        vi.spyOn(console, "error").mockImplementation(() => undefined);

        expect(() => render(<Consumidor />)).toThrow("useCarrito debe usarse dentro de CarritoProvider");
    });
});