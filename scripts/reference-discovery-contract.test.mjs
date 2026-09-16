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
  for (const marker of [
    "design-tokens.json?raw",
    "patterns.json?raw",
    "componentReferenceRecords",
    "packageReferenceRecords",
    "component.contract?.accessibility",
  ]) {
    assert.match(
      adapter,
      new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }

  const routes = read("apps/docs/src/referenceRoutes.ts");
  for (const domainId of [
    "search",
    "tokens",
    "patterns",
    "accessibility",
    "components",
    "packages",
  ]) {
    assert(routes.includes(`${domainId}: {`));
  }
  assert.match(routes, /referenceModel\.domains\.flatMap/);
  assert.match(routes, /import\.meta\.glob/);

  const app = read("apps/docs/src/App.tsx");
  for (const domainId of ["tokens", "patterns", "accessibility"]) {
    assert(app.includes(`domain: "${domainId}"`));
  }
  assert.match(app, /matchReferenceRecordRoute/);
  assert.match(app, /getRouteById/);
  assert.doesNotMatch(app, /getDiscoveryRouteById/);

  const nav = read("apps/docs/src/DocsNav.tsx");
  assert.match(nav, /docsRoutes/);
  assert.doesNotMatch(nav, /discoveryRoutes/);
  assert.match(nav, /Filter VyrnForge Reference navigation/);

  const search = read("apps/docs/src/ReferenceSearchPage.tsx");
  for (const marker of [
    "docsRoutes",
    "discoveryPackages",
    "discoveryComponents",
    "designTokenCategories",
    "patternReferenceRecords",
    "accessibilityReferenceRecords",
    "referenceModel.examples",
    'recordHref("tokens"',
    'recordHref("patterns"',
    'recordHref("accessibility"',
    'recordHref("components"',
    'recordHref("packages"',
  ]) {
    assert.match(
      search,
      new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
  assert.doesNotMatch(search, /discoveryRoutes/);

  const page = read("apps/docs/src/DiscoveryReferencePage.tsx");
  assert.match(page, /getReferenceRecordRoute/);
  assert.match(page, /Canonical design-token explorer/);
  assert.match(page, /Reusable application patterns/);
  assert.match(page, /Accessibility and keyboard discovery/);
  assert.match(page, /Canonical accessibility standards/);
  assert.match(page, /Full component reference/);
});
