import { render, screen } from "@testing-library/react";
import { http as mswHttp, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { SeguimientoPedido } from "../pedidos/SeguimientoPedido";

const servidor = setupServer();

beforeAll(() => servidor.listen({ onUnhandledRequest: "error" }));
afterEach(() => servidor.resetHandlers());
afterAll(() => servidor.close());

const INTERVALO = 20;

function pedidoCon(estado: "pendiente" | "confirmado" | "cancelado") {
  return {
    id: 12,
    mesaId: 4,
    estado,
    total: 14720,
    items: [{ productoId: 5, cantidad: 2, precioUnitario: 7360, subtotal: 14720 }],
  };
}

const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

describe("SeguimientoPedido (integración con MSW)", () => {
  it("muestra el estado que devuelve la API", async () => {
    servidor.use(mswHttp.get("*/pedidos/12", () => HttpResponse.json(pedidoCon("pendiente"))));

    render(<SeguimientoPedido pedidoId={12} intervaloMs={INTERVALO} />);

    expect(await screen.findByText("Estado actual: pendiente")).toBeInTheDocument();
  });

  it("actualiza el estado sin recargar cuando el pedido cambia", async () => {
    let consultas = 0;
    servidor.use(
      mswHttp.get("*/pedidos/12", () => {
        consultas += 1;
        return HttpResponse.json(pedidoCon(consultas < 3 ? "pendiente" : "confirmado"));
      }),
    );

    render(<SeguimientoPedido pedidoId={12} intervaloMs={INTERVALO} />);

    expect(await screen.findByText("Estado actual: pendiente")).toBeInTheDocument();
    expect(await screen.findByText("Estado actual: confirmado")).toBeInTheDocument();
  });

  it("deja de consultar cuando el estado es final", async () => {
    let consultas = 0;
    servidor.use(
      mswHttp.get("*/pedidos/12", () => {
        consultas += 1;
        return HttpResponse.json(pedidoCon("cancelado"));
      }),
    );

    render(<SeguimientoPedido pedidoId={12} intervaloMs={INTERVALO} />);
    await screen.findByText("Estado actual: cancelado");
    const consultasAlTerminar = consultas;

    await esperar(INTERVALO * 5);

    expect(consultas).toBe(consultasAlTerminar);
  });

  it("deja de consultar al desmontar el componente", async () => {
    let consultas = 0;
    servidor.use(
      mswHttp.get("*/pedidos/12", () => {
        consultas += 1;
        return HttpResponse.json(pedidoCon("pendiente"));
      }),
    );

    const { unmount } = render(<SeguimientoPedido pedidoId={12} intervaloMs={INTERVALO} />);
    await screen.findByText("Estado actual: pendiente");
    unmount();
    const consultasAlDesmontar = consultas;

    await esperar(INTERVALO * 5);

    expect(consultas).toBe(consultasAlDesmontar);
  });

  it("avisa si no puede consultar el estado y se recupera cuando la API vuelve", async () => {
    servidor.use(mswHttp.get("*/pedidos/12", () => HttpResponse.json({ error: "falla" }, { status: 500 })));

    render(<SeguimientoPedido pedidoId={12} intervaloMs={INTERVALO} />);

    expect(await screen.findByRole("alert")).toBeInTheDocument();

    servidor.use(mswHttp.get("*/pedidos/12", () => HttpResponse.json(pedidoCon("pendiente"))));

    expect(await screen.findByText("Estado actual: pendiente")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});