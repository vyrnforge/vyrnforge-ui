import { readFileSync } from "node:fs";
import { format, resolveConfig } from "prettier";

for (const file of [
  "apps/docs/src/GuidePage.tsx",
  "scripts/documentation-template-contract.test.mjs",
]) {
  const config = (await resolveConfig(file)) ?? {};
  const source = readFileSync(file, "utf8");
  const formatted = await format(source, { ...config, filepath: file });
  console.log(`---FORMAT:${file}---`);
  console.log(formatted);
  console.log(`---END:${file}---`);
}
