import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const retired = [
  "apps/docs/src/docsRegistry.ts",
  "apps/docs/src/discoveryRoutes.ts",
  "apps/docs/src/MetadataPage.tsx",
  "apps/docs/src/AiContextIndexPage.tsx",
  "apps/docs/src/styles/docs-context.css",
  "apps/docs/src/referenceRouteId.ts",
  "scripts/reference-route-id.test.mjs",
  "apps/docs/src/ReferenceSearchPage.tsx",
  "examples/basic-playground/src/app/referenceCatalogRoutes.ts",
  "examples/basic-playground/src/components/PropsTable.tsx",
  "examples/basic-playground/src/pages/reference/PriorityComponentPages.tsx",
  "examples/basic-playground/src/pages/reference/FormComponentPages.tsx",
  "examples/basic-playground/src/pages/reference/ControlComponentPages.tsx",
  "examples/basic-playground/src/pages/reference/OverlayComponentPages.tsx",
  "examples/basic-playground/src/pages/reference/AutocompletePage.tsx",
  "examples/basic-playground/src/pages/reference/TransferListPage.tsx",
  "examples/basic-playground/src/pages/reference/ToastPage.tsx",
  "examples/basic-playground/src/pages/reference/MetadataCatalogPages.tsx",
  "examples/basic-playground/src/pages/reference/MetadataDetailPages.tsx",
];

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
  for (const relativePath of retired) {
    assert.equal(
      existsSync(path.join(root, relativePath)),
      false,
      relativePath,
    );
  }
});

test("Docs routes are curated without duplicating generated public facts", () => {
  const source = read("apps/docs/src/referenceRoutes.ts");
  assert.match(source, /publicDocsSections/u);
  assert.match(source, /uniqueRoutes/u);
  assert.match(source, /component-reference/u);
  assert.match(source, /token-reference/u);
  assert.match(source, /pattern-reference/u);
  assert.match(source, /package-reference/u);
  assert.doesNotMatch(source, /accessibility-reference/u);
  assert.doesNotMatch(source, /import\.meta\.glob/u);
  assert.doesNotMatch(source, /generated\/ai-context/u);
  assert.doesNotMatch(source, /referenceModel\.domains\.flatMap/u);
});

test("Docs owns generated component facts after Playground retirement", () => {
  const routes = read("apps/docs/src/referenceRoutes.ts");
  assert.match(routes, /component-reference/u);
  assert.match(routes, /kind: "example"/u);
  assert.match(routes, /kind: "executable-examples"/u);

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
