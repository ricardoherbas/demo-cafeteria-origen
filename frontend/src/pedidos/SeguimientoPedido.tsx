import { useEffect, useState } from "react";
import { obtenerPedido } from "../api/pedidos.api";
import type { Pedido } from "../api/pedidos.schema";
import { esEstadoFinal } from "./estadoPedido";

interface SeguimientoPedidoProps {
  pedidoId: number;
  intervaloMs?: number;
}

export function SeguimientoPedido({ pedidoId, intervaloMs = 3000 }: SeguimientoPedidoProps) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    let temporizador: ReturnType<typeof setTimeout> | undefined;

    // setTimeout encadenado (y no setInterval): la próxima consulta se programa
    // recién cuando termina la anterior, así nunca se superponen dos pedidos HTTP
    async function consultar() {
      try {
        const actual = await obtenerPedido(pedidoId);
        if (!activo) return;

        setPedido(actual);
        setError(null);
        if (!esEstadoFinal(actual.estado)) {
          temporizador = setTimeout(consultar, intervaloMs);
        }
      } catch {
        if (!activo) return;

        setError("No se pudo actualizar el estado del pedido");
        temporizador = setTimeout(consultar, intervaloMs);
      }
    }

    void consultar();

    // al desmontar (o si cambia el pedido) se cancela lo que quedó pendiente
    return () => {
      activo = false;
      clearTimeout(temporizador);
    };
  }, [pedidoId, intervaloMs]);

  return (
    <section aria-labelledby="titulo-seguimiento">
      <h2 id="titulo-seguimiento">Seguimiento del pedido</h2>

      {pedido === null && error === null && <p>Consultando el estado…</p>}
      {pedido !== null && <p>Estado actual: {pedido.estado}</p>}
      {error !== null && <p role="alert">{error}</p>}
    </section>
  );
}