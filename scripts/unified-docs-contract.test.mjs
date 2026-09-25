import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

test("current Docs is the only reader-facing example surface", () => {
  const shell = read("apps/docs/src/DocsShell.tsx");
  const preview = read("apps/docs/src/ReferencePreview.tsx");
  assert.doesNotMatch(shell, /getPlaygroundHref|>\s*Examples\s*</u);
  assert.doesNotMatch(preview, /<iframe|playground/u);
});

test("unified Docs exposes foundations, framework examples, patterns, and grid examples", () => {
  const routes = read("apps/docs/src/referenceRoutes.ts");
  for (const id of [
    "framework-examples",
    "theme-modes",
    "density",
    "css-overrides",
    "pattern-reference",
    "grid-basic",
    "grid-columns",
    "grid-filtering",
    "grid-grouping",
    "grid-resizing",
    "grid-selection",
    "grid-states",
    "grid-themes",
  ]) {
    assert.match(routes, new RegExp(`"${id}"`, "u"));
  }
});

test("stress and quality harnesses are not migrated into public Docs", () => {
  assert.equal(
    existsSync(path.join(root, "apps/docs/src/examples/patterns/OverlayStressPage.tsx")),
    false,
  );
  assert.equal(
    existsSync(path.join(root, "apps/docs/src/examples/quality/ComponentMatrixPage.tsx")),
    false,
  );
});
