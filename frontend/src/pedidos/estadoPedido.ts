import type { Pedido } from "../api/pedidos.schema";

// pendiente -> confirmado | cancelado; los dos últimos son finales y ya no cambian
export function esEstadoFinal(estado: Pedido["estado"]): boolean {
  return estado !== "pendiente";
}