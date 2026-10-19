import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: false,
  clean: true,
  external: ["@vyrnforge/ui-behaviors", "react", "react-dom"],
});
