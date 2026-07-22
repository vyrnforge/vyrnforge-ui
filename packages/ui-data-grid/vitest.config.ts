import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@vyrnforge\/ui-components$/,
        replacement: fileURLToPath(
          new URL("../ui-components/src/index.ts", import.meta.url),
        ),
      },
      {
        find: /^@vyrnforge\/ui-core$/,
        replacement: fileURLToPath(
          new URL("../ui-core/src/index.ts", import.meta.url),
        ),
      },
    ],
  },
  test: {
    coverage: {
      all: true,
      exclude: ["src/**/*.d.ts", "src/**/*.types.ts", "src/**/*.test.{ts,tsx}", "src/**/__tests__/**"],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text", "html", "json", "json-summary", "lcov"],
      reportsDirectory: "../../coverage/ui-data-grid",
      thresholds: {
        branches: 32,
        functions: 36,
        lines: 38,
        statements: 38
      }
    }
  }
});
