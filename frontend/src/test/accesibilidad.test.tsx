
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { obtenerProductos } from "../api/productos.api";

vi.mock("../api/productos.api", () => ({
    obtenerProductos: vi.fn(),
}));

const productos = [
    {
        id: 5,
        tipo: "expreso" as const,
        nombre: "Expreso Mediano",
        tamanio: "Mediano",
        gramosCafe: 27,
        variedad: {
            nombre: "Colombia",
            precioPorGramo: 180,
            descripcion: "Acidez media, cuerpo equilibrado y notas cítricas y florales",
        },
        precio: 7360,
    },
    {
        id: 19,
        tipo: "pasteleria" as const,
        nombre: "Muffin de chocolate",
        precio: 2500,
    },
];

function apiConProductos() {
    vi.mocked(obtenerProductos).mockResolvedValue(productos);
}

function apiCaida() {
    vi.mocked(obtenerProductos).mockRejectedValue(new Error("Error interno"));
}

describe("accesibilidad", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("el menú es una región accesible con nombre", () => {
        render(<App />);

        expect(
            screen.getByRole("region", { name: "Menú" }),
        ).toBeInTheDocument();
    });

    it("el menú anuncia el error de carga con role alert", async () => {
        apiCaida();

        render(<App />);

        expect(await screen.findByRole("alert")).toHaveTextContent(
            /no se pudo cargar el menú/i,
        );
    });

    it("todos los botones de la app tienen nombre accesible", async () => {
        apiConProductos();

        render(<App />);

        await screen.findByRole("region", { name: /pastelería/i });

        for (const boton of screen.getAllByRole("button")) {
            expect(boton).toHaveAccessibleName();
        }
    });
});
