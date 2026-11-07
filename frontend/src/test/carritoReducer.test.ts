import { describe, expect, it } from "vitest";
import { carritoReducer, estadoInicial } from "../carrito/carritoReducer";
import type { EstadoCarrito, ProductoCarrito } from "../carrito/carritoReducer";

const muffin: ProductoCarrito = { productoId: 19, nombre: "Muffin", precioUnitario: 2500 };
const expreso: ProductoCarrito = { productoId: 5, nombre: "Expreso Mediano Colombia", precioUnitario: 7360 };

const conMuffinYExpreso: EstadoCarrito = {
    items: [
        { ...muffin, cantidad: 2 },
        { ...expreso, cantidad: 1 },
    ],
};

describe("carritoReducer", () => {
    it("arranca vacío", () => {
        expect(estadoInicial.items).toEqual([]);
    });

    describe("agregar", () => {
        it("agrega un producto nuevo con cantidad 1", () => {
            const resultado = carritoReducer(estadoInicial, { tipo: "agregar", producto: muffin });

            expect(resultado.items).toEqual([{ ...muffin, cantidad: 1 }]);
        });

        it("suma una unidad si el producto ya está en el carrito", () => {
            const resultado = carritoReducer(conMuffinYExpreso, { tipo: "agregar", producto: muffin });

            expect(resultado.items).toHaveLength(2);
            expect(resultado.items[0]).toEqual({ ...muffin, cantidad: 3 });
        });

        it("mantiene el orden en que se agregaron los productos", () => {
            const conMuffin = carritoReducer(estadoInicial, { tipo: "agregar", producto: muffin });
            const resultado = carritoReducer(conMuffin, { tipo: "agregar", producto: expreso });

            expect(resultado.items.map((item) => item.productoId)).toEqual([19, 5]);
        });
    });

    describe("sumar", () => {
        it("aumenta en 1 la cantidad del producto", () => {
            const resultado = carritoReducer(conMuffinYExpreso, { tipo: "sumar", productoId: 5 });

            expect(resultado.items[1].cantidad).toBe(2);
            expect(resultado.items[0].cantidad).toBe(2);
        });

        it("no cambia nada si el producto no está en el carrito", () => {
            const resultado = carritoReducer(conMuffinYExpreso, { tipo: "sumar", productoId: 999 });

            expect(resultado).toEqual(conMuffinYExpreso);
        });
    });

    describe("restar", () => {
        it("disminuye en 1 la cantidad del producto", () => {
            const resultado = carritoReducer(conMuffinYExpreso, { tipo: "restar", productoId: 19 });

            expect(resultado.items[0].cantidad).toBe(1);
        });

        it("quita el producto cuando la cantidad llega a 0", () => {
            const resultado = carritoReducer(conMuffinYExpreso, { tipo: "restar", productoId: 5 });

            expect(resultado.items.map((item) => item.productoId)).toEqual([19]);
        });

        it("no cambia nada si el producto no está en el carrito", () => {
            const resultado = carritoReducer(conMuffinYExpreso, { tipo: "restar", productoId: 999 });

            expect(resultado).toEqual(conMuffinYExpreso);
        });
    });

    describe("quitar", () => {
        it("elimina el producto sin importar su cantidad", () => {
            const resultado = carritoReducer(conMuffinYExpreso, { tipo: "quitar", productoId: 19 });

            expect(resultado.items.map((item) => item.productoId)).toEqual([5]);
        });

        it("no cambia nada si el producto no está en el carrito", () => {
            const resultado = carritoReducer(conMuffinYExpreso, { tipo: "quitar", productoId: 999 });

            expect(resultado).toEqual(conMuffinYExpreso);
        });
    });

    describe("vaciar", () => {
        it("deja el carrito sin productos", () => {
            const resultado = carritoReducer(conMuffinYExpreso, { tipo: "vaciar" });

            expect(resultado.items).toEqual([]);
        });
    });

    it("no modifica el estado original (inmutabilidad)", () => {
        const copia = structuredClone(conMuffinYExpreso);

        carritoReducer(conMuffinYExpreso, { tipo: "sumar", productoId: 19 });
        carritoReducer(conMuffinYExpreso, { tipo: "restar", productoId: 5 });
        carritoReducer(conMuffinYExpreso, { tipo: "quitar", productoId: 19 });
        carritoReducer(conMuffinYExpreso, { tipo: "vaciar" });

        expect(conMuffinYExpreso).toEqual(copia);
    });
});