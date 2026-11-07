export function formatearPrecio(precio: number): string {
    return `$${new Intl.NumberFormat("es-AR", {
        maximumFractionDigits: 0,
    }).format(precio)}`;
}
