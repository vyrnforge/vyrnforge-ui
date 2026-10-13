import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  buildComponentDocumentationPreviewProjection,
  serializeComponentDocumentationPreviewProjection,
} from "./generate-component-documentation-previews.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");

test("owned component preview projection is current", () => {
  assert.equal(
    read("docs/generated/component-documentation-previews.json"),
    serializeComponentDocumentationPreviewProjection({ root }),
  );
});

test("button specimen is projected from its canonical package-owned documentation", () => {
  const projection = buildComponentDocumentationPreviewProjection({ root });
  const button = projection.components.find(
    (component) => component.componentId === "button",
  );

  assert.ok(button);
  assert.equal(
    button.sourcePath,
    "packages/ui-elements/src/components/button.docs.json",
  );
  assert.deepEqual(
    button.examples.map((example) => example.id),
    ["variants", "sizes", "states", "width", "content", "form-actions"],
  );
  assert.ok(button.examples.some((example) => example.preview !== null));
});

test("migrated preview components cannot regain docs-local specimen renderers", () => {
  const projection = buildComponentDocumentationPreviewProjection({ root });
  const legacySource = read("apps/docs/src/LegacyReferenceComponentSpecimen.tsx");
  const rendererSource = read("apps/docs/src/ReferenceComponentSpecimen.tsx");

  for (const component of projection.components) {
    assert.equal(
      legacySource.includes(`${JSON.stringify(component.componentId)}:`),
      false,
      `${component.componentId} must not have a legacy docs-local renderer`,
    );
    assert.equal(
      legacySource.includes(`${component.componentId}: render`),
      false,
      `${component.componentId} must not have a legacy docs-local renderer`,
    );
  }

  assert.match(rendererSource, /component-documentation-previews\.json\?raw/u);
  assert.match(rendererSource, /getComponentReferenceRecord/u);
  assert.match(rendererSource, /LegacyReferenceComponentSpecimen/u);
});
