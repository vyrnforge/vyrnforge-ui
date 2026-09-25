import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

test("Docs consumes the generated Reference context as the single public reader", () => {
  const docsContext = read("apps/docs/src/docsContext.ts");
  assert.match(docsContext, /generated\/reference-model\.json\?raw/u);
  assert.match(docsContext, /reference\/referenceRuntime/u);
  assert.doesNotMatch(docsContext, /reference-portal\.json/u);
  assert.match(docsContext, /referenceModel\.frameworkContext\.default/u);
  assert.match(docsContext, /referenceModel\.versionContext\.catalog/u);
});

test("Docs preserves shared framework context in location and deep links", () => {
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

test("public Docs navigation owns the complete reader-facing information architecture", () => {
  const docsNav = read("apps/docs/src/DocsNav.tsx");
  const docsRoutes = read("apps/docs/src/referenceRoutes.ts");
  assert.match(docsNav, /publicDocsSections/u);
  assert.match(docsNav, /SearchInput/u);
  assert.match(docsNav, /SideNav/u);
  assert.match(docsNav, /VyrnForge documentation/u);
  assert.doesNotMatch(docsNav, /getReferenceNavigation/u);

  for (const section of [
    "Getting Started",
    "Components",
    "Foundations",
    "Patterns",
    "Data & Grid",
    "API / Packages",
    "Releases / Migration",
  ]) {
    assert.match(docsRoutes, new RegExp(`label: "${section}"`, "u"));
  }
  assert.doesNotMatch(docsRoutes, /import\.meta\.glob/u);
  assert.doesNotMatch(docsRoutes, /generated\/ai-context/u);
  assert.doesNotMatch(docsRoutes, /docs\/metadata\/\*\.json/u);
  assert.doesNotMatch(docsRoutes, /accessibility-reference/u);

});

test("Docs is the single reader-facing product and renders examples in-process", () => {
  const docsShell = read("apps/docs/src/DocsShell.tsx");
  const docsPage = read("apps/docs/src/DocsPage.tsx");
  const migratedExamples = read("apps/docs/src/examples/MigratedExamplePage.tsx");
  const executableExamples = read("apps/docs/src/examples/ExecutableExamplesPage.tsx");

  assert.match(docsShell, />\s*VyrnForge\s*</u);
  assert.doesNotMatch(docsShell, /referenceModel\.product\.label/u);
  assert.match(docsPage, /MigratedExamplePage/u);
  assert.match(docsPage, /ExecutableExamplesPage/u);
  assert.doesNotMatch(docsPage, /ReferencePreview/u);
  assert.match(migratedExamples, /vf-docs-example-stage/u);
  assert.match(executableExamples, /getExecutableExampleRecord/u);
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
    "component-accessibility-styling",
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
  assert.doesNotMatch(componentReference, /Model, form, and ref contracts/u);
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

test("component pages keep generated framework API while examples are native Docs routes", () => {
  const componentReference = read("apps/docs/src/ComponentReferencePage.tsx");
  const docsPage = read("apps/docs/src/DocsPage.tsx");
  const routes = read("apps/docs/src/referenceRoutes.ts");
  const docsStyles = read("apps/docs/src/styles/docs.css");

  assert.match(componentReference, /frameworkTabs\(component\.id\)/u);
  assert.match(componentReference, /FrameworkApiPanel/u);
  assert.match(docsPage, /MigratedExamplePage/u);
  assert.match(routes, /kind: "example"/u);
  assert.match(routes, /kind: "executable-examples"/u);
  assert.match(docsStyles, /\.vf-docs-example-stage/u);
  assert.doesNotMatch(docsStyles, /\.vf-docs-api-advanced/u);
});

test("Docs filter discovers selected-framework API members without restoring a standalone search page", () => {
  const app = read("apps/docs/src/App.tsx");
  const docsNav = read("apps/docs/src/DocsNav.tsx");
  const docsShell = read("apps/docs/src/DocsShell.tsx");
  const memberTarget = read("apps/docs/src/componentApiMember.ts");
  const retired = read("scripts/reference-drift-removal-contract.test.mjs");

  assert.match(docsNav, /generated\/framework-api-reference\.json\?raw/u);
  assert.match(docsNav, /buildApiMemberEntries/u);
  assert.match(docsNav, /section\.id === "components"/u);
  assert.match(docsNav, /\.slice\(0, 30\)/u);
  assert.match(docsNav, /componentReferenceTargetHref/u);
  assert.match(docsNav, /frameworkId/u);
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

  assert.match(retired, /ReferenceSearchPage\.tsx/u);
  assert.doesNotMatch(docsNav, /ReferenceSearchPage/u);
});
