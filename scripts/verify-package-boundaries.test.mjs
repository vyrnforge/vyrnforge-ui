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

test("permits the approved seven-package dependency graph", () => {
  assert.deepEqual(verifyFixture("valid"), []);
});

test("rejects forbidden VyrnForge dependency directions", () => {
  const failures = verifyFixture("invalid");

  for (const expected of [
    "core-to-components.ts: @vyrnforge/ui-core must not import @vyrnforge/ui-components",
    "core-to-grid.ts: @vyrnforge/ui-core must not import @vyrnforge/ui-data-grid",
    "components-to-grid.ts: @vyrnforge/ui-components must not import @vyrnforge/ui-data-grid",
    "renderer-leak.ts: @vyrnforge/ui-behaviors must not import @vyrnforge/ui-components",
  ]) {
    assert(failures.some((failure) => failure.includes(expected)));
  }

  assert(
    failures.includes(
      "packages/ui-angular/package.json: @vyrnforge/ui-angular must not declare @vyrnforge/ui-components in dependencies",
    ),
  );
  assert(
    failures.includes(
      "packages/ui-vue/package.json: @vyrnforge/ui-vue must not declare @vyrnforge/ui-angular in dependencies",
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

test("rejects application state managers in published package boundaries", () => {
  const failures = verifyFixture("invalid");

  assert(
    failures.includes(
      "packages/ui-components/package.json: @vyrnforge/ui-components must not depend on application state manager zustand in dependencies",
    ),
  );
});

test("keeps framework runtimes inside their owning facade or React package", () => {
  const failures = verifyFixture("invalid");

  assert(
    failures.some((failure) =>
      failure.includes(
        "@vyrnforge/ui-behaviors must not declare framework runtime react",
      ),
    ),
  );
  assert(
    failures.some((failure) =>
      failure.includes(
        "react-leak.ts: @vyrnforge/ui-behaviors must not import framework runtime react",
      ),
    ),
  );
  assert(
    failures.some((failure) =>
      failure.includes(
        "@vyrnforge/ui-elements must not declare framework runtime vue",
      ),
    ),
  );
  assert(
    failures.some((failure) =>
      failure.includes(
        "react-leak.ts: @vyrnforge/ui-elements must not import framework runtime react-dom",
      ),
    ),
  );
  assert(
    failures.includes(
      "packages/ui-angular/package.json: @vyrnforge/ui-angular must not declare framework runtime react in dependencies",
    ),
  );
  assert(
    failures.includes(
      "packages/ui-vue/package.json: @vyrnforge/ui-vue must not declare framework runtime @angular/core in dependencies",
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

test("rejects DOM globals from framework-neutral behaviors", () => {
  const failures = verifyFixture("invalid");
  assert(
    failures.some((failure) =>
      failure.includes(
        "dom-leak.ts: @vyrnforge/ui-behaviors must remain DOM-neutral and must not reference HTMLElement",
      ),
    ),
  );
  assert(
    failures.some((failure) =>
      failure.includes(
        "dom-leak.ts: @vyrnforge/ui-behaviors must remain DOM-neutral and must not reference document",
      ),
    ),
  );
});
