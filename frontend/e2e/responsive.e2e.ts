
import { test, expect } from "@playwright/test";

const API = "http://localhost:3001";

test.beforeEach(async ({ request }) => {
    await request.post(`${API}/__test__/reset`);
    await request.post(`${API}/__test__/seed`);
});

test("el menú no tiene scroll horizontal a 375 px", async ({ page }) => {
    await page.goto("/?mesa=4");

    await expect(
        page.getByRole("button", { name: "Agregar al carrito" }).first(),
    ).toBeVisible();

    const sinScroll = await page.evaluate(
        () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    );

    expect(sinScroll).toBe(true);
});
