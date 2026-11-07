import request from "supertest";
import app from "../../app";

describe("JSON mal formado", () => {
  it("POST /api/pedidos con JSON inválido responde 400 con { error }", async () => {
    const res = await request(app)
      .post("/api/pedidos")
      .set("Content-Type", "application/json")
      .send('{"items": [');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: expect.any(String) });
  });
});
