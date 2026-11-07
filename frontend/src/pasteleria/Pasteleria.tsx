import type { Producto } from "../api/productos.schema";
import { useCarrito } from "../carrito/CarritoContext";
import { formatearPrecio } from "../utils/formatearPrecio";

type ProductoPasteleria = Extract<Producto, { tipo: "pasteleria" }>;

type PasteleriaProps = {
    productos: Producto[];
};

export function Pasteleria({ productos }: PasteleriaProps) {
    const { dispatch } = useCarrito();

    const productosPasteleria = productos.filter(
        (producto): producto is ProductoPasteleria =>
            producto.tipo === "pasteleria",
    );

    function agregarAlCarrito(producto: ProductoPasteleria) {
        dispatch({
            tipo: "agregar",
            producto: {
                productoId: producto.id,
                nombre: producto.nombre,
                precioUnitario: producto.precio,
            },
        });
    }

    return (
        <section aria-labelledby="titulo-pasteleria">
            <h2 id="titulo-pasteleria">Pastelería</h2>

            {productosPasteleria.length === 0 ? (
                <p>No hay productos de pastelería disponibles.</p>
            ) : (
                <ul className="list-unstyled">
                    {productosPasteleria.map((producto) => (
                        <li key={producto.id}>
                            <h3>{producto.nombre}</h3>

                            <p>Precio: {formatearPrecio(producto.precio)}</p>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => agregarAlCarrito(producto)}
                                aria-label={`Agregar ${producto.nombre} al carrito`}
                            >
                                Agregar al carrito
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}