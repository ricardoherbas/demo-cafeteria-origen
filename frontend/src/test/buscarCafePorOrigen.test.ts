import { describe, expect, it } from "vitest";
import { buscarCafePorOrigen } from "../cafe/buscarCafePorOrigen";
import type { Producto } from "../api/productos.schema";

const cafes: Extract<Producto, { tipo: "expreso" | "filtrado" }>[] = [
    {
        id: 1,
        nombre: "Expreso Colombia",
        precio: 5020,
        tipo: "expreso",
        tamanio: "chico",
        gramosCafe: 18,
        variedad: {
            nombre: "Colombia",
            precioPorGramo: 100,
            descripcion: "Café colombiano",
        },
    },
    {
        id: 2,
        nombre: "Expreso Brasil",
        precio: 5740,
        tipo: "expreso",
        tamanio: "chico",
        gramosCafe: 18,
        variedad: {
            nombre: "Brasil",
            precioPorGramo: 110,
            descripcion: "Café brasileño",
        },
    },
];

describe("buscarCafePorOrigen", () => {
    it("devuelve el café que coincide con el origen", () => {
        expect(buscarCafePorOrigen(cafes, "Brasil")).toEqual(cafes[1]);
    });

    it("devuelve undefined cuando no existe el origen", () => {
        expect(buscarCafePorOrigen(cafes, "Etiopía")).toBeUndefined();
    });

    it("devuelve undefined cuando el origen está vacío", () => {
        expect(buscarCafePorOrigen(cafes, "")).toBeUndefined();
    });
});
