
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { obtenerProductos } from "../api/productos.api";
import { CarritoProvider } from "../carrito/CarritoContext";
import { Menu } from "../menu/Menu";

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

function renderMenu() {
    return render(
        <CarritoProvider>
            <Menu />
        </CarritoProvider>,
    );
}

describe("Menu", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(obtenerProductos).mockResolvedValue(productos);
    });

    it("muestra el encabezado del menú", () => {
        renderMenu();

        expect(
            screen.getByRole("heading", { name: "Menú" }),
        ).toBeInTheDocument();
    });

    it("es una región accesible con el nombre Menú", () => {
        renderMenu();

        expect(
            screen.getByRole("region", { name: "Menú" }),
        ).toBeInTheDocument();
    });

    it("carga los productos y muestra los selectores de café y pastelería", async () => {
        renderMenu();

        expect(
            await screen.findByRole("heading", {
                name: "Seleccioná tu café",
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", { name: "Pastelería" }),
        ).toBeInTheDocument();

        expect(obtenerProductos).toHaveBeenCalledTimes(1);
    });

    it("permite reintentar la carga cuando ocurre un error", async () => {
        const user = userEvent.setup();

        vi.mocked(obtenerProductos)
            .mockRejectedValueOnce(new Error("Error de conexión"))
            .mockResolvedValueOnce(productos);

        renderMenu();

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "No se pudo cargar el menú.",
        );

        await user.click(
            screen.getByRole("button", { name: "Reintentar" }),
        );

        expect(
            await screen.findByRole("heading", {
                name: "Seleccioná tu café",
            }),
        ).toBeInTheDocument();

        expect(obtenerProductos).toHaveBeenCalledTimes(2);
    });
});
