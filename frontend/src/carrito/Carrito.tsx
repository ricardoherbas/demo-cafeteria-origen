import { useCarrito } from "./CarritoContext";
import { subtotalGeneral, subtotalItem } from "./subtotales";
import { formatearPrecio } from "../utils/formatearPrecio";

export function Carrito() {
    const { estado, dispatch } = useCarrito();

    if (estado.items.length === 0) {
        return (
            <section aria-labelledby="titulo-carrito">
                <h2 id="titulo-carrito">Carrito</h2>
                <p>Tu carrito está vacío</p>
            </section>
        );
    }

    return (
        <section aria-labelledby="titulo-carrito">
            <h2 id="titulo-carrito">Carrito</h2>

            <ul className="list-unstyled">
                {estado.items.map((item) => (
                    <li key={item.productoId} aria-label={item.nombre}>
                        <h3>{item.nombre}</h3>
                        <p>Cantidad: {item.cantidad}</p>
                        <p>Precio unitario: {formatearPrecio(item.precioUnitario)}</p>
                        <p>Subtotal: {formatearPrecio(subtotalItem(item))}</p>

                        <div className="d-flex flex-wrap gap-2">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                aria-label={`Sumar ${item.nombre}`}
                                onClick={() =>
                                    dispatch({ tipo: "sumar", productoId: item.productoId })
                                }
                            >
                                +
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                aria-label={`Restar ${item.nombre}`}
                                onClick={() =>
                                    dispatch({ tipo: "restar", productoId: item.productoId })
                                }
                            >
                                -
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-danger"
                                aria-label={`Quitar ${item.nombre}`}
                                onClick={() =>
                                    dispatch({ tipo: "quitar", productoId: item.productoId })
                                }
                            >
                                Quitar
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <p>
                <strong>
                    Subtotal general (orientativo): {formatearPrecio(subtotalGeneral(estado.items))}
                </strong>
            </p>
        </section>
    );
}