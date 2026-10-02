import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { retiredReferencePaths } from "./reference-retired-paths.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}
function json(relativePath) {
  return JSON.parse(read(relativePath));
}

test("Reference transitional authorities remain retired", () => {
  assert.deepEqual(
    json("docs/metadata/reference-portal.json").routing.transitionalRegistries,
    [],
  );
  assert.deepEqual(
    json("docs/generated/reference-model.json").transitionalRegistries,
    [],
  );
  for (const relativePath of retiredReferencePaths) {
    assert.equal(
      existsSync(path.join(root, relativePath)),
      false,
      relativePath,
    );
  }
});

test("Docs public routes are registry-driven instead of hand-registered", () => {
  const metadata = json("docs/metadata/documentation-pages.json");
  const registry = json("docs/generated/documentation-registry.json");
  const source = read("apps/docs/src/referenceRoutes.ts");

  assert.equal(metadata.sourceOfTruth.canonical, true);
  assert.equal(registry.schemaVersion, 2);
  assert(registry.pages.length > 20);
  assert.match(source, /generated\/documentation-registry\.json\?raw/u);
  assert.match(source, /registry\.pages\.map/u);
  assert.match(source, /registry\.sections\.map/u);
  assert.doesNotMatch(source, /const docs: DocsRoute\[\] = \[/u);
  assert.doesNotMatch(source, /id: "component-reference"/u);
  assert.doesNotMatch(source, /generated\/ai-context/u);
});

test("Docs owns generated component facts after Playground retirement", () => {
  const registry = json("docs/generated/documentation-registry.json");
  const reader = read("apps/docs/src/ComponentReferencePage.tsx");

  assert(
    registry.pages.some(
      (page) =>
        page.id === "component-reference" &&
        page.renderer === "component-reference",
    ),
  );
  assert.match(reader, /frameworkApiReferenceRaw/u);
  assert.match(reader, /componentReferenceRecords/u);
  assert.match(reader, /FrameworkApiPanel/u);
});

test("Docs keeps verified examples without duplicate Playground wiring", () => {
  const registry = json("docs/generated/documentation-registry.json");
  const docsPage = read("apps/docs/src/DocsPage.tsx");
  const examples = read("apps/docs/src/examples/ExecutableExamplesPage.tsx");

  assert(registry.pages.some((page) => page.renderer === "example"));
  assert(
    registry.pages.some((page) => page.renderer === "executable-examples"),
  );
  assert.match(docsPage, /ExecutableExamplesPage/u);
  assert.match(examples, /getExecutableExampleRecord/u);
  assert.equal(existsSync(path.join(root, "examples/basic-playground")), false);
});
