import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      all: true,
      exclude: ["src/**/*.d.ts", "src/**/*.test.ts", "src/register.ts"],
      include: ["src/**/*.ts"],
      provider: "v8",
      reporter: ["text", "html", "json", "json-summary", "lcov"],
      reportsDirectory: "../../coverage/ui-elements",
      thresholds: { branches: 85, functions: 90, lines: 90, statements: 90 },
    },
  },
});
