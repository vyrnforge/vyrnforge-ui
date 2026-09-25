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
  assert.match(source, /framework-examples/u);
  assert.match(source, /grid-basic/u);
  assert.doesNotMatch(source, /accessibility-reference/u);
  assert.doesNotMatch(source, /import\.meta\.glob/u);
  assert.doesNotMatch(source, /generated\/ai-context/u);
  assert.doesNotMatch(source, /referenceModel\.domains\.flatMap/u);
});

test("public example content is owned by Docs", () => {
  const page = read("apps/docs/src/UnifiedExamplePage.tsx");
  const patterns = read("apps/docs/src/examples/PatternExamples.tsx");
  const frameworkExamples = read("apps/docs/src/FrameworkExamplesPage.tsx");
  assert.match(page, /DocumentationPage/u);
  assert.match(page, /ThemeModesPage/u);
  assert.match(page, /BasicGridPage/u);
  assert.match(patterns, /ResourceListPage/u);
  assert.match(patterns, /SettingsPage/u);
  assert.match(frameworkExamples, /executableExampleRecords/u);
});

test("Docs component readers do not depend on Playground execution", () => {
  const preview = read("apps/docs/src/ReferencePreview.tsx");
  assert.doesNotMatch(preview, /iframe|playgroundPath|getPlayground/u);
  assert.match(preview, /LiveSample/u);
  assert.match(preview, /FrameworkCode/u);
});
