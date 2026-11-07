
import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    testMatch: "**/*.e2e.ts",
    workers: 1,
    fullyParallel: false,

    reporter: [
        ["list"],
        ["html", { open: "never" }],
    ],

    use: {
        baseURL: "http://localhost:5173",
        viewport: { width: 375, height: 667 },
        trace: "on-first-retry",
    },

    webServer: {
        command: "npm run dev",
        url: "http://localhost:5173/api/productos",
        reuseExistingServer: true,
        timeout: 60_000,
    },
});
