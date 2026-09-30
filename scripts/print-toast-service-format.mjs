import { readFileSync } from "node:fs";
import { format } from "prettier";

for (const file of [
  "docs/architecture/07-overlay-and-focus.md",
  "packages/ui-angular/src/toast.ts",
  "packages/ui-behaviors/src/toast-service.ts",
  "packages/ui-components/src/internal/behaviors/useToastBehavior.ts",
  "packages/ui-elements/src/components/feedback.ts",
  "packages/ui-elements/src/toast-service.ts",
  "packages/ui-vue/src/plugin.ts",
  "packages/ui-vue/src/toast.ts"
]) {
  const source = readFileSync(file, "utf8");
  const formatted = await format(source, { filepath: file });
  console.log(`---BEGIN-PRETTIER:${file}---`);
  console.log(formatted);
  console.log(`---END-PRETTIER:${file}---`);
}
