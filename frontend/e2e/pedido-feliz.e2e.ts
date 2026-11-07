import { test, expect } from "@playwright/test";

const API = "http://localhost:3001";

test.beforeEach(async ({ request }) => {
    const reset = await request.post(`${API}/__test__/reset`);
    expect(reset.ok()).toBe(true);

    const seed = await request.post(`${API}/__test__/seed`);
    expect(seed.ok()).toBe(true);
});

test("recorrido feliz: elegir, agregar, confirmar y ver el pedido", async ({ page }) => {
    await page.goto("/?mesa=4");
    await expect(page.getByText("Mesa 4")).toBeVisible();

    const selector = page.getByRole("region", { name: "Seleccioná tu café" });
    await expect(selector.getByRole("button", { name: "Expreso" })).toBeVisible();

    await selector.getByRole("button", { name: "Expreso" }).click();
    await selector.getByLabel("Tamaño").selectOption("Mediano");
    await selector.getByRole("button", { name: /^Colombia/ }).click();
    await selector.getByRole("button", { name: "Agregar al carrito" }).click();

    const carrito = page.getByRole("region", { name: "Carrito" });
    await expect(carrito.getByText("Cantidad: 1")).toBeVisible();
    await expect(carrito.getByText("Subtotal: $7.360")).toBeVisible();

    await page.getByRole("button", { name: "Confirmar pedido" }).click();

    await expect(page.getByText(/Pedido N°/)).toBeVisible();
    await expect(page.getByText(/Estado: pendiente/i).first()).toBeVisible();
    await expect(page.getByText(/Total: \$7\.360/)).toBeVisible();
});