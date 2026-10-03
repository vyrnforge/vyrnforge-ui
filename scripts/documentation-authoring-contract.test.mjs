import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

test("documentation authoring guide is the contributor source of truth", () => {
  const guide = read("docs/engineering/documentation-authoring.md");
  const system = read("docs/engineering/documentation-system.md");
  const governance = read("docs/governance/00-documentation-governance.md");
  const readme = read("docs/README.md");

  assert.match(guide, /contributor source of truth/u);
  assert.match(
    system,
    /\[Documentation authoring\]\(documentation-authoring\.md\)/u,
  );
  assert.match(governance, /docs\/engineering\/documentation-authoring\.md/u);
  assert.match(
    readme,
    /\[Documentation Authoring\]\(engineering\/documentation-authoring\.md\)/u,
  );
});

test("authoring guide documents framework version content and examples", () => {
  const guide = read("docs/engineering/documentation-authoring.md");

  for (const marker of [
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
  ]) {
    assert.equal(
      guide.includes(marker),
      true,
      `missing authoring marker: ${marker}`,
    );
  }

  assert.match(guide, /Native HTML \/ Custom Elements \| HTML \+ TypeScript/u);
  assert.match(guide, /React \| TSX/u);
  assert.match(guide, /Angular \| TypeScript \+ Angular templates/u);
  assert.match(guide, /Vue \| Vue SFC \+ TypeScript/u);
});

test(
  "authoring guide documents canonical contributor commands and forbidden shortcuts",
  () => {
    const guide = read("docs/engineering/documentation-authoring.md");

    for (const command of [
      "npm run scaffold:documentation",
      "npm run generate:reference",
      "npm run verify:reference",
      "npm run verify:docs-quality",
      "npm run test:contracts",
      "npm run build:docs",
    ]) {
      assert.equal(
        guide.includes(command),
        true,
        `missing authoring command: ${command}`,
      );
    }

    for (const marker of [
      "apps/docs/src/referenceRoutes.ts",
      "apps/docs/src/DocsNav.tsx",
      "docs/generated/documentation-registry.json",
      "docs/generated/reference-model.json",
    ]) {
      assert.equal(
        guide.includes(marker),
        true,
        `missing forbidden shortcut: ${marker}`,
      );
    }

    const governance = read("docs/governance/00-documentation-governance.md");
    assert.doesNotMatch(governance, /referenceRoutes\.ts` may curate/u);
    assert.match(governance, /runtime adapter over those generated facts/u);
  },
);
