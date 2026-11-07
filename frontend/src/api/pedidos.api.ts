import { http } from "./http";
import { PedidoSchema, type NuevoPedido, type Pedido } from "./pedidos.schema";

export async function crearPedido(nuevo: NuevoPedido): Promise<Pedido> {
  const datos = await http.post<unknown>("/pedidos", nuevo);

  return PedidoSchema.parse(datos);
}
export async function obtenerPedido(id: number): Promise<Pedido> {
  const datos = await http.get<unknown>(`/pedidos/${id}`);

  return PedidoSchema.parse(datos);
}