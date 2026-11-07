import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ErrorApi } from "../../api/http";
import { mensajeDeError } from "../../api/errores";

describe("mensajeDeError", () => {
  it("muestra el mensaje que devolvió la API", () => {
    const error = new ErrorApi("Mesa 9999 no encontrada", 404);

    expect(mensajeDeError(error)).toBe("Mesa 9999 no encontrada");
  });

  it("avisa que la respuesta no tiene el formato esperado si no cumple el contrato", () => {
    const resultado = z.object({ id: z.number() }).safeParse({ id: "x" });
    const error = resultado.success ? null : resultado.error;

    expect(mensajeDeError(error)).toBe("La respuesta del servidor no tiene el formato esperado");
  });

  it("avisa que no pudo conectar con el servidor ante cualquier otro error", () => {
    expect(mensajeDeError(new TypeError("Failed to fetch"))).toBe("No se pudo conectar con el servidor");
    expect(mensajeDeError("algo raro")).toBe("No se pudo conectar con el servidor");
  });
});