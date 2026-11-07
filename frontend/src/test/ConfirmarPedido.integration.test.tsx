import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mswHttp, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { CarritoProvider, useCarrito } from "../carrito/CarritoContext";
import { Carrito } from "../carrito/Carrito";
import { ConfirmarPedido } from "../pedidos/ConfirmarPedido";

const servidor = setupServer();

beforeAll(() => servidor.listen({ onUnhandledRequest: "error" }));
afterEach(() => servidor.resetHandlers());
afterAll(() => servidor.close());

function CargarExpreso() {
  const { dispatch } = useCarrito();

  return (
    <button
      onClick={() =>
        dispatch({
          tipo: "agregar",
          producto: { productoId: 5, nombre: "Expreso Mediano Colombia", precioUnitario: 7360 },
        })
      }
    >
      Cargar expreso
    </button>
  );
}

// tras confirmar, el componente consulta GET /pedidos/:id para el seguimiento
function responderSeguimiento(id: number, estado: "pendiente" | "confirmado" = "pendiente") {
  servidor.use(
    mswHttp.get(`*/pedidos/${id}`, () =>
      HttpResponse.json({
        id,
        estado,
        total: 7360,
        items: [{ productoId: 5, cantidad: 1, precioUnitario: 7360, subtotal: 7360 }],
      }),
    ),
  );
}

function prepararPantalla(mesa: number | null) {
  return render(
    <CarritoProvider>
      <CargarExpreso />
      <Carrito />
      <ConfirmarPedido mesa={mesa} />
    </CarritoProvider>,
  );
}

describe("ConfirmarPedido (integración con MSW)", () => {
  it("deja deshabilitado confirmar si el carrito está vacío", () => {
    prepararPantalla(4);

    expect(screen.getByRole("button", { name: "Confirmar pedido" })).toBeDisabled();
  });

  it("envía el pedido y muestra número, estado y total que devuelve la API", async () => {
    let cuerpoRecibido: unknown;
    servidor.use(
      mswHttp.post("*/pedidos", async ({ request }) => {
        cuerpoRecibido = await request.json();
        return HttpResponse.json(
          {
            id: 12,
            mesaId: 4,
            estado: "pendiente",
            total: 14720,
            items: [{ productoId: 5, cantidad: 2, precioUnitario: 7360, subtotal: 14720 }],
          },
          { status: 201 },
        );
      }),
    );
    responderSeguimiento(12);
    const usuario = userEvent.setup();
    prepararPantalla(4);

    await usuario.click(screen.getByRole("button", { name: "Cargar expreso" }));
    await usuario.click(screen.getByRole("button", { name: "Sumar Expreso Mediano Colombia" }));
    await usuario.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    expect(await screen.findByText("Pedido N° 12")).toBeInTheDocument();
    expect(screen.getByText("Estado: pendiente")).toBeInTheDocument();
    expect(screen.getByText("Total: $14.720")).toBeInTheDocument();
    expect(cuerpoRecibido).toEqual({ mesaId: 4, items: [{ productoId: 5, cantidad: 2 }] });
    expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
  });

  it("no manda mesaId si se retira en barra", async () => {
    let cuerpoRecibido: unknown;
    servidor.use(
      mswHttp.post("*/pedidos", async ({ request }) => {
        cuerpoRecibido = await request.json();
        return HttpResponse.json(
          {
            id: 13,
            estado: "pendiente",
            total: 7360,
            items: [{ productoId: 5, cantidad: 1, precioUnitario: 7360, subtotal: 7360 }],
          },
          { status: 201 },
        );
      }),
    );
    responderSeguimiento(13);
    const usuario = userEvent.setup();
    prepararPantalla(null);

    await usuario.click(screen.getByRole("button", { name: "Cargar expreso" }));
    await usuario.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    expect(await screen.findByText("Pedido N° 13")).toBeInTheDocument();
    expect(cuerpoRecibido).toEqual({ items: [{ productoId: 5, cantidad: 1 }] });
  });

  it("muestra el seguimiento del pedido recién confirmado", async () => {
    servidor.use(
      mswHttp.post("*/pedidos", () =>
        HttpResponse.json(
          {
            id: 14,
            estado: "pendiente",
            total: 7360,
            items: [{ productoId: 5, cantidad: 1, precioUnitario: 7360, subtotal: 7360 }],
          },
          { status: 201 },
        ),
      ),
    );
    responderSeguimiento(14, "confirmado");
    const usuario = userEvent.setup();
    prepararPantalla(4);

    await usuario.click(screen.getByRole("button", { name: "Cargar expreso" }));
    await usuario.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    expect(await screen.findByRole("heading", { name: "Seguimiento del pedido" })).toBeInTheDocument();
    expect(await screen.findByText("Estado actual: confirmado")).toBeInTheDocument();
  });

    it("conserva el carrito si el pedido falla", async () => {
    servidor.use(
      mswHttp.post("*/pedidos", () => HttpResponse.json({ error: "Producto 5 no encontrado" }, { status: 404 })),
    );
    const usuario = userEvent.setup();
    prepararPantalla(4);

    await usuario.click(screen.getByRole("button", { name: "Cargar expreso" }));
    await usuario.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Producto 5 no encontrado");
    expect(screen.getByRole("listitem", { name: "Expreso Mediano Colombia" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar pedido" })).toBeEnabled();
  });

  it("muestra el error 500 de la API y deja reintentar sin perder el carrito", async () => {
    let intentos = 0;
    servidor.use(
      mswHttp.post("*/pedidos", () => {
        intentos += 1;
        if (intentos === 1) {
          return HttpResponse.json({ error: "Error interno del servidor" }, { status: 500 });
        }
        return HttpResponse.json(
          {
            id: 15,
            estado: "pendiente",
            total: 7360,
            items: [{ productoId: 5, cantidad: 1, precioUnitario: 7360, subtotal: 7360 }],
          },
          { status: 201 },
        );
      }),
    );
    responderSeguimiento(15);
    const usuario = userEvent.setup();
    prepararPantalla(4);

    await usuario.click(screen.getByRole("button", { name: "Cargar expreso" }));
    await usuario.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Error interno del servidor");
    expect(screen.getByRole("listitem", { name: "Expreso Mediano Colombia" })).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    expect(await screen.findByText("Pedido N° 15")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("avisa que no pudo conectar si la API está caída y conserva el carrito", async () => {
    servidor.use(mswHttp.post("*/pedidos", () => HttpResponse.error()));
    const usuario = userEvent.setup();
    prepararPantalla(4);

    await usuario.click(screen.getByRole("button", { name: "Cargar expreso" }));
    await usuario.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo conectar con el servidor");
    expect(screen.getByRole("listitem", { name: "Expreso Mediano Colombia" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar pedido" })).toBeEnabled();
  });

  it("avisa si la respuesta de la API no cumple el contrato y conserva el carrito", async () => {
    servidor.use(mswHttp.post("*/pedidos", () => HttpResponse.json({ id: 16 }, { status: 201 })));
    const usuario = userEvent.setup();
    prepararPantalla(4);

    await usuario.click(screen.getByRole("button", { name: "Cargar expreso" }));
    await usuario.click(screen.getByRole("button", { name: "Confirmar pedido" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "La respuesta del servidor no tiene el formato esperado",
    );
    expect(screen.getByRole("listitem", { name: "Expreso Mediano Colombia" })).toBeInTheDocument();
  });
});
