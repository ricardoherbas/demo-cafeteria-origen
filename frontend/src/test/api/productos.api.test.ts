
import { afterEach, describe, expect, it, vi } from "vitest";
import { http } from "../../api/http";
import {
  obtenerProductoPorId,
  obtenerProductos,
} from "../../api/productos.api";

const productoExpreso = {
  id: 1,
  nombre: "Expreso",
  precio: 1500,
  tipo: "expreso" as const,
  tamanio: "chico",
  gramosCafe: 10,
  variedad: {
    nombre: "Brasil",
    precioPorGramo: 20,
    descripcion: "Café brasileño",
  },
};

const productoPasteleria = {
  id: 2,
  nombre: "Muffin",
  precio: 1200,
  tipo: "pasteleria" as const,
};

describe("API de productos", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("obtiene y devuelve la lista de productos", async () => {
    vi.spyOn(http, "get").mockResolvedValue([
      productoExpreso,
      productoPasteleria,
    ]);

    const resultado = await obtenerProductos();

    expect(http.get).toHaveBeenCalledWith("/productos");
    expect(resultado).toEqual([
      productoExpreso,
      productoPasteleria,
    ]);
  });

  it("obtiene un producto por su ID", async () => {
    vi.spyOn(http, "get").mockResolvedValue(productoExpreso);

    const resultado = await obtenerProductoPorId(1);

    expect(http.get).toHaveBeenCalledWith("/productos/1");
    expect(resultado).toEqual(productoExpreso);
  });

  it("rechaza una lista que contiene productos inválidos", async () => {
    vi.spyOn(http, "get").mockResolvedValue([
      {
        id: 3,
        nombre: "Producto inválido",
        tipo: "desconocido",
      },
    ]);

    await expect(obtenerProductos()).rejects.toThrow();
  });

  it("rechaza un producto individual con datos inválidos", async () => {
    vi.spyOn(http, "get").mockResolvedValue({
      id: 1,
      nombre: "Expreso",
      tipo: "expreso",
    });

    await expect(obtenerProductoPorId(1)).rejects.toThrow();
  });
});
