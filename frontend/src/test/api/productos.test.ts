import { describe, expect, it } from "vitest";
import { ProductoSchema } from "../../api/productos.schema";

describe("ProductoSchema", () => {
  it("acepta un producto de tipo expreso con sus datos completos", () => {
    const producto = {
      id: 1,
      nombre: "Expreso",
      precio: 1500,
      tipo: "expreso",
      tamanio: "chico",
      gramosCafe: 10,
      variedad: {
        nombre: "Brasil",
        precioPorGramo: 20,
        descripcion: "Café de origen brasileño",
      },
    };

    expect(ProductoSchema.safeParse(producto).success).toBe(true);
  });

  it("acepta un producto de tipo filtrado con sus datos completos", () => {
    const producto = {
      id: 2,
      nombre: "Filtrado",
      precio: 2000,
      tipo: "filtrado",
      tamanio: "grande",
      gramosCafe: 15,
      variedad: {
        nombre: "Colombia",
        precioPorGramo: 25,
        descripcion: "Café de origen colombiano",
      },
    };

    expect(ProductoSchema.safeParse(producto).success).toBe(true);
  });

  it("acepta un producto de tipo pastelería", () => {
    const producto = {
      id: 3,
      nombre: "Muffin",
      precio: 1200,
      tipo: "pasteleria",
    };

    expect(ProductoSchema.safeParse(producto).success).toBe(true);
  });

  it("rechaza un producto sin precio", () => {
    const producto = {
      id: 1,
      nombre: "Expreso",
      tipo: "expreso",
      tamanio: "chico",
      gramosCafe: 10,
      variedad: {
        nombre: "Brasil",
        precioPorGramo: 20,
        descripcion: "Café de origen brasileño",
      },
    };

    expect(ProductoSchema.safeParse(producto).success).toBe(false);
  });

  it("rechaza un producto con un tipo desconocido", () => {
    const producto = {
      id: 4,
      nombre: "Producto desconocido",
      precio: 1000,
      tipo: "desconocido",
    };

    expect(ProductoSchema.safeParse(producto).success).toBe(false);
  });
});