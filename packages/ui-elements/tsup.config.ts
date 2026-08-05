import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/register.ts"],
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: false,
  clean: true,
  external: ["@vyrnforge/ui-core", "@vyrnforge/ui-behaviors"],
});
