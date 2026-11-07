
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Pasteleria } from "../pasteleria/Pasteleria";
import { CarritoProvider } from "../carrito/CarritoContext";
import { Carrito } from "../carrito/Carrito";

const productos = [
    {
        id: 19,
        nombre: "Muffin de chocolate",
        precio: 3500,
        tipo: "pasteleria" as const,
    },
    {
        id: 20,
        nombre: "Torta de zanahoria",
        precio: 4200,
        tipo: "pasteleria" as const,
    },
    {
        id: 1,
        nombre: "Expreso Pocillo",
        precio: 5020,
        tipo: "expreso" as const,
        tamanio: "Pocillo",
        gramosCafe: 18,
        variedad: {
            nombre: "Brasil",
            precioPorGramo: 140,
            descripcion: "Café brasileño",
        },
    },
];

function renderPasteleria() {
    return render(
        <CarritoProvider>
            <Pasteleria productos={productos} />
            <Carrito />
        </CarritoProvider>,
    );
}

describe("Pasteleria", () => {
    it("muestra los productos de pastelería", async () => {
        renderPasteleria();

        expect(
            await screen.findByText("Muffin de chocolate"),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Torta de zanahoria"),
        ).toBeInTheDocument();
    });

    it("no muestra productos que no sean de pastelería", async () => {
        renderPasteleria();

        await screen.findByText("Muffin de chocolate");

        expect(
            screen.queryByText("Expreso Pocillo"),
        ).not.toBeInTheDocument();
    });

    it("muestra el precio devuelto por la API", async () => {
        renderPasteleria();

        await screen.findByText("Muffin de chocolate");

        expect(screen.getByText("Precio: $3.500")).toBeInTheDocument();
        expect(screen.getByText("Precio: $4.200")).toBeInTheDocument();
    });

    it("agrega el producto seleccionado al carrito con su precio", async () => {
        const user = userEvent.setup();
        renderPasteleria();

        await screen.findByText("Muffin de chocolate");

        await user.click(
            screen.getByRole("button", {
                name: /agregar muffin de chocolate/i,
            }),
        );

        expect(
            await screen.findByText("Precio unitario: $3.500"),
        ).toBeInTheDocument();

        expect(screen.getByText("Cantidad: 1")).toBeInTheDocument();
    });

    it("permite agregar distintos productos de pastelería", async () => {
        const user = userEvent.setup();
        renderPasteleria();

        await screen.findByText("Muffin de chocolate");

        await user.click(
            screen.getByRole("button", {
                name: /agregar torta de zanahoria/i,
            }),
        );

        expect(
            await screen.findByText("Precio unitario: $4.200"),
        ).toBeInTheDocument();

        expect(screen.getByText("Cantidad: 1")).toBeInTheDocument();
    });
});
