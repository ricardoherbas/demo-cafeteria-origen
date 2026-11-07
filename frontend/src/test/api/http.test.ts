import { ErrorApi, http } from "../../api/http";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("Cliente HTTP", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("realiza una petición GET y devuelve el JSON", async () => {
    const respuesta = { mensaje: "OK" };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(respuesta),
      }),
    );

    const resultado = await http.get<typeof respuesta>("/productos");

    expect(resultado).toEqual(respuesta);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/productos"),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("realiza una petición POST enviando datos JSON", async () => {
    const datos = { nombre: "Expreso" };
    const respuesta = { id: 1, ...datos };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(respuesta),
      }),
    );

    const resultado = await http.post<typeof respuesta>("/productos", datos);

    expect(resultado).toEqual(respuesta);
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(datos),
      }),
    );
  });

  it("lanza un error cuando el servidor responde con un estado HTTP fallido", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      }),
    );

    await expect(http.get("/productos/999")).rejects.toThrow();
  });

  it("propaga los errores cuando falla la conexión", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Error de conexión")),
    );

    await expect(http.get("/productos")).rejects.toThrow(
      "Error de conexión",
    );
  });

    it("usa el mensaje { error } que devuelve la API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: vi.fn().mockResolvedValue({ error: "Producto 5 no encontrado" }),
      }),
    );

    const falla = http.get("/productos/5");

    await expect(falla).rejects.toThrow("Producto 5 no encontrado");
    await expect(falla).rejects.toBeInstanceOf(ErrorApi);
    await expect(falla).rejects.toMatchObject({ status: 404 });
  });

  it("usa un mensaje genérico si el cuerpo del error no es JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: vi.fn().mockRejectedValue(new SyntaxError("no es JSON")),
      }),
    );

    await expect(http.get("/productos")).rejects.toThrow("Error HTTP 500");
  });
});
