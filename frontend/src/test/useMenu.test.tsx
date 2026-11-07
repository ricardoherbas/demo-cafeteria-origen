
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { obtenerProductos } from "../api/productos.api";
import type { Producto } from "../api/productos.schema";
import { useMenu } from "../menu/useMenu";

vi.mock("../api/productos.api", () => ({
    obtenerProductos: vi.fn(),
}));

const productos: Producto[] = [
    {
        id: 1,
        nombre: "Expreso Pocillo",
        precio: 5020,
        tipo: "expreso",
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
        tipo: "pasteleria",
    },
];

describe("useMenu", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("comienza en estado cargando", () => {
        vi.mocked(obtenerProductos).mockReturnValue(
            new Promise<Producto[]>(() => {}),
        );

        const { result } = renderHook(() => useMenu());

        expect(result.current.estado).toBe("cargando");
        expect(result.current.reintentar).toBeTypeOf("function");
    });

    it("pasa a estado listo cuando carga los productos", async () => {
        vi.mocked(obtenerProductos).mockResolvedValue(productos);

        const { result } = renderHook(() => useMenu());

        await waitFor(() => {
            expect(result.current.estado).toBe("listo");
        });

        if (result.current.estado === "listo") {
            expect(result.current.productos).toEqual(productos);
        }

        expect(obtenerProductos).toHaveBeenCalledTimes(1);
    });

    it("pasa a estado error cuando falla la carga", async () => {
        vi.mocked(obtenerProductos).mockRejectedValue(
            new Error("Error al cargar los productos"),
        );

        const { result } = renderHook(() => useMenu());

        await waitFor(() => {
            expect(result.current.estado).toBe("error");
        });

        expect(obtenerProductos).toHaveBeenCalledTimes(1);
    });
});
