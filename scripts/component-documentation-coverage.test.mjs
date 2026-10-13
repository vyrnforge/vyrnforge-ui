import assert from "node:assert/strict";
import test from "node:test";

import { verifyComponentDocumentationCoverage } from "./component-documentation-coverage.mjs";

test("owned component documentation coverage is monotonic across the required public scope", () => {
  const result = verifyComponentDocumentationCoverage();

  assert.deepEqual(result.failures, []);
  assert(result.coverage.requiredComponentCount >= 71);
  assert(result.coverage.ownedComponentCount >= 10);
  assert(result.coverage.fallbackComponentCount <= 61);
  assert.equal(
    result.coverage.requiredComponentCount,
    result.coverage.ownedComponentCount +
      result.coverage.fallbackComponentCount,
  );
  assert(!result.coverage.fallbackComponentIds.includes("button"));
  assert(!result.coverage.fallbackComponentIds.includes("icon-button"));
  assert(!result.coverage.fallbackComponentIds.includes("toolbar-button"));
  assert(!result.coverage.fallbackComponentIds.includes("button-group"));
});
