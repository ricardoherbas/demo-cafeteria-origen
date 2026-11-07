import { PedidosRepositoryPg } from "../../repositories/pedidos.repository";
import { AppError } from "../../middlewares/error-handler";
import conexionDB from "../../config/conexion-db";

jest.mock("../../config/conexion-db", () => ({
  __esModule: true,
  default: { connect: jest.fn(), query: jest.fn() },
}));

const nuevoPedido = {
  mesaId: 99,
  total: 5000,
  items: [{ productoId: 1, cantidad: 2, precioUnitario: 2500, subtotal: 5000 }],
};

// Cliente falso: BEGIN pasa, el INSERT de pedidos falla con el error que daría pg
function prepararClienteQueFalla(error: unknown) {
  const client = {
    query: jest.fn().mockImplementation((sql: string) => {
      if (sql.startsWith("INSERT INTO pedidos")) return Promise.reject(error);
      return Promise.resolve({ rows: [] });
    }),
    release: jest.fn(),
  };
  (conexionDB.connect as jest.Mock).mockResolvedValue(client);
  return client;
}

describe("PedidosRepositoryPg.crear con mesa inexistente", () => {
  it("traduce la violación de clave foránea de mesa_id a un 404", async () => {
    prepararClienteQueFalla({ code: "23503", constraint: "fk_pedido_mesa" });

    const promesa = new PedidosRepositoryPg().crear(nuevoPedido);

    await expect(promesa).rejects.toBeInstanceOf(AppError);
    await expect(promesa).rejects.toMatchObject({ status: 404, message: "Mesa 99 no encontrada" });
  });

  it("hace ROLLBACK y libera el cliente", async () => {
    const client = prepararClienteQueFalla({ code: "23503", constraint: "fk_pedido_mesa" });

    await new PedidosRepositoryPg().crear(nuevoPedido).catch(() => undefined);

    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it("no traduce otros errores de la base", async () => {
    const errorRaro = { code: "08006", message: "conexión caída" };
    prepararClienteQueFalla(errorRaro);

    await expect(new PedidosRepositoryPg().crear(nuevoPedido)).rejects.toBe(errorRaro);
  });

  it("no traduce una clave foránea de otro constraint", async () => {
    const errorProducto = { code: "23503", constraint: "fk_item_producto" };
    prepararClienteQueFalla(errorProducto);

    await expect(new PedidosRepositoryPg().crear(nuevoPedido)).rejects.toBe(errorProducto);
  });
});
