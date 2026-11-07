import { describe, expect, it } from "vitest";
import { leerMesa } from "../mesa/leerMesa";

describe("leerMesa", () => {
    it("devuelve el número cuando viene ?mesa=N", () => {
        expect(leerMesa("?mesa=3")).toBe(3);
    });

    it("funciona con otros parámetros en la URL", () => {
        expect(leerMesa("?foo=1&mesa=12&bar=2")).toBe(12);
    });

    it("devuelve null si no hay parámetro mesa", () => {
        expect(leerMesa("")).toBeNull();
        expect(leerMesa("?otro=1")).toBeNull();
    });

    it("devuelve null si mesa está vacío", () => {
        expect(leerMesa("?mesa=")).toBeNull();
    });

    it.each(["abc", "0", "-2", "1.5", "3abc", " ", "1e2"])(
        "devuelve null si mesa no es un entero positivo (%s)",
        (valor) => {
            expect(leerMesa(`?mesa=${encodeURIComponent(valor)}`)).toBeNull();
        },
    );

    it("usa el primer valor si mesa se repite", () => {
        expect(leerMesa("?mesa=4&mesa=9")).toBe(4);
    });
});