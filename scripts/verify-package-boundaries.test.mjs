import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { verifyPackageBoundaries } from "./verify-package-boundaries.mjs";

const fixturesRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures/package-boundaries",
);

function verifyFixture(name) {
  return verifyPackageBoundaries({ root: path.join(fixturesRoot, name) });
}

test("permits the approved current and planned package dependency graph", () => {
  assert.deepEqual(verifyFixture("valid"), []);
});

test("rejects forbidden VyrnForge dependency directions", () => {
  const failures = verifyFixture("invalid");

  assert(
    failures.some((failure) =>
      failure.includes(
        "core-to-components.ts: @vyrnforge/ui-core must not import @vyrnforge/ui-components",
      ),
    ),
  );
  assert(
    failures.some((failure) =>
      failure.includes(
        "core-to-grid.ts: @vyrnforge/ui-core must not import @vyrnforge/ui-data-grid",
      ),
    ),
  );
  assert(
    failures.some((failure) =>
      failure.includes(
        "components-to-grid.ts: @vyrnforge/ui-components must not import @vyrnforge/ui-data-grid",
      ),
    ),
  );
  assert(
    failures.some((failure) =>
      failure.includes(
        "renderer-leak.ts: @vyrnforge/ui-behaviors must not import @vyrnforge/ui-components",
      ),
    ),
  );
});

test("rejects invalid package manifest dependencies", () => {
  const failures = verifyFixture("invalid");

  assert(
    failures.includes(
      "packages/ui-core/package.json: @vyrnforge/ui-core must not declare @vyrnforge/ui-components in dependencies",
    ),
  );
});

test("reserves framework-neutral boundaries for core, behaviors, and elements", () => {
  const failures = verifyFixture("invalid");

  assert(
    failures.some((failure) =>
      failure.includes(
        "@vyrnforge/ui-behaviors must remain framework-neutral and must not declare react",
      ),
    ),
  );
  assert(
    failures.some((failure) =>
      failure.includes(
        "react-leak.ts: @vyrnforge/ui-behaviors must remain framework-neutral and must not import react",
      ),
    ),
  );
  assert(
    failures.some((failure) =>
      failure.includes(
        "@vyrnforge/ui-elements must remain framework-neutral and must not declare vue",
      ),
    ),
  );
  assert(
    failures.some((failure) =>
      failure.includes(
        "react-leak.ts: @vyrnforge/ui-elements must remain framework-neutral and must not import react-dom",
      ),
    ),
  );
});

test("rejects relative imports that bypass a package boundary", () => {
  const failures = verifyFixture("invalid");

  assert(
    failures.some((failure) =>
      /must not bypass package boundaries.*@vyrnforge\/ui-data-grid/.test(
        failure,
      ),
    ),
  );
});

test("checks CSS imports and ignores test fixtures", () => {
  const failures = verifyFixture("invalid");

  assert(
    failures.some((failure) =>
      /styles\.css: @vyrnforge\/ui-core must not import/.test(failure),
    ),
  );
  assert(
    !failures.some(
      (failure) =>
        failure.includes("__fixtures__") || failure.includes("example.test.ts"),
    ),
  );
});
