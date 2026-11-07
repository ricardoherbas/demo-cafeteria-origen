import type { ItemCarrito } from "./carritoReducer";

// cálculo solo orientativo para mostrar en pantalla; el total real lo devuelve la API al confirmar el pedido
export function subtotalItem(item: ItemCarrito): number {
    return item.cantidad * item.precioUnitario;
}

export function subtotalGeneral(items: ItemCarrito[]): number {
    return items.reduce((suma, item) => suma + subtotalItem(item), 0);
}