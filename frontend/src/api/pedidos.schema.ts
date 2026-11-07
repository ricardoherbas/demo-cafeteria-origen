import { z } from "zod";

export const EstadoPedidoSchema = z.enum(["pendiente", "confirmado", "cancelado"]);

const PedidoItemSchema = z.object({
  productoId: z.number(),
  cantidad: z.number(),
  precioUnitario: z.number(),
  subtotal: z.number(),
});

export const PedidoSchema = z.object({
  id: z.number(),
  mesaId: z.number().optional(),
  estado: EstadoPedidoSchema,
  total: z.number(),
  items: z.array(PedidoItemSchema),
});

export type Pedido = z.infer<typeof PedidoSchema>;

// lo que el cliente envía en POST /pedidos: solo ids y cantidades, nunca precios
export const NuevoPedidoSchema = z.object({
  mesaId: z.number().optional(),
  items: z.array(z.object({ productoId: z.number(), cantidad: z.number() })),
});

export type NuevoPedido = z.infer<typeof NuevoPedidoSchema>;