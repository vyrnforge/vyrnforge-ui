import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      all: true,
      exclude: ["src/**/*.d.ts", "src/**/*.types.ts", "src/**/*.test.{ts,tsx}", "src/**/__tests__/**"],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text", "html", "json", "json-summary", "lcov"],
      reportsDirectory: "../../coverage/ui-core",
      thresholds: {
        branches: 0,
        functions: 0,
        lines: 0,
        statements: 0
      }
    }
  }
});
