import { readFileSync } from "node:fs";
import { format } from "prettier";

const file = "packages/ui-elements/src/toast-service.ts";
const formatted = await format(readFileSync(file, "utf8"), { filepath: file });
console.log(`---BEGIN-PRETTIER:${file}---`);
console.log(formatted);
console.log(`---END-PRETTIER:${file}---`);
