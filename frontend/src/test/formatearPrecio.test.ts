import { describe, expect, it } from "vitest";
import { formatearPrecio } from "../utils/formatearPrecio";

describe("formatearPrecio", () => {
    it("separa los miles con puntos", () => {
        expect(formatearPrecio(7360)).toBe("$7.360");
    });

    it("formatea precios de cuatro cifras", () => {
        expect(formatearPrecio(3500)).toBe("$3.500");
    });

    it("formatea precios de millones", () => {
        expect(formatearPrecio(1000000)).toBe("$1.000.000");
    });

    it("formatea cero", () => {
        expect(formatearPrecio(0)).toBe("$0");
    });
});
