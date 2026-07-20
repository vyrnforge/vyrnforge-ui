import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { verifyPackageBoundaries } from "./verify-package-boundaries.mjs";

const fixturesRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures/package-boundaries"
);

function verifyFixture(name) {
  return verifyPackageBoundaries({ root: path.join(fixturesRoot, name) });
}

test("permits ui-data-grid imports from ui-components", () => {
  const failures = verifyFixture("valid");

  assert.deepEqual(failures, []);
});

test("rejects every forbidden source dependency direction", () => {
  const failures = verifyFixture("invalid");

  assert.equal(failures.length, 6);
  assert(failures.some((failure) => failure.includes("core-to-components.ts: @vyrnforge/ui-core must not import @vyrnforge/ui-components")));
  assert(failures.some((failure) => failure.includes("core-to-grid.ts: @vyrnforge/ui-core must not import @vyrnforge/ui-data-grid")));
  assert(failures.some((failure) => failure.includes("components-to-grid.ts: @vyrnforge/ui-components must not import @vyrnforge/ui-data-grid")));
});

test("rejects invalid package manifest dependencies", () => {
  const failures = verifyFixture("invalid");

  assert(failures.includes("packages/ui-core/package.json: @vyrnforge/ui-core must not declare @vyrnforge/ui-components in dependencies"));
});

test("rejects relative imports that bypass a package boundary", () => {
  const failures = verifyFixture("invalid");

  assert(failures.some((failure) => /must not bypass package boundaries.*@vyrnforge\/ui-data-grid/.test(failure)));
});

test("checks CSS imports and ignores test fixtures", () => {
  const failures = verifyFixture("invalid");

  assert(failures.some((failure) => /styles\.css: @vyrnforge\/ui-core must not import/.test(failure)));
  assert(!failures.some((failure) => failure.includes("__fixtures__") || failure.includes("example.test.ts")));
});
