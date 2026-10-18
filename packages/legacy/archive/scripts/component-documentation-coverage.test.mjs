import assert from "node:assert/strict";
import test from "node:test";

import { verifyComponentDocumentationCoverage } from "./component-documentation-coverage.mjs";

test("owned component documentation coverage is monotonic across the required public scope", () => {
  const result = verifyComponentDocumentationCoverage();

  assert.deepEqual(result.failures, []);
  assert(result.coverage.requiredComponentCount >= 71);
  assert(result.coverage.ownedComponentCount >= 15);
  assert(result.coverage.fallbackComponentCount <= 56);
  assert.equal(
    result.coverage.requiredComponentCount,
    result.coverage.ownedComponentCount +
      result.coverage.fallbackComponentCount,
  );
  for (const componentId of [
    "button",
    "icon-button",
    "toolbar-button",
    "button-group",
    "checkbox",
    "radio",
    "switch",
    "select",
    "radio-group",
  ]) {
    assert(!result.coverage.fallbackComponentIds.includes(componentId));
  }
});
