import { describe, expect, it } from "vitest";
import { subtotalGeneral, subtotalItem } from "../carrito/subtotales";
import type { ItemCarrito } from "../carrito/carritoReducer";

const muffin: ItemCarrito = { productoId: 19, nombre: "Muffin", precioUnitario: 2500, cantidad: 3 };
const expreso: ItemCarrito = { productoId: 5, nombre: "Expreso Mediano Colombia", precioUnitario: 7360, cantidad: 2 };

describe("subtotales del carrito", () => {
    it("el subtotal de un ítem es cantidad por precio unitario", () => {
        expect(subtotalItem(muffin)).toBe(7500);
    });

    it("el subtotal general suma los subtotales de todos los ítems", () => {
        expect(subtotalGeneral([muffin, expreso])).toBe(7500 + 14720);
    });

    it("el subtotal general de un carrito vacío es cero", () => {
        expect(subtotalGeneral([])).toBe(0);
    });
});