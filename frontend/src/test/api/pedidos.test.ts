import { describe, expect, it } from "vitest";
import { PedidoSchema } from "../../api/pedidos.schema";

const pedidoApi = {
  id: 7,
  mesaId: 4,
  estado: "pendiente",
  total: 14720,
  items: [{ productoId: 5, cantidad: 2, precioUnitario: 7360, subtotal: 14720 }],
};

describe("PedidoSchema", () => {
  it("acepta la respuesta de la API", () => {
    expect(PedidoSchema.parse(pedidoApi)).toEqual(pedidoApi);
  });

  it("acepta un pedido sin mesa", () => {
    const { mesaId: _mesaId, ...sinMesa } = pedidoApi;

    expect(PedidoSchema.parse(sinMesa).mesaId).toBeUndefined();
  });

  it("rechaza un estado desconocido", () => {
    expect(() => PedidoSchema.parse({ ...pedidoApi, estado: "entregado" })).toThrow();
  });

  it("rechaza un pedido sin total", () => {
    const { total: _total, ...sinTotal } = pedidoApi;

    expect(() => PedidoSchema.parse(sinTotal)).toThrow();
  });

  it("rechaza un ítem sin precio unitario", () => {
    const item = { productoId: 5, cantidad: 2, subtotal: 14720 };

    expect(() => PedidoSchema.parse({ ...pedidoApi, items: [item] })).toThrow();
  });
});