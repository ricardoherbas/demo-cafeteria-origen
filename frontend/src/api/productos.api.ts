import { z } from "zod";
import { http } from "./http";
import { ProductoSchema, type Producto } from "./productos.schema";

const ProductosSchema = z.array(ProductoSchema);

export async function obtenerProductos(): Promise<Producto[]> {
  const datos = await http.get<unknown>("/productos");

  return ProductosSchema.parse(datos);
}

export async function obtenerProductoPorId(
  id: number,
): Promise<Producto> {
  const datos = await http.get<unknown>(`/productos/${id}`);

  return ProductoSchema.parse(datos);
}