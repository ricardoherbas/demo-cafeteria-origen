import { useState } from "react";
import type { Producto } from "../api/productos.schema";
import { useCarrito } from "../carrito/CarritoContext";
import { buscarCafePorOrigen } from "./buscarCafePorOrigen";
import { formatearPrecio } from "../utils/formatearPrecio";

type TipoCafe = "expreso" | "filtrado";

type Cafe = Extract<Producto, { tipo: TipoCafe }>;

type SelectorCafeProps = {
    productos: Producto[];
};

export function SelectorCafe({ productos }: SelectorCafeProps) {
    const [tipo, setTipo] = useState<TipoCafe | null>(null);
    const [tamanio, setTamanio] = useState("");
    const [origen, setOrigen] = useState("");

    const { dispatch } = useCarrito();

    const cafes = productos.filter(
        (producto): producto is Cafe =>
            producto.tipo === "expreso" || producto.tipo === "filtrado",
    );

    const cafesTipo = cafes.filter(
        (producto) => producto.tipo === tipo,
    );

    const tamanios = [
        ...new Set(cafesTipo.map((producto) => producto.tamanio)),
    ];

    const cafesTamanio = cafesTipo.filter(
        (producto) => producto.tamanio === tamanio,
    );

    const productoSeleccionado = buscarCafePorOrigen(cafesTamanio, origen);

    function seleccionarTipo(nuevoTipo: TipoCafe) {
        setTipo(nuevoTipo);
        setTamanio("");
        setOrigen("");
    }

    function agregarAlCarrito() {
        if (!productoSeleccionado) {
            return;
        }

        dispatch({
            tipo: "agregar",
            producto: {
                productoId: productoSeleccionado.id,
                nombre: productoSeleccionado.nombre,
                precioUnitario: productoSeleccionado.precio,
            },
        });

        setTipo(null);
        setTamanio("");
        setOrigen("");
    }

    return (
        <section aria-labelledby="titulo-selector-cafe">
            <h2 id="titulo-selector-cafe">Seleccioná tu café</h2>

            <div className="d-flex gap-2 mb-3">
                <button
                    type="button"
                    className="btn btn-primary"
                    aria-pressed={tipo === "expreso"}
                    onClick={() => seleccionarTipo("expreso")}
                >
                    Expreso
                </button>

                <button
                    type="button"
                    className="btn btn-primary"
                    aria-pressed={tipo === "filtrado"}
                    onClick={() => seleccionarTipo("filtrado")}
                >
                    Filtrado
                </button>
            </div>

            {tipo !== null && (
                <div className="mb-3">
                    <label htmlFor="tamanio-cafe" className="form-label">
                        Tamaño
                    </label>

                    <select
                        id="tamanio-cafe"
                        className="form-select"
                        value={tamanio}
                        onChange={(event) => {
                            setTamanio(event.target.value);
                            setOrigen("");
                        }}
                    >
                        <option value="">Seleccioná un tamaño</option>

                        {tamanios.map((opcion) => (
                            <option key={opcion} value={opcion}>
                                {opcion}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {tamanio !== "" && (
                <div className="mb-3">
                    <h3 className="h5 mb-3">Elegí el origen de tu café</h3>

                    <div className="row row-cols-1 row-cols-md-3 g-3">
                        {cafesTamanio.map((producto) => {
                            const seleccionado =
                                origen === producto.variedad.nombre;

                            return (
                                <div className="col" key={producto.id}>
                                    <article className="card h-100">
                                        <button
                                            type="button"
                                            className={`card-body text-start w-100 border-0 rounded ${
                                                seleccionado
                                                    ? "border border-primary border-3"
                                                    : ""
                                            }`}
                                            aria-pressed={seleccionado}
                                            onClick={() =>
                                                setOrigen(producto.variedad.nombre)
                                            }
                                        >
                                            <span className="d-block fw-bold fs-5 mb-2">
                                                {producto.variedad.nombre}
                                            </span>

                                            <span className="d-block mb-2">
                                                {producto.variedad.descripcion}
                                            </span>

                                            <span className="d-block fw-semibold">
                                                Precio: {formatearPrecio(producto.precio)}
                                            </span>
                                        </button>
                                    </article>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <button
                type="button"
                className="btn btn-primary"
                disabled={!productoSeleccionado}
                onClick={agregarAlCarrito}
            >
                Agregar al carrito
            </button>
        </section>
    );
}