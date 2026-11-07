import type { Producto } from "../api/productos.schema";

type Cafe = Extract<Producto, { tipo: "expreso" | "filtrado" }>;

export function buscarCafePorOrigen(
    cafes: Cafe[],
    origen: string,
): Cafe | undefined {
    return cafes.find((cafe) => cafe.variedad.nombre === origen);
}
