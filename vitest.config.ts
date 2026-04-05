import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
  test: {
    environment: "node",
    globals: false,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    // @react-pdf/renderer ships CJS internals that must be inlined
    // so Vite can transform them for the Node test environment.
    server: {
      deps: {
        inline: ["@react-pdf/renderer"],
      },
    },
    // PDF rendering + route round-trips can take a moment.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Show per-test timing so bulk tests are visible.
    reporters: ["default"],
  },
});
