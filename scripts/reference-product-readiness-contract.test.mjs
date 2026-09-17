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
  assert.equal(model.routing.transitionalRegistries.length, 0);

  for (const contextPath of [
    "apps/docs/src/docsContext.ts",
    "examples/basic-playground/src/app/playgroundContext.ts",
  ]) {
    const context = read(contextPath);
    assert.match(context, /generated\/reference-model\.json\?raw/u);
    assert.match(context, /reference\/referenceRuntime/u);
  }
});

test("G18 discovery, context, deep links, and executable examples remain generated or canonical", () => {
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
  const playgroundApp = read("examples/basic-playground/src/app/App.tsx");
  assert.match(docsApp, /matchReferenceRecordRoute/u);
  assert.match(docsApp, /getRouteById/u);
  assert.match(playgroundApp, /componentRouteAliases/u);
  assert.match(playgroundApp, /getExecutableExampleRouteForFramework/u);
});

test("G18 Reference shells retain responsive, keyboard, and accessibility foundations", () => {
  const docsShell = read("apps/docs/src/DocsShell.tsx");
  const docsNav = read("apps/docs/src/DocsNav.tsx");
  const playgroundShell = read(
    "examples/basic-playground/src/app/PlaygroundShell.tsx",
  );
  const playgroundNav = read(
    "examples/basic-playground/src/app/PlaygroundNav.tsx",
  );
  const responsiveStyles = read("apps/docs/src/styles/reference-shell.css");
  const portal = json("docs/metadata/reference-portal.json");

  for (const shell of [docsShell, playgroundShell]) {
    assert.match(shell, /AppShell/u);
    assert.match(shell, /TopNav/u);
  }
  for (const nav of [docsNav, playgroundNav]) {
    assert.match(nav, /SearchInput/u);
    assert.match(nav, /SideNav/u);
  }
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

test("G18 CI and Pages delivery require runtime evidence and exact-main artifact lineage", () => {
  const ci = read(".github/workflows/ci.yml");
  const pages = read(".github/workflows/deploy-pages.yml");

  for (const marker of [
    "Run affected browser contracts",
    "Run packed four-surface generation smoke",
    "cross-framework-matrix/accessibility-report.json",
    "Build documentation application for reference preview",
    "Build playground for reference preview",
    "Assemble immutable reference preview",
    "Build documentation application for Pages",
    "Build playground for Pages",
    "Bind production reference artifact lineage",
    "Verify versioned Pages reference",
    'name: pages-site-${{ github.sha }}',
  ]) {
    assert(
      ci.includes(marker),
      `CI must retain Reference readiness responsibility: ${marker}`,
    );
  }

  for (const marker of [
    'branches:\n      - main',
    'CURRENT_MAIN_SHA="$(gh api "repos/$GITHUB_REPOSITORY/commits/main" --jq \'.sha\')"',
    'test "$HEAD_BRANCH" = "main"',
    'test "$HEAD_SHA" = "$CURRENT_MAIN_SHA"',
    'pages-site-${{ steps.candidate.outputs.head-sha }}',
    "Reference artifact commit does not match selected current-main commit.",
    "Reference artifact CI run does not match selected current-main run.",
  ]) {
    assert(
      pages.includes(marker),
      `Pages delivery must retain exact-main lineage guard: ${marker}`,
    );
  }
});
