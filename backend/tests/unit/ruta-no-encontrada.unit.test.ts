import request from "supertest";
import app from "../../app";

describe("Ruta inexistente", () => {
  it("GET a una ruta que no existe responde 404 con { error }", async () => {
    const res = await request(app).get("/api/loquesea");

    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toEqual({ error: "Ruta no encontrada" });
  });

  it("POST a una ruta que no existe también responde 404 con { error }", async () => {
    const res = await request(app).post("/nada").send({});

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Ruta no encontrada" });
  });
});
