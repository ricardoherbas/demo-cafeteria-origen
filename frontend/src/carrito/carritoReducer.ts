// el carrito guarda productos y cantidades; no calcula subtotales ni totales (los da la API)
export interface ProductoCarrito {
    productoId: number;
    nombre: string;
    precioUnitario: number;
}

export interface ItemCarrito extends ProductoCarrito {
    cantidad: number;
}

export interface EstadoCarrito {
    items: ItemCarrito[];
}

export type AccionCarrito =
    | { tipo: "agregar"; producto: ProductoCarrito }
    | { tipo: "sumar"; productoId: number }
    | { tipo: "restar"; productoId: number }
    | { tipo: "quitar"; productoId: number }
    | { tipo: "vaciar" };

export const estadoInicial: EstadoCarrito = { items: [] };

export function carritoReducer(estado: EstadoCarrito, accion: AccionCarrito): EstadoCarrito {
    switch (accion.tipo) {
        case "agregar": {
            const { producto } = accion;
            const existe = estado.items.some((item) => item.productoId === producto.productoId);

            if (existe) {
                return carritoReducer(estado, { tipo: "sumar", productoId: producto.productoId });
            }
            return { items: [...estado.items, { ...producto, cantidad: 1 }] };
        }
        case "sumar":
            return {
                items: estado.items.map((item) =>
                    item.productoId === accion.productoId ? { ...item, cantidad: item.cantidad + 1 } : item,
                ),
            };
        case "restar":
            return {
                items: estado.items
                    .map((item) =>
                        item.productoId === accion.productoId ? { ...item, cantidad: item.cantidad - 1 } : item,
                    )
                    .filter((item) => item.cantidad > 0),
            };
        case "quitar":
            return { items: estado.items.filter((item) => item.productoId !== accion.productoId) };
        case "vaciar":
            return estadoInicial;
    }
}