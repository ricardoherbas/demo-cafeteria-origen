import { z } from "zod";

const VariedadSchema = z.object({
  nombre: z.string(),
  precioPorGramo: z.number(),
  descripcion: z.string(),
});

const ProductoComunSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  precio: z.number(),
});

const ExpresoSchema = ProductoComunSchema.extend({
  tipo: z.literal("expreso"),
  tamanio: z.string(),
  gramosCafe: z.number(),
  variedad: VariedadSchema,
});

const FiltradoSchema = ProductoComunSchema.extend({
  tipo: z.literal("filtrado"),
  tamanio: z.string(),
  gramosCafe: z.number(),
  variedad: VariedadSchema,
});

const PasteleriaSchema = ProductoComunSchema.extend({
  tipo: z.literal("pasteleria"),
});

export const ProductoSchema = z.discriminatedUnion("tipo", [
  ExpresoSchema,
  FiltradoSchema,
  PasteleriaSchema,
]);

export type Producto = z.infer<typeof ProductoSchema>;