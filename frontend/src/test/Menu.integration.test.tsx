import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http as mswHttp, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Menu } from "../menu/Menu";
import { CarritoProvider } from "../carrito/CarritoContext";

const servidor = setupServer();

beforeAll(() => {
    servidor.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
    servidor.resetHandlers();
});

afterAll(() => {
    servidor.close();
});

const productos = [
    {
        id: 1,
        nombre: "Expreso Pocillo",
        precio: 5020,
        tipo: "expreso",
        tamanio: "Pocillo",
        gramosCafe: 18,
        variedad: {
            nombre: "Brasil",
            precioPorGramo: 140,
            descripcion: "Café brasileño",
        },
    },
    {
        id: 19,
        nombre: "Muffin de chocolate",
        precio: 3500,
        tipo: "pasteleria",
    },
];

function renderMenu() {
    return render(
        <CarritoProvider>
            <Menu />
        </CarritoProvider>,
    );
}

describe("Menu - integración con la API", () => {
    it("muestra los productos recibidos de la API", async () => {
        servidor.use(
            mswHttp.get("*/productos", () => {
                return HttpResponse.json(productos);
            }),
        );

        const user = userEvent.setup();
        renderMenu();

        await user.click(
            await screen.findByRole("button", { name: /^expreso$/i }),
        );

        await user.selectOptions(
            screen.getByLabelText(/tamaño/i),
            "Pocillo",
        );

        expect(
            screen.getByRole("button", { name: /brasil/i }),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Muffin de chocolate"),
        ).toBeInTheDocument();
    });

    it("permite reintentar cuando la API responde con error 500", async () => {
        let cantidadSolicitudes = 0;

        servidor.use(
            mswHttp.get("*/productos", () => {
                cantidadSolicitudes++;

                if (cantidadSolicitudes === 1) {
                    return new HttpResponse(null, { status: 500 });
                }

                return HttpResponse.json(productos);
            }),
        );

        const user = userEvent.setup();
        renderMenu();

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "No se pudo cargar el menú.",
        );

        await user.click(
            screen.getByRole("button", { name: /reintentar/i }),
        );

        expect(
            await screen.findByText("Muffin de chocolate"),
        ).toBeInTheDocument();

        expect(cantidadSolicitudes).toBe(2);
    });

    it("muestra un error cuando la API no está disponible", async () => {
        servidor.use(
            mswHttp.get("*/productos", () => {
                return HttpResponse.error();
            }),
        );

        renderMenu();

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "No se pudo cargar el menú.",
        );

        expect(
            screen.getByRole("button", { name: /reintentar/i }),
        ).toBeInTheDocument();
    });

    it("muestra un error cuando la API devuelve productos con formato inválido", async () => {
        servidor.use(
            mswHttp.get("*/productos", () => {
                return HttpResponse.json([
                    {
                        ...productos[0],
                        precio: "5020",
                    },
                ]);
            }),
        );

        renderMenu();

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "No se pudo cargar el menú.",
        );

        expect(
            screen.getByRole("button", { name: /reintentar/i }),
        ).toBeInTheDocument();
    });
});
