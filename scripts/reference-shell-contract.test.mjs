import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

test("Docs and Playground consume one generated Reference context", () => {
  const docsContext = read("apps/docs/src/docsContext.ts");
  const playgroundContext = read(
    "examples/basic-playground/src/app/playgroundContext.ts",
  );

  for (const source of [docsContext, playgroundContext]) {
    assert.match(source, /generated\/reference-model\.json\?raw/u);
    assert.match(source, /reference\/referenceRuntime/u);
    assert.doesNotMatch(source, /reference-portal\.json/u);
    assert.match(source, /referenceModel\.frameworkContext\.default/u);
    assert.match(source, /referenceModel\.versionContext\.catalog/u);
  }
});

test("both apps preserve shared framework context in location and Reference links", () => {
  for (const relativePath of [
    "apps/docs/src/App.tsx",
    "apps/docs/src/deploymentLinks.ts",
    "examples/basic-playground/src/app/App.tsx",
    "examples/basic-playground/src/app/deploymentLinks.ts",
  ]) {
    assert.match(
      read(relativePath),
      /referenceModel\.frameworkContext\.queryParameter/u,
      `${relativePath} must use the shared framework query contract`,
    );
  }
});

test("both navigation surfaces use generated Reference IA and searchable VyrnForge primitives", () => {
  for (const relativePath of [
    "apps/docs/src/DocsNav.tsx",
    "examples/basic-playground/src/app/PlaygroundNav.tsx",
  ]) {
    const source = read(relativePath);
    assert.match(source, /getReferenceNavigation/u);
    assert.match(source, /SearchInput/u);
    assert.match(source, /SideNav/u);
    assert.match(source, /VyrnForge Reference sections/u);
  }
});

test("Reference presents one product identity with embedded executable component previews", () => {
  const docsShell = read("apps/docs/src/DocsShell.tsx");
  const docsPage = read("apps/docs/src/DocsPage.tsx");
  const preview = read("apps/docs/src/ReferencePreview.tsx");
  const playgroundApp = read("examples/basic-playground/src/app/App.tsx");
  const playgroundShell = read(
    "examples/basic-playground/src/app/PlaygroundShell.tsx",
  );

  for (const source of [docsShell, playgroundShell]) {
    assert.match(source, /referenceModel\.product\.label/u);
  }

  assert.match(docsPage, /ReferencePreview/u);
  assert.match(preview, /getEmbeddedPlaygroundHref/u);
  assert.match(preview, /component\.playgroundPath/u);
  assert.match(playgroundApp, /embed/u);
  assert.match(playgroundApp, /reference/u);
  assert.match(playgroundShell, /embedded/u);
  assert.match(playgroundShell, /vf-playground-embed/u);
  assert.doesNotMatch(docsShell, /Playground mode/u);
  assert.doesNotMatch(playgroundShell, /Docs mode/u);
});

test("shared runtime requires four framework surfaces and four Reference sections", () => {
  const runtime = read("docs/reference/referenceRuntime.ts");
  for (const frameworkId of ["native-html", "react", "angular", "vue"]) {
    assert.match(runtime, new RegExp(`"${frameworkId}"`, "u"));
  }
  for (const sectionId of ["start", "components", "foundations", "examples"]) {
    assert.match(runtime, new RegExp(`"${sectionId}"`, "u"));
  }
  assert.match(runtime, /preserveContext\.includes\("framework"\)/u);
});

test("component Reference exposes structured, linkable member API navigation", () => {
  const componentReference = read("apps/docs/src/ComponentReferencePage.tsx");
  const docsStyles = read("apps/docs/src/styles/docs.css");

  for (const sectionId of [
    "component-overview",
    "component-usage",
    "component-framework-api",
    "component-contract",
    "component-accessibility-styling",
    "api-properties",
    "api-events",
    "api-slots",
    "api-methods",
  ]) {
    assert.match(componentReference, new RegExp(`"${sectionId}"`, "u"));
  }

  assert.match(componentReference, /memberAnchor\("property"/u);
  assert.match(componentReference, /memberAnchor\("event"/u);
  assert.match(componentReference, /memberAnchor\("slot"/u);
  assert.match(componentReference, /memberAnchor\("method"/u);
  assert.match(componentReference, /<table className="vf-docs-api-table">/u);
  assert.match(componentReference, /aria-label="On this component page"/u);
  assert.match(docsStyles, /\.vf-docs-reference-outline/u);
  assert.match(docsStyles, /\.vf-docs-api-table/u);
  assert.match(docsStyles, /tbody tr:target/u);
});

test("component preview pairs executable behavior with generated framework consumption code", () => {
  const preview = read("apps/docs/src/ReferencePreview.tsx");
  const referenceData = read("apps/docs/src/referenceData.ts");
  const referenceStyles = read("apps/docs/src/styles/reference-shell.css");

  assert.match(
    referenceData,
    /frameworks: Record<ReferenceFrameworkId, ReferenceFrameworkUsage>/u,
  );
  assert.match(preview, /component\.frameworks\[frameworkId\]/u);
  assert.match(preview, /FrameworkCode/u);
  assert.match(preview, /usage\.setup/u);
  assert.match(preview, /usage\.example/u);
  assert.match(preview, /Selected framework/u);
  assert.match(preview, /generated selected-framework/u);
  assert.match(referenceStyles, /\.vf-docs-preview__body/u);
  assert.match(referenceStyles, /\.vf-docs-preview__code-panel/u);
  assert.match(referenceStyles, /\.vf-docs-preview__code/u);
});

test(
  "Reference search indexes generated framework API members with router-safe deep links",
  () => {
  const app = read("apps/docs/src/App.tsx");
  const search = read("apps/docs/src/ReferenceSearchPage.tsx");

  assert.match(search, /generated\/framework-api-reference\.json\?raw/u);
  assert.match(search, /buildApiMemberEntries/u);
  assert.match(search, /memberAnchor\("property"/u);
  assert.match(search, /memberAnchor\("event"/u);
  assert.match(search, /memberAnchor\("slot"/u);
  assert.match(search, /memberAnchor\("method"/u);
  assert.match(search, /\?member=\$\{encodeURIComponent\(member\)\}/u);
  assert.match(search, /referenceModel\.frameworkContext\.queryParameter/u);

  assert.match(app, /new URLSearchParams\(query\)\.get\("member"\)/u);
  assert.match(
    app,
    /document\.getElementById\(member\)\?\.scrollIntoView/u,
  );
  assert.match(app, /a\[href\^="#api-"\]/u);
  assert.match(
    app,
    /getReferenceRecordRoute\([\s\S]*"components"[\s\S]*selection\.id/u,
  );
  },
);
