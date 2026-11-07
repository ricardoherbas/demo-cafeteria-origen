import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, ".", "");
    const target = env.API_PROXY_TARGET || "http://localhost:3000";

    return {
        plugins: [react()],
        css: {
            preprocessorOptions: {
                scss: {
                    quietDeps: true,
                    silenceDeprecations: ["import", "global-builtin", "color-functions"],
                },
            },
        },
        server: {
            proxy: {
                "/api": {
                    target,
                    changeOrigin: true,
                },
            },
        },
        test: {
            environment: "jsdom",
            setupFiles: ["./src/test/setup.ts"],
            css: false,
            restoreMocks: true,
            exclude: [...configDefaults.exclude, "e2e/**"],
        },
    };
});