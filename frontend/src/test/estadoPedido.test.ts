import { describe, expect, it } from "vitest";
import { esEstadoFinal } from "../pedidos/estadoPedido";

describe("esEstadoFinal", () => {
  it("pendiente no es final: el pedido todavía puede cambiar", () => {
    expect(esEstadoFinal("pendiente")).toBe(false);
  });

  it("confirmado es final", () => {
    expect(esEstadoFinal("confirmado")).toBe(true);
  });

  it("cancelado es final", () => {
    expect(esEstadoFinal("cancelado")).toBe(true);
  });
});