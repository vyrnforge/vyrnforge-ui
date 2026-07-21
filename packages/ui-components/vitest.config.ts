import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["../../tests/dom/setup.ts"],
    coverage: {
      all: true,
      exclude: ["src/**/*.d.ts", "src/**/*.types.ts", "src/**/*.test.{ts,tsx}", "src/**/__tests__/**"],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text", "html", "json", "json-summary", "lcov"],
      reportsDirectory: "../../coverage/ui-components",
      thresholds: {
        branches: 51,
        functions: 48,
        lines: 49,
        statements: 49
      }
    }
  }
});
