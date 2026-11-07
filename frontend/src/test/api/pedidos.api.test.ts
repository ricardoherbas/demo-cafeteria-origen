import { afterEach, describe, expect, it, vi } from "vitest";
import { http } from "../../api/http";
import { crearPedido, obtenerPedido } from "../../api/pedidos.api";

const pedidoApi = {
  id: 7,
  mesaId: 4,
  estado: "pendiente" as const,
  total: 14720,
  items: [{ productoId: 5, cantidad: 2, precioUnitario: 7360, subtotal: 14720 }],
};

describe("API de pedidos", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("envía el pedido a POST /pedidos y devuelve la respuesta validada", async () => {
    vi.spyOn(http, "post").mockResolvedValue(pedidoApi);
    const nuevo = { mesaId: 4, items: [{ productoId: 5, cantidad: 2 }] };

    const resultado = await crearPedido(nuevo);

    expect(http.post).toHaveBeenCalledWith("/pedidos", nuevo);
    expect(resultado).toEqual(pedidoApi);
  });
    it("consulta un pedido por id con GET /pedidos/:id", async () => {
    vi.spyOn(http, "get").mockResolvedValue(pedidoApi);

    const resultado = await obtenerPedido(7);

    expect(http.get).toHaveBeenCalledWith("/pedidos/7");
    expect(resultado).toEqual(pedidoApi);
  });

  it("rechaza si el pedido consultado viene fuera de contrato", async () => {
    vi.spyOn(http, "get").mockResolvedValue({ id: 7, estado: "entregado" });

    await expect(obtenerPedido(7)).rejects.toThrow();
  });

  it("rechaza una respuesta fuera de contrato", async () => {
    vi.spyOn(http, "post").mockResolvedValue({ id: 7, estado: "pendiente" });

    await expect(crearPedido({ items: [{ productoId: 5, cantidad: 1 }] })).rejects.toThrow();
  });
});