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

test("Docs routes are derived from the generated public document registry", () => {
  const source = read("apps/docs/src/referenceRoutes.ts");
  const model = json("docs/generated/reference-model.json");

  assert.match(source, /referenceModel\.documentRegistry\.documents/u);
  assert.match(source, /referenceModel\.documentRegistry\.categories/u);
  assert.match(source, /publicDocumentMarkdownById/u);
  assert.doesNotMatch(source, /const docs: DocsRoute\[\]/u);
  assert.doesNotMatch(source, /uniqueRoutes/u);
  assert.doesNotMatch(source, /generated\/ai-context/u);

  for (const id of [
    "component-reference",
    "token-reference",
    "pattern-reference",
    "package-reference",
  ]) {
    assert(model.documentRegistry.documents.some((document) => document.id === id));
  }
});

test("Docs owns generated component facts after Playground retirement", () => {
  const model = json("docs/generated/reference-model.json");
  assert(
    model.documentRegistry.documents.some(
      (document) =>
        document.id === "component-reference" &&
        document.renderer === "component-reference",
    ),
  );
  assert(
    model.documentRegistry.documents.some(
      (document) => document.renderer === "example",
    ),
  );
  assert(
    model.documentRegistry.documents.some(
      (document) => document.renderer === "executable-examples",
    ),
  );

  const reader = read("apps/docs/src/ComponentReferencePage.tsx");
  assert.match(reader, /frameworkApiReferenceRaw/u);
  assert.match(reader, /componentReferenceRecords/u);
  assert.match(reader, /FrameworkApiPanel/u);
});

test("Docs keeps verified examples without duplicate Playground wiring", () => {
  const docsPage = read("apps/docs/src/DocsPage.tsx");
  const examples = read("apps/docs/src/examples/ExecutableExamplesPage.tsx");
  assert.match(docsPage, /ExecutableExamplesPage/u);
  assert.match(examples, /getExecutableExampleRecord/u);
  assert.equal(existsSync(path.join(root, "examples/basic-playground")), false);
});
