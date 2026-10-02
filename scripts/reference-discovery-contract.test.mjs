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
  const registry = json("docs/generated/documentation-registry.json");
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

  assert(registry.pages.some((page) => page.id === "component-reference"));
  assert(registry.pages.some((page) => page.id === "token-reference"));
  assert(registry.pages.some((page) => page.id === "pattern-reference"));
  assert(registry.pages.some((page) => page.id === "package-reference"));
  assert(registry.recordDomains.some((domain) => domain.id === "components"));

  const adapter = read("apps/docs/src/discoveryData.ts");
  for (const marker of ["design-tokens.json?raw", "patterns.json?raw"]) {
    assert(adapter.includes(marker));
  }

  const routes = read("apps/docs/src/referenceRoutes.ts");
  assert.match(routes, /generated\/documentation-registry\.json\?raw/u);
  assert.match(routes, /registry\.pages\.map/u);
  assert.match(routes, /registry\.sections\.map/u);
  assert.match(routes, /import\.meta\.glob/u);
  assert.doesNotMatch(routes, /id: "component-reference"/u);
  assert.doesNotMatch(routes, /id: "token-reference"/u);
  assert.doesNotMatch(routes, /id: "pattern-reference"/u);
  assert.doesNotMatch(routes, /id: "package-reference"/u);

  const nav = read("apps/docs/src/DocsNav.tsx");
  assert.match(nav, /docsRoutes/);
  assert.match(nav, /publicDocsSections/);
  assert.match(nav, /VyrnForge documentation/);
  assert.match(nav, /Filter docs/u);
});
