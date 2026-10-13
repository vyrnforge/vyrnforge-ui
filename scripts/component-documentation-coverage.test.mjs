import assert from "node:assert/strict";
import test from "node:test";

import { verifyComponentDocumentationCoverage } from "./component-documentation-coverage.mjs";

test("owned component documentation coverage is monotonic across the required public scope", () => {
  const result = verifyComponentDocumentationCoverage({ base: null, head: null });

  assert.deepEqual(result.failures, []);
  assert.equal(result.coverage.requiredComponentCount, 71);
  assert.equal(result.coverage.ownedComponentCount, 7);
  assert.equal(result.coverage.fallbackComponentCount, 64);
  assert.equal(
    result.coverage.requiredComponentCount,
    result.coverage.ownedComponentCount + result.coverage.fallbackComponentCount,
  );
  assert(!result.coverage.fallbackComponentIds.includes("button"));
});
