import { readFileSync } from "node:fs";
import { format } from "prettier";

for (const file of [
  "packages/ui-components/src/__tests__/host-adoption.test.tsx",
  "packages/ui-elements/src/components/composition.ts",
]) {
  const formatted = await format(readFileSync(file, "utf8"), { filepath: file });
  console.log(`---BEGIN-PRETTIER:${file}---`);
  console.log(formatted);
  console.log(`---END-PRETTIER:${file}---`);
}
