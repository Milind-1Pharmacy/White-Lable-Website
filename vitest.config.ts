/**
 * @file vitest.config.ts
 * @description Vitest configuration for the platform's unit + component tests.
 *  Uses the SWC React plugin (no Babel), a jsdom environment for component
 *  rendering, and the `@/` path alias so tests import exactly like app code.
 * @author WhiteLabel Platform Team
 * @created 2026-06-24
 */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "out"],
  },
});
