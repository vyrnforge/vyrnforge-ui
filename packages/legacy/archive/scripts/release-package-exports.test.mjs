import assert from "node:assert/strict";
import test from "node:test";

import {
  collectPackageExportEntries,
  collectStringTargets,
  exportSpecifier,
} from "./release-package-exports.mjs";

test("release export helper derives package specifiers", () => {
  assert.equal(
    exportSpecifier("@vyrnforge/ui-angular", "."),
    "@vyrnforge/ui-angular",
  );
  assert.equal(
    exportSpecifier("@vyrnforge/ui-angular", "./forms"),
    "@vyrnforge/ui-angular/forms",
  );
});

test("release export helper flattens nested conditional targets", () => {
  assert.deepEqual(
    collectStringTargets({
      types: "./dist/index.d.ts",
      browser: { import: "./dist/browser.js", default: "./dist/index.js" },
    }),
    ["./dist/index.d.ts", "./dist/browser.js", "./dist/index.js"],
  );
});

test("release export helper covers every public subpath deterministically", () => {
  const entries = collectPackageExportEntries("@vyrnforge/ui-elements", {
    "./register": {
      types: "./dist/register.d.ts",
      import: "./dist/register.js",
      require: "./dist/register.cjs",
    },
    ".": {
      types: "./dist/index.d.ts",
      import: "./dist/index.js",
      require: "./dist/index.cjs",
    },
    "./custom-elements.json": "./custom-elements.json",
  });

  assert.deepEqual(
    entries.map(({ specifier }) => specifier),
    [
      "@vyrnforge/ui-elements",
      "@vyrnforge/ui-elements/custom-elements.json",
      "@vyrnforge/ui-elements/register",
    ],
  );
  assert.deepEqual(entries[2].targets, [
    "./dist/register.d.ts",
    "./dist/register.js",
    "./dist/register.cjs",
  ]);
});
