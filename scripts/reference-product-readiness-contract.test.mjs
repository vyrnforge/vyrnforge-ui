import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frameworkIds = ["native-html", "react", "angular", "vue"];

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function json(relativePath) {
  return JSON.parse(read(relativePath));
}

test("G18 Reference product has one generated model and equal framework surfaces", () => {
  const portal = json("docs/metadata/reference-portal.json");
  const model = json("docs/generated/reference-model.json");
  const expectedFrameworks = [...frameworkIds].sort();

  assert.equal(portal.product.semanticOwnership, "framework-neutral");
  assert.deepEqual(Object.keys(portal.frameworks).sort(), expectedFrameworks);
  assert.deepEqual(
    model.frameworks.map((framework) => framework.id).sort(),
    expectedFrameworks,
  );
  assert.equal(portal.routing.transitionalRegistries.length, 0);
  assert(model.generatedFrom.includes("docs/metadata/reference-portal.json"));

  const context = read("apps/docs/src/docsContext.ts");
  assert.match(context, /generated\/reference-model\.json\?raw/u);
  assert.match(context, /reference\/referenceRuntime/u);
});

test("G18 discovery, context, deep links, and examples stay canonical", () => {
  const portal = json("docs/metadata/reference-portal.json");
  const model = json("docs/generated/reference-model.json");
  const expectedDomains = [
    "accessibility",
    "components",
    "examples",
    "guides",
    "packages",
    "patterns",
    "search",
    "tokens",
  ];

  assert.deepEqual(
    model.domains.map((domain) => domain.id).sort(),
    expectedDomains,
  );
  assert.equal(
    model.domains.find((domain) => domain.id === "search")?.ownsFacts,
    false,
  );
  assert.equal(portal.routing.stableDeepLinks, true);
  assert.deepEqual(portal.routing.preserveContext, ["framework", "version"]);
  assert.equal(model.examples.length, frameworkIds.length);
  assert.deepEqual(
    model.examples.map((example) => example.framework).sort(),
    [...frameworkIds].sort(),
  );

  const docsApp = read("apps/docs/src/App.tsx");
  const registry = json("docs/generated/documentation-registry.json");
  const docsPage = read("apps/docs/src/DocsPage.tsx");
  assert.match(docsApp, /matchReferenceRecordRoute/u);
  assert.match(docsApp, /getResolvedRouteById/u);
  assert(
    registry.pages.some(
      (page) =>
        page.id === "executable-examples" &&
        page.renderer === "executable-examples",
    ),
  );
  assert(registry.pages.some((page) => page.renderer === "example"));
  assert.match(docsPage, /MigratedExamplePage/u);
  assert.match(docsPage, /ExecutableExamplesPage/u);
});

test("G18 Docs shell retains responsive and accessible navigation foundations", () => {
  const docsShell = read("apps/docs/src/DocsShell.tsx");
  const docsNav = read("apps/docs/src/DocsNav.tsx");
  const responsiveStyles = read("apps/docs/src/styles/reference-shell.css");
  const portal = json("docs/metadata/reference-portal.json");

  assert.match(docsShell, /AppShell/u);
  assert.match(docsShell, /TopNav/u);
  assert.match(docsNav, /SearchInput/u);
  assert.match(docsNav, /SideNav/u);
  assert.match(responsiveStyles, /@media \(max-width: 920px\)/u);
  assert.match(responsiveStyles, /grid-template-columns: 1fr/u);
  assert.equal(
    portal.contentOwnership.accessibility.mode,
    "contract-plus-evidence-plus-curated-guidance",
  );
  assert(
    portal.contentOwnership.accessibility.canonicalSources.includes(
      "docs/metadata/cross-framework-accessibility-review.json",
    ),
  );
});

test("Reference generation and local Docs builds use one complete ordered contract", () => {
  const rootPackage = json("package.json");
  const scripts = rootPackage.scripts;

  assert.equal(
    scripts["generate:reference"],
    "npm run generate:framework-artifacts && npm run generate:component-presets-reference && npm run generate:component-reference && node scripts/generate-reference-model.mjs && node scripts/generate-documentation-registry.mjs",
  );
  assert.equal(
    scripts["verify:reference"],
    "npm run verify:generated-framework-artifacts && npm run verify:component-presets-reference && npm run verify:component-reference && node scripts/generate-reference-model.mjs --check && node scripts/generate-documentation-registry.mjs --check",
  );
  for (const command of ["build:docs", "dev:docs"]) {
    assert.match(scripts[command], /npm run verify:reference/u);
    assert.match(scripts[command], /@vyrnforge\/ui-data-grid/u);
    assert.match(scripts[command], /@vyrnforge\/ui-docs/u);
  }
  assert.match(scripts["verify:docs-quality"], /npm run verify:reference/u);
});

test("G18 CI and Pages deliver the single Docs product from exact main", () => {
  const ci = read(".github/workflows/ci.yml");
  const pages = read(".github/workflows/deploy-pages.yml");

  for (const marker of [
    "Run affected browser contracts",
    "Run packed four-surface generation smoke",
    "cross-framework-matrix/accessibility-report.json",
    "Build documentation application for reference preview",
    "Assemble immutable reference preview",
    "Verify generated Reference inputs for Pages",
    "npm run verify:reference",
    "Build documentation application for Pages",
    "Bind production reference artifact lineage",
    "Verify versioned Pages reference",
    "name: pages-site-${{ github.sha }}",
  ]) {
    assert(
      ci.includes(marker),
      `CI must retain Reference readiness responsibility: ${marker}`,
    );
  }
  assert.equal(ci.includes("Build playground for reference preview"), false);
  assert.equal(ci.includes("Build playground for Pages"), false);
  assert.equal(ci.includes("@vyrnforge/ui-data-grid-basic-playground"), false);

  for (const marker of [
    "branches:\n      - main",
    'CURRENT_MAIN_SHA="$(gh api "repos/$GITHUB_REPOSITORY/commits/main" --jq \'.sha\')"',
    'test "$HEAD_BRANCH" = "main"',
    'test "$HEAD_SHA" = "$CURRENT_MAIN_SHA"',
    "pages-site-${{ steps.candidate.outputs.head-sha }}",
    "Reference artifact commit does not match selected current-main commit.",
    "Reference artifact CI run does not match selected current-main run.",
  ]) {
    assert(
      pages.includes(marker),
      `Pages delivery must retain exact-main lineage guard: ${marker}`,
    );
  }
  assert.equal(pages.includes("site/playground/index.html"), false);
});
