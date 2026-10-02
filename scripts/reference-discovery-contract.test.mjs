import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function json(relativePath) {
  return JSON.parse(read(relativePath));
}

test("Reference discovery stays derived from canonical VyrnForge sources", () => {
  const model = json("docs/generated/reference-model.json");
  const tokens = json("docs/metadata/design-tokens.json");
  const patterns = json("docs/metadata/patterns.json");
  const knowledge = json("docs/generated/consumer-knowledge.json");

  for (const domainId of [
    "guides",
    "packages",
    "components",
    "tokens",
    "patterns",
    "accessibility",
    "examples",
    "search",
  ]) {
    assert(model.domains.some((domain) => domain.id === domainId));
  }

  const searchDomain = model.domains.find((domain) => domain.id === "search");
  assert.equal(searchDomain.mode, "derived-index");
  assert.equal(searchDomain.ownsFacts, false);

  assert.equal(tokens.sourceOfTruth.canonical, true);
  assert.equal(patterns.sourceOfTruth.canonical, true);
  assert(tokens.categories.length > 0);
  assert(patterns.patterns.length > 0);
  assert(knowledge.components.length > 0);
  assert.equal(model.examples.length, 4);

  const adapter = read("apps/docs/src/discoveryData.ts");
  for (const marker of ["design-tokens.json?raw", "patterns.json?raw"]) {
    assert.match(
      adapter,
      new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }

  const routes = read("apps/docs/src/referenceRoutes.ts");
  assert.match(routes, /referenceModel\.documentRegistry\.documents/u);
  assert.match(routes, /referenceModel\.documentRegistry\.categories/u);
  assert.match(routes, /publicDocumentMarkdownById/u);

  const publicDocuments = model.documentRegistry.documents;
  for (const marker of [
    "component-reference",
    "token-reference",
    "pattern-reference",
    "package-reference",
    "accessibility",
  ]) {
    assert(publicDocuments.some((document) => document.id === marker));
  }

  const app = read("apps/docs/src/App.tsx");
  assert.match(app, /referenceModel\.documentRegistry\.documents/u);
  assert.match(app, /document\.recordDomain/u);
  assert.match(app, /matchReferenceRecordRoute/u);
  assert.match(app, /getRouteById/u);
  assert.match(app, /getRouteByPath/u);
  assert.doesNotMatch(app, /const recordRoutes/u);
  assert.doesNotMatch(app, /getDiscoveryRouteById/u);

  const nav = read("apps/docs/src/DocsNav.tsx");
  assert.match(nav, /docsRoutes/);
  assert.doesNotMatch(nav, /discoveryRoutes/);
  assert.match(nav, /VyrnForge documentation/);
  assert.match(nav, /Filter docs/u);

  const page = read("apps/docs/src/DiscoveryReferencePage.tsx");
  assert.match(page, /getReferenceRecordRoute/);
  assert.match(page, /Canonical design-token explorer/);
  assert.match(page, /Reusable application patterns/);
  assert.doesNotMatch(page, /Accessibility and keyboard discovery/u);
  assert.doesNotMatch(page, /accessibilityReferenceRecords/u);
});
