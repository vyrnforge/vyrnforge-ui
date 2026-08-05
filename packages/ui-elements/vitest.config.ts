import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@vyrnforge\/ui-behaviors$/,
        replacement: fileURLToPath(
          new URL("../ui-behaviors/src/index.ts", import.meta.url),
        ),
      },
    ],
  },
  test: {
    coverage: {
      all: true,
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.ts",
        "src/components/**/*.ts",
        "src/register.ts",
      ],
      include: ["src/**/*.ts"],
      provider: "v8",
      reporter: ["text", "html", "json", "json-summary", "lcov"],
      reportsDirectory: "../../coverage/ui-elements",
      thresholds: { branches: 85, functions: 90, lines: 90, statements: 90 },
    },
  },
});
