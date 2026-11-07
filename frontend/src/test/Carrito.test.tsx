import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CarritoProvider, useCarrito } from "../carrito/CarritoContext";
import { Carrito } from "../carrito/Carrito";

// consumidor auxiliar: permite cargar un producto en el carrito a través del Context
function CargarMuffin() {
    const { dispatch } = useCarrito();

    return (
        <button
            onClick={() =>
                dispatch({
                    tipo: "agregar",
                    producto: { productoId: 19, nombre: "Muffin", precioUnitario: 2500 },
                })
            }
        >
            Cargar muffin
        </button>
    );
}

function prepararCarrito() {
    return render(
        <CarritoProvider>
            <CargarMuffin />
            <Carrito />
        </CarritoProvider>,
    );
}

async function cargarMuffin() {
    const usuario = userEvent.setup();
    prepararCarrito();
    await usuario.click(screen.getByRole("button", { name: "Cargar muffin" }));

    return usuario;
}

describe("Carrito", () => {
    it("muestra un mensaje cuando el carrito está vacío", () => {
        prepararCarrito();

        expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
    });

    it("muestra nombre, cantidad y precio unitario del producto", async () => {
        await cargarMuffin();

        expect(screen.getByRole("heading", { name: "Muffin" })).toBeInTheDocument();
        expect(screen.getByText("Cantidad: 1")).toBeInTheDocument();
        expect(screen.getByText("Precio unitario: $2.500")).toBeInTheDocument();
        expect(screen.queryByText("Tu carrito está vacío")).not.toBeInTheDocument();
    });

    it("permite sumar unidades de un producto", async () => {
        const usuario = await cargarMuffin();

        await usuario.click(screen.getByRole("button", { name: "Sumar Muffin" }));

        expect(screen.getByText("Cantidad: 2")).toBeInTheDocument();
    });

    it("permite restar unidades y quitar el producto al llegar a cero", async () => {
        const usuario = await cargarMuffin();
        await usuario.click(screen.getByRole("button", { name: "Sumar Muffin" }));

        await usuario.click(screen.getByRole("button", { name: "Restar Muffin" }));
        expect(screen.getByText("Cantidad: 1")).toBeInTheDocument();

        await usuario.click(screen.getByRole("button", { name: "Restar Muffin" }));
        expect(screen.queryByRole("heading", { name: "Muffin" })).not.toBeInTheDocument();
        expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
    });

    it("permite quitar un producto directamente", async () => {
        const usuario = await cargarMuffin();
        await usuario.click(screen.getByRole("button", { name: "Sumar Muffin" }));

        await usuario.click(screen.getByRole("button", { name: "Quitar Muffin" }));

        expect(screen.queryByRole("heading", { name: "Muffin" })).not.toBeInTheDocument();
        expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
    });

    it("muestra el subtotal por producto y el subtotal general", async () => {
        const usuario = await cargarMuffin();

        expect(screen.getByText("Subtotal: $2.500")).toBeInTheDocument();
        expect(screen.getByText("Subtotal general (orientativo): $2.500")).toBeInTheDocument();

        await usuario.click(screen.getByRole("button", { name: "Sumar Muffin" }));

        expect(screen.getByText("Subtotal: $5.000")).toBeInTheDocument();
        expect(screen.getByText("Subtotal general (orientativo): $5.000")).toBeInTheDocument();
    });

    it("no muestra subtotal general cuando el carrito está vacío", () => {
        prepararCarrito();

        expect(screen.queryByText(/Subtotal general/)).not.toBeInTheDocument();
    });

    it("identifica accesiblemente los controles de cada producto", async () => {
        await cargarMuffin();

        expect(screen.getByRole("listitem", { name: "Muffin" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Sumar Muffin" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Restar Muffin" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Quitar Muffin" })).toBeInTheDocument();
    });
});