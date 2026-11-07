import { useState } from "react";
import { crearPedido } from "../api/pedidos.api";
import { mensajeDeError } from "../api/errores";
import type { Pedido } from "../api/pedidos.schema";
import { useCarrito } from "../carrito/CarritoContext";
import { armarPedido } from "./armarPedido";
import { SeguimientoPedido } from "./SeguimientoPedido";
import { formatearPrecio } from "../utils/formatearPrecio";

type EstadoEnvio =
  | { tipo: "inactivo" }
  | { tipo: "enviando" }
  | { tipo: "confirmado"; pedido: Pedido }
  | { tipo: "error"; mensaje: string };

export function ConfirmarPedido({ mesa }: { mesa: number | null }) {
  const { estado, dispatch } = useCarrito();
  const [envio, setEnvio] = useState<EstadoEnvio>({ tipo: "inactivo" });

  const carritoVacio = estado.items.length === 0;
  const enviando = envio.tipo === "enviando";

  async function confirmar() {
    setEnvio({ tipo: "enviando" });
    try {
      const pedido = await crearPedido(armarPedido(estado.items, mesa));
      dispatch({ tipo: "vaciar" });
      setEnvio({ tipo: "confirmado", pedido });
    } catch (error) {
      // el carrito no se toca: la persona puede reintentar sin volver a cargarlo
      setEnvio({ tipo: "error", mensaje: mensajeDeError(error) });
    }
  }

  return (
    <section aria-labelledby="titulo-confirmar">
      <h2 id="titulo-confirmar">Confirmar pedido</h2>

    <button
        type="button"
        className="btn btn-primary"
        disabled={carritoVacio || enviando}
        onClick={confirmar}
    >
        Confirmar pedido
    </button>

      {envio.tipo === "error" && <p role="alert">{envio.mensaje}</p>}

      {envio.tipo === "confirmado" && (
        <div role="status">
          <p>Pedido N° {envio.pedido.id}</p>
          <p>Estado: {envio.pedido.estado}</p>
          <p>Total: {formatearPrecio(envio.pedido.total)}</p>
        </div>
      )}

      {envio.tipo === "confirmado" && <SeguimientoPedido pedidoId={envio.pedido.id} />}
    </section>
  );
}