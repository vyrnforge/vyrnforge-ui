import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: false,
  minify: false,
  clean: true,
  sourcemap: false,
  target: "es2022",
  splitting: false,
  external: ["@vyrnforge/ui-elements", "vue"],
});
