
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { obtenerProductos } from "../api/productos.api";

vi.mock("../api/productos.api", () => ({
    obtenerProductos: vi.fn(),
}));

const productos = [
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
    {
        id: 19,
        nombre: "Muffin de chocolate",
        precio: 3500,
        tipo: "pasteleria" as const,
    },
];

describe("App", () => {
    beforeEach(() => {
        vi.mocked(obtenerProductos).mockResolvedValue(productos);
    });

    afterEach(() => {
        window.history.pushState({}, "", "/");
        vi.clearAllMocks();
    });

    it("muestra la mesa que viene en la URL", () => {
        window.history.pushState({}, "", "/?mesa=5");

        render(<App />);

        expect(screen.getByText("Mesa 5")).toBeInTheDocument();
    });

    it("indica que el pedido se retira en la barra si la URL no trae mesa", () => {
        render(<App />);

        expect(screen.getByText("retirar en la barra")).toBeInTheDocument();
    });

    it("ofrece confirmar el pedido, deshabilitado mientras el carrito está vacío", () => {
        render(<App />);

        expect(
            screen.getByRole("button", { name: "Confirmar pedido" }),
        ).toBeDisabled();
    });

    it("muestra el encabezado del menú sin listar productos", () => {
        render(<App />);

        const menu = screen.getByRole("region", { name: "Menú" });

        expect(
            within(menu).getByRole("heading", { name: "Menú" }),
        ).toBeInTheDocument();

        expect(
            within(menu).queryByText("Expreso Pocillo"),
        ).not.toBeInTheDocument();

        expect(
            within(menu).queryByText("$5.020"),
        ).not.toBeInTheDocument();
    });

    it("comparte el mismo carrito entre el selector de café y pastelería", async () => {
        const user = userEvent.setup();

        render(<App />);

        // Esperamos que carguen los selectores.
        await screen.findByRole("heading", { name: "Pastelería" });

        // Seleccionamos un café.
        await user.click(
            screen.getByRole("button", { name: /^expreso$/i }),
        );

        await user.selectOptions(
            screen.getByLabelText(/tamaño/i),
            "Pocillo",
        );

        await user.click(
            screen.getByRole("button", { name: /brasil/i }),
        );

        await user.click(
            screen.getByRole("button", { name: /agregar al carrito/i }),
        );

        // Agregamos un producto de pastelería.
        await user.click(
            screen.getByRole("button", {
                name: /agregar muffin de chocolate/i,
            }),
        );

        // Comprobamos que ambos productos aparecen en el mismo carrito.
        const carrito = screen.getByRole("region", { name: "Carrito" });

        expect(
            await within(carrito).findByText("Expreso Pocillo"),
        ).toBeInTheDocument();

        expect(
            within(carrito).getByText("Muffin de chocolate"),
        ).toBeInTheDocument();

        expect(
            within(carrito).getByText("Precio unitario: $5.020"),
        ).toBeInTheDocument();

        expect(
            within(carrito).getByText("Precio unitario: $3.500"),
        ).toBeInTheDocument();
    });

    it("obtiene los productos una sola vez para café y pastelería", async () => {
        render(<App />);

        await screen.findByRole("heading", { name: "Pastelería" });

        expect(obtenerProductos).toHaveBeenCalledTimes(1);
    });
});
