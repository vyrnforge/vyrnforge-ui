import { readFileSync } from "node:fs";
import { format } from "prettier";

for (const file of [
  "docs/metadata/component-presets.schema.json",
  "docs/metadata/component-presets.json",
]) {
  const source = readFileSync(file, "utf8");
  const formatted = await format(source, { filepath: file });
  console.log(`---BEGIN-PRETTIER:${file}---`);
  console.log(formatted);
  console.log(`---END-PRETTIER:${file}---`);
}
