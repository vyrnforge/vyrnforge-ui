import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run } from "vue-tsc";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = require.resolve("@typescript/typescript6");
const tscPath = path.join(path.dirname(entry), "tsc.js");
process.chdir(root);
process.argv = [
  process.execPath,
  "vue-tsc",
  "-p",
  "packages/ui-vue/tsconfig.json",
  "--noEmit",
];
run(tscPath);
