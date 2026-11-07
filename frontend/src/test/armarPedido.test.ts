import { describe, expect, it } from "vitest";
import { armarPedido } from "../pedidos/armarPedido";
import type { ItemCarrito } from "../carrito/carritoReducer";

const muffin: ItemCarrito = { productoId: 19, nombre: "Muffin", precioUnitario: 2500, cantidad: 1 };
const expreso: ItemCarrito = { productoId: 5, nombre: "Expreso Mediano Colombia", precioUnitario: 7360, cantidad: 2 };

describe("armarPedido", () => {
  it("envía solo productoId y cantidad de cada ítem", () => {
    expect(armarPedido([expreso, muffin], 4)).toEqual({
      mesaId: 4,
      items: [
        { productoId: 5, cantidad: 2 },
        { productoId: 19, cantidad: 1 },
      ],
    });
  });

  it("omite mesaId cuando se retira en barra", () => {
    const pedido = armarPedido([muffin], null);

    expect(pedido).toEqual({ items: [{ productoId: 19, cantidad: 1 }] });
    expect("mesaId" in pedido).toBe(false);
  });
});