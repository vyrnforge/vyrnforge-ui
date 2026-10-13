import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as prettier from "prettier";

import { verifyComponentDocumentationCoverage } from "./component-documentation-coverage.mjs";

for (const file of [
  "scripts/component-documentation-coverage.mjs",
  "scripts/component-documentation-coverage.test.mjs",
]) {
  const source = readFileSync(file, "utf8");
  const formatted = await prettier.format(source, { filepath: file });
  console.log(`VYRNFORGE_PRETTIER_START ${file}\n${formatted}VYRNFORGE_PRETTIER_END ${file}`);
}

test("owned component documentation coverage is monotonic across the required public scope", () => {
  const result = verifyComponentDocumentationCoverage();

  assert.deepEqual(result.failures, []);
  assert(result.coverage.requiredComponentCount >= 71);
  assert(result.coverage.ownedComponentCount >= 7);
  assert(result.coverage.fallbackComponentCount <= 64);
  assert.equal(
    result.coverage.requiredComponentCount,
    result.coverage.ownedComponentCount + result.coverage.fallbackComponentCount,
  );
  assert(!result.coverage.fallbackComponentIds.includes("button"));
});
