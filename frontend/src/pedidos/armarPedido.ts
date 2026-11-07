import type { ItemCarrito } from "../carrito/carritoReducer";
import type { NuevoPedido } from "../api/pedidos.schema";

// arma el cuerpo del POST: solo ids y cantidades, sin precios ni totales (los calcula la API)
export function armarPedido(items: ItemCarrito[], mesa: number | null): NuevoPedido {
  const detalle = items.map(({ productoId, cantidad }) => ({ productoId, cantidad }));

  return mesa === null ? { items: detalle } : { mesaId: mesa, items: detalle };
}