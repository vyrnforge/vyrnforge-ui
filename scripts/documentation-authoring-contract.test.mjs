import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function assertIncludesAll(content, values, kind) {
  for (const value of values) {
    assert.ok(content.includes(value), `missing ${kind}: ${value}`);
  }
}

test("documentation authoring guide is the source of truth", () => {
  const guide = read("docs/engineering/documentation-authoring.md");
  const system = read("docs/engineering/documentation-system.md");
  const governance = read("docs/governance/00-documentation-governance.md");
  const readme = read("docs/README.md");

  const systemLink = "[Documentation authoring](documentation-authoring.md)";
  const readmeLink =
    "[Documentation Authoring](engineering/documentation-authoring.md)";

  assert.ok(guide.includes("contributor source of truth"));
  assert.ok(system.includes(systemLink));
  assert.ok(governance.includes("docs/engineering/documentation-authoring.md"));
  assert.ok(readme.includes(readmeLink));
});

test("authoring guide covers context, availability, and examples", () => {
  const guide = read("docs/engineering/documentation-authoring.md");

  assertIncludesAll(
    guide,
    [
      "docs/metadata/documentation-pages.json",
      "docs/metadata/release-groups.json",
      "contentLayers",
      'frameworkVersions["frameworkId@version"]',
      "stable",
      "preview",
      "maintenance",
      "deprecated",
      "unavailable",
      "internal-not-ready",
      "docs/metadata/executable-examples.json",
      "tests/consumers/manifest.json",
    ],
    "authoring marker",
  );

  assert.ok(
    guide.includes("Native HTML / Custom Elements | HTML + TypeScript"),
  );
  assert.ok(guide.includes("React | TSX"));
  assert.ok(guide.includes("Angular | TypeScript + Angular templates"));
  assert.ok(guide.includes("Vue | Vue SFC + TypeScript"));
});

test("authoring guide covers commands and forbidden shortcuts", () => {
  const guide = read("docs/engineering/documentation-authoring.md");

  assertIncludesAll(
    guide,
    [
      "npm run scaffold:documentation",
      "npm run generate:reference",
      "npm run verify:reference",
      "npm run verify:docs-quality",
      "npm run test:contracts",
      "npm run build:docs",
    ],
    "authoring command",
  );

  assertIncludesAll(
    guide,
    [
      "apps/docs/src/referenceRoutes.ts",
      "apps/docs/src/DocsNav.tsx",
      "docs/generated/documentation-registry.json",
      "docs/generated/reference-model.json",
    ],
    "forbidden shortcut",
  );

  const governance = read("docs/governance/00-documentation-governance.md");
  const staleRouteRule = "referenceRoutes.ts` may curate";

  assert.equal(governance.includes(staleRouteRule), false);
  assert.ok(governance.includes("runtime adapter over those generated facts"));
});
