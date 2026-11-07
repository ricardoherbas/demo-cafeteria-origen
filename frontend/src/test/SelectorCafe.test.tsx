import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SelectorCafe } from "../cafe/SelectorCafe";
import { CarritoProvider } from "../carrito/CarritoContext";
import { Carrito } from "../carrito/Carrito";

const productos = [
    {
        id: 1,
        nombre: "Expreso Pocillo",
        precio: 5020,
        tipo: "expreso" as const,
        tamanio: "Pocillo",
        gramosCafe: 18,
        variedad: {
            nombre: "Brasil",
            precioPorGramo: 140,
            descripcion: "Acidez: baja. Cuerpo: intenso. Notas: chocolate y nuez.",
        },
    },
    {
        id: 2,
        nombre: "Expreso Pocillo",
        precio: 5740,
        tipo: "expreso" as const,
        tamanio: "Pocillo",
        gramosCafe: 18,
        variedad: {
            nombre: "Colombia",
            precioPorGramo: 180,
            descripcion: "Acidez: media. Cuerpo: equilibrado. Notas: caramelo y frutos rojos.",
        },
    },
    {
        id: 3,
        nombre: "Expreso Pocillo",
        precio: 6100,
        tipo: "expreso" as const,
        tamanio: "Pocillo",
        gramosCafe: 18,
        variedad: {
            nombre: "Etiopía",
            precioPorGramo: 200,
            descripcion: "Acidez: alta. Cuerpo: ligero. Notas: flores y cítricos.",
        },
    },
    {
        id: 4,
        nombre: "Expreso Mediano",
        precio: 6280,
        tipo: "expreso" as const,
        tamanio: "Mediano",
        gramosCafe: 27,
        variedad: {
            nombre: "Brasil",
            precioPorGramo: 140,
            descripcion: "Acidez: baja. Cuerpo: intenso. Notas: chocolate y nuez.",
        },
    },
    {
        id: 10,
        nombre: "Filtrado Pocillo",
        precio: 4040,
        tipo: "filtrado" as const,
        tamanio: "Pocillo",
        gramosCafe: 6,
        variedad: {
            nombre: "Brasil",
            precioPorGramo: 140,
            descripcion: "Acidez: baja. Cuerpo: intenso. Notas: chocolate y nuez.",
        },
    },
];

function renderSelector() {
    return render(
        <CarritoProvider>
            <SelectorCafe productos={productos} />
            <Carrito />
        </CarritoProvider>,
    );
}

describe("SelectorCafe", () => {
    it("muestra las opciones de tipo de café", async () => {
        renderSelector();

        expect(
            await screen.findByRole("button", { name: /expreso/i }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /filtrado/i }),
        ).toBeInTheDocument();
    });

    it("no muestra tamaño ni orígenes hasta seleccionar el tipo", async () => {
        renderSelector();

        await screen.findByRole("button", { name: /^expreso$/i });

        expect(screen.queryByLabelText(/tamaño/i)).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /brasil/i })).not.toBeInTheDocument();
    });

    it("muestra los tamaños disponibles al seleccionar expreso", async () => {
        const user = userEvent.setup();
        renderSelector();

        await user.click(
            await screen.findByRole("button", { name: /^expreso$/i }),
        );

        expect(screen.getByLabelText(/tamaño/i)).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Pocillo" })).toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Mediano" })).toBeInTheDocument();
    });

    it("muestra los tres orígenes con descripción y precio al elegir el tamaño", async () => {
        const user = userEvent.setup();
        renderSelector();

        await user.click(
            await screen.findByRole("button", { name: /^expreso$/i }),
        );

        await user.selectOptions(screen.getByLabelText(/tamaño/i), "Pocillo");

        const brasil = screen.getByRole("button", { name: /brasil/i });
        const colombia = screen.getByRole("button", { name: /colombia/i });
        const etiopia = screen.getByRole("button", { name: /etiopía/i });

        expect(within(brasil).getByText(/acidez: baja/i)).toBeInTheDocument();
        expect(within(brasil).getByText(/cuerpo: intenso/i)).toBeInTheDocument();
        expect(within(brasil).getByText(/chocolate y nuez/i)).toBeInTheDocument();
        expect(within(brasil).getByText("Precio: $5.020")).toBeInTheDocument();

        expect(within(colombia).getByText(/acidez: media/i)).toBeInTheDocument();
        expect(within(colombia).getByText(/cuerpo: equilibrado/i)).toBeInTheDocument();
        expect(within(colombia).getByText(/caramelo y frutos rojos/i)).toBeInTheDocument();
        expect(within(colombia).getByText("Precio: $5.740")).toBeInTheDocument();

        expect(within(etiopia).getByText(/acidez: alta/i)).toBeInTheDocument();
        expect(within(etiopia).getByText(/cuerpo: ligero/i)).toBeInTheDocument();
        expect(within(etiopia).getByText(/flores y cítricos/i)).toBeInTheDocument();
        expect(within(etiopia).getByText("Precio: $6.100")).toBeInTheDocument();
    });

    it("permite seleccionar un origen sin ocultar las otras tarjetas", async () => {
        const user = userEvent.setup();
        renderSelector();

        await user.click(
            await screen.findByRole("button", { name: /^expreso$/i }),
        );

        await user.selectOptions(screen.getByLabelText(/tamaño/i), "Pocillo");

        const brasil = screen.getByRole("button", { name: /brasil/i });

        await user.click(brasil);

        expect(brasil).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("button", { name: /colombia/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /etiopía/i })).toBeInTheDocument();
    });

    it("mantiene deshabilitado agregar al carrito hasta seleccionar un origen", async () => {
        const user = userEvent.setup();
        renderSelector();

        const boton = await screen.findByRole("button", {
            name: /agregar al carrito/i,
        });

        expect(boton).toBeDisabled();

        await user.click(screen.getByRole("button", { name: /^expreso$/i }));
        await user.selectOptions(screen.getByLabelText(/tamaño/i), "Pocillo");

        expect(boton).toBeDisabled();
    });

    it("agrega al carrito el origen seleccionado con su precio de la API", async () => {
        const user = userEvent.setup();
        renderSelector();

        await user.click(
            await screen.findByRole("button", { name: /^expreso$/i }),
        );

        await user.selectOptions(screen.getByLabelText(/tamaño/i), "Pocillo");

        await user.click(screen.getByRole("button", { name: /brasil/i }));

        await user.click(
            screen.getByRole("button", { name: /agregar al carrito/i }),
        );

        expect(
            await screen.findByText((_, elemento) =>
                elemento?.textContent === "Precio unitario: $5.020",
            ),
        ).toBeInTheDocument();

        expect(screen.getByText("Cantidad: 1")).toBeInTheDocument();
    });
});
