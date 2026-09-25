import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

test("Docs consumes the generated Reference context", () => {
  const docsContext = read("apps/docs/src/docsContext.ts");
  assert.match(docsContext, /generated\/reference-model\.json\?raw/u);
  assert.match(docsContext, /reference\/referenceRuntime/u);
  assert.doesNotMatch(docsContext, /reference-portal\.json/u);
  assert.match(docsContext, /referenceModel\.frameworkContext\.default/u);
  assert.match(docsContext, /referenceModel\.versionContext\.catalog/u);
});

test("Docs preserves the shared framework context in location and deep links", () => {
  for (const relativePath of [
    "apps/docs/src/App.tsx",
    "apps/docs/src/componentApiMember.ts",
  ]) {
    assert.match(
      read(relativePath),
      /referenceModel\.frameworkContext\.queryParameter/u,
      `${relativePath} must use the shared framework query contract`,
    );
  }
});

test("public Docs navigation is curated as one product", () => {
  const docsNav = read("apps/docs/src/DocsNav.tsx");
  const docsRoutes = read("apps/docs/src/referenceRoutes.ts");
  const docsShell = read("apps/docs/src/DocsShell.tsx");

  assert.match(docsNav, /publicDocsSections/u);
  assert.match(docsNav, /SearchInput/u);
  assert.match(docsNav, /SideNav/u);
  assert.match(docsNav, /VyrnForge documentation/u);
  assert.doesNotMatch(docsNav, /getReferenceNavigation/u);

  for (const section of [
    "Start",
    "Components",
    "Foundations",
    "Guides & Patterns",
    "Data & Grid",
    "API & Releases",
  ]) {
    assert.match(docsRoutes, new RegExp(`label: "${section}"`, "u"));
  }

  assert.match(docsRoutes, /framework-examples/u);
  assert.match(docsRoutes, /grid-basic/u);
  assert.doesNotMatch(docsRoutes, /import\.meta\.glob/u);
  assert.doesNotMatch(docsRoutes, /generated\/ai-context/u);
  assert.doesNotMatch(docsRoutes, /docs\/metadata\/\*\.json/u);
  assert.doesNotMatch(docsRoutes, /accessibility-reference/u);
  assert.doesNotMatch(docsShell, /getPlaygroundHref|>\s*Examples\s*</u);
});

test("Docs uses one reader shell and component examples execute inside it", () => {
  const docsShell = read("apps/docs/src/DocsShell.tsx");
  const docsPage = read("apps/docs/src/DocsPage.tsx");
  const preview = read("apps/docs/src/ReferencePreview.tsx");

  assert.match(docsShell, />\s*VyrnForge\s*</u);
  assert.doesNotMatch(docsShell, /referenceModel\.product\.label/u);
  assert.match(docsPage, /ReferencePreview/u);
  assert.match(preview, /LiveSample/u);
  assert.match(preview, /Live in Docs/u);
  assert.doesNotMatch(
    preview,
    /<iframe|getEmbeddedPlaygroundHref|playgroundPath/u,
  );
});

test("shared runtime requires four framework surfaces and core Reference sections", () => {
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
    "component-accessibility-styling",
    "component-source-evidence",
    "api-properties",
    "api-events",
    "api-slots",
    "api-methods",
  ]) {
    assert.match(componentReference, new RegExp(`"${sectionId}"`, "u"));
  }

  assert.doesNotMatch(componentReference, /AI context slice/u);
  assert.doesNotMatch(componentReference, /AI usage notes/u);
  assert.doesNotMatch(componentReference, /Framework-neutral contract/u);
  assert.match(componentReference, /componentApiMemberAnchor\(\s*"property"/u);
  assert.match(componentReference, /componentApiMemberAnchor\(\s*"event"/u);
  assert.match(componentReference, /componentApiMemberAnchor\(\s*"slot"/u);
  assert.match(componentReference, /componentApiMemberAnchor\(\s*"method"/u);
  assert.match(componentReference, /componentReferenceTargetHref/u);
  assert.match(componentReference, /<table className="vf-docs-api-table">/u);
  assert.match(componentReference, /aria-label="On this component page"/u);
  assert.match(docsStyles, /\.vf-docs-reference-outline/u);
  assert.match(docsStyles, /\.vf-docs-api-table/u);
  assert.match(docsStyles, /tbody tr:target/u);
});

test("component preview pairs in-Docs behavior with generated framework code", () => {
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
  assert.match(preview, /Framework code/u);
  assert.match(referenceStyles, /\.vf-docs-preview__body/u);
  assert.match(referenceStyles, /\.vf-docs-preview__code-panel/u);
  assert.match(referenceStyles, /\.vf-docs-example-live-stage/u);
});

test("Docs filter discovers selected-framework API members", () => {
  const app = read("apps/docs/src/App.tsx");
  const docsNav = read("apps/docs/src/DocsNav.tsx");
  const docsShell = read("apps/docs/src/DocsShell.tsx");
  const memberTarget = read("apps/docs/src/componentApiMember.ts");

  assert.match(docsNav, /generated\/framework-api-reference\.json\?raw/u);
  assert.match(docsNav, /buildApiMemberEntries/u);
  assert.match(docsNav, /section\.id === "components"/u);
  assert.match(docsNav, /\.slice\(0, 30\)/u);
  assert.match(docsNav, /componentReferenceTargetHref/u);
  assert.match(docsShell, /frameworkId=\{framework\.id\}/u);
  assert.match(memberTarget, /componentApiMemberAnchor/u);
  assert.match(memberTarget, /componentReferenceTargetHref/u);
  assert.match(
    memberTarget,
    /referenceModel\.frameworkContext\.queryParameter/u,
  );
  assert.match(memberTarget, /getReferenceRecordRoute/u);
  assert.match(
    app,
    /new URLSearchParams\(window\.location\.search\)\.get\("member"\)/u,
  );
  assert.match(app, /document\.getElementById\(member\)\?\.scrollIntoView/u);
  assert.match(app, /query\.delete\("member"\)/u);
});
