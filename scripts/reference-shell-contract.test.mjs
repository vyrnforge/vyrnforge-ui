import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { retiredReferencePaths } from "./reference-retired-paths.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function json(relativePath) {
  return JSON.parse(read(relativePath));
}

test("Docs consumes the generated Reference context as the single public reader", () => {
  const docsContext = read("apps/docs/src/docsContext.ts");
  assert.match(docsContext, /generated\/reference-model\.json\?raw/u);
  assert.match(docsContext, /reference\/referenceRuntime/u);
  assert.doesNotMatch(docsContext, /reference-portal\.json/u);
  assert.match(docsContext, /referenceModel\.frameworkContext\.default/u);
  assert.match(docsContext, /referenceModel\.versionContext\.catalog/u);
});

test("Docs preserves shared framework and document context through one route authority", () => {
  const runtime = read("docs/reference/referenceRuntime.ts");
  const app = read("apps/docs/src/App.tsx");
  const memberTarget = read("apps/docs/src/componentApiMember.ts");
  const docsContext = read("apps/docs/src/docsContext.ts");

  assert.match(runtime, /getReferenceLocationContext/u);
  assert.match(runtime, /getReferenceLocationHref/u);
  assert.match(runtime, /frameworkContext\.queryParameter/u);
  assert.match(app, /getReferenceLocationContext/u);
  assert.match(app, /getReferenceLocationHref/u);
  assert.match(memberTarget, /getReferenceLocationHref/u);
  assert.match(docsContext, /getReferenceLocationHref/u);
});

test("public Docs navigation owns the complete reader-facing information architecture", () => {
  const docsNav = read("apps/docs/src/ReferenceNavigation.tsx");
  const docsRoutes = read("apps/docs/src/referenceRoutes.ts");
  const registry = json("docs/generated/documentation-registry.json");

  assert.match(docsNav, /publicDocsSections/u);
  assert.match(docsNav, /SearchInput/u);
  assert.match(docsNav, /SideNav/u);
  assert.match(docsNav, /VyrnForge Reference/u);
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
    assert(registry.sections.some((entry) => entry.label === section));
  }

  assert.match(docsRoutes, /generated\/documentation-registry\.json\?raw/u);
  assert.match(docsRoutes, /registry\.sections\.map/u);
  assert.match(docsRoutes, /registry\.pages\.map/u);
  assert.doesNotMatch(docsRoutes, /generated\/ai-context/u);
  assert.doesNotMatch(docsRoutes, /docs\/metadata\/\*\.json/u);
  assert.doesNotMatch(docsRoutes, /accessibility-reference/u);
});

test("Docs is the single reader-facing product and renders examples in-process", () => {
  const referenceShell = read("apps/docs/src/ReferenceShell.tsx");
  const docsPage = read("apps/docs/src/DocsPage.tsx");
  const migratedExamples = read(
    "apps/docs/src/examples/MigratedExamplePage.tsx",
  );
  const executableExamples = read(
    "apps/docs/src/examples/ExecutableExamplesPage.tsx",
  );

  assert.match(referenceShell, />\s*VyrnForge\s*</u);
  assert.doesNotMatch(referenceShell, /referenceModel\.product\.label/u);
  assert.match(docsPage, /MigratedExamplePage/u);
  assert.match(docsPage, /ExecutableExamplesPage/u);
  assert.doesNotMatch(docsPage, /ReferencePreview/u);
  assert.match(migratedExamples, /vf-docs-example-stage/u);
  assert.match(executableExamples, /getExecutableExampleRecord/u);
  assert.match(executableExamples, /frameworkGuidance/u);
  assert.match(executableExamples, /vf-docs-framework-example__concepts/u);
  assert.match(
    executableExamples,
    /Consume VyrnForge the way this framework expects/u,
  );
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

test("component pages bind generated API to the selected framework and version", () => {
  const componentReference = read("apps/docs/src/ComponentReferencePage.tsx");
  const docsPage = read("apps/docs/src/DocsPage.tsx");
  const referenceShell = read("apps/docs/src/ReferenceShell.tsx");
  const routes = read("apps/docs/src/referenceRoutes.ts");
  const registry = json("docs/generated/documentation-registry.json");
  const docsStyles = read("apps/docs/src/styles/docs.css");

  assert.match(componentReference, /frameworkApiReferenceRaw/u);
  assert.match(componentReference, /framework\?\.apiSurface/u);
  assert.match(componentReference, /contextualApi/u);
  assert.match(componentReference, /version: string/u);
  assert.doesNotMatch(componentReference, /frameworkTabs/u);
  assert.doesNotMatch(componentReference, /<Tabs/u);
  assert.match(docsPage, /version=\{version\}/u);
  assert.match(referenceShell, /version=\{docsVersion\.version\}/u);
  assert.match(componentReference, /FrameworkApiPanel/u);
  assert.match(docsPage, /MigratedExamplePage/u);
  assert(registry.pages.some((page) => page.renderer === "example"));
  assert(
    registry.pages.some((page) => page.renderer === "executable-examples"),
  );
  assert.match(routes, /kind: page\.renderer/u);
  assert.match(docsStyles, /\.vf-docs-example-stage/u);
  assert.doesNotMatch(docsStyles, /\.vf-docs-api-advanced/u);
});

test("Docs filter discovers selected-framework API members without restoring a standalone search page", () => {
  const app = read("apps/docs/src/App.tsx");
  const docsNav = read("apps/docs/src/ReferenceNavigation.tsx");
  const referenceShell = read("apps/docs/src/ReferenceShell.tsx");
  const memberTarget = read("apps/docs/src/componentApiMember.ts");

  assert.match(docsNav, /documentationSearchRecords/u);
  assert.match(docsNav, /routeIsAvailable/u);
  assert.match(docsNav, /section\.id === "components"/u);
  assert.match(docsNav, /\.slice\(0, 30\)/u);
  assert.match(docsNav, /getReferenceLocationHref/u);
  assert.match(docsNav, /frameworkId/u);
  assert.match(docsNav, /version/u);
  assert.doesNotMatch(
    docsNav,
    /generated\/framework-api-reference\.json\?raw/u,
  );
  assert.doesNotMatch(docsNav, /componentReferenceRecords/u);
  assert.match(referenceShell, /frameworkId=\{framework\.id\}/u);

  assert.match(memberTarget, /componentApiMemberAnchor/u);
  assert.match(memberTarget, /componentReferenceTargetHref/u);
  assert.match(memberTarget, /getReferenceLocationHref/u);
  assert.match(memberTarget, /getReferenceRecordRoute/u);

  assert.match(app, /getReferenceLocationContext/u);
  assert.match(app, /const memberTarget = member/u);
  assert.match(app, /member: null/u);

  assert(
    retiredReferencePaths.includes("apps/docs/src/ReferenceSearchPage.tsx"),
  );
  assert.doesNotMatch(docsNav, /ReferenceSearchPage/u);
});

test("all public routes use one unified Reference shell with controlled layouts", () => {
  const app = read("apps/docs/src/App.tsx");
  const shell = read("apps/docs/src/ReferenceShell.tsx");
  const docsPage = read("apps/docs/src/DocsPage.tsx");
  const navigation = read("apps/docs/src/ReferenceNavigation.tsx");
  const styles = read("apps/docs/src/styles/reference-shell.css");

  assert.match(app, /import \{ ReferenceShell \} from "\.\/ReferenceShell"/u);
  assert.match(app, /<ReferenceShell/u);
  assert.doesNotMatch(app, /DocsShell|GuideShell/u);
  assert.doesNotMatch(shell, /DocsShell|GuideShell|DocsNav/u);

  for (const retiredPath of [
    "apps/docs/src/DocsShell.tsx",
    "apps/docs/src/GuideShell.tsx",
    "apps/docs/src/DocsNav.tsx",
  ]) {
    assert(retiredReferencePaths.includes(retiredPath));
  }

  const advancedModulePage = read("apps/docs/src/AdvancedModulePage.tsx");
  assert.match(docsPage, /AdvancedModulePage/u);
  assert.match(advancedModulePage, /docsRoutes/u);
  assert.match(advancedModulePage, /isDocumentationReady/u);
  assert.doesNotMatch(advancedModulePage, /DataGridShell|GridDocsShell/u);
  assert.doesNotMatch(shell, /DocsNav/u);
  assert.match(shell, /ReferenceNavigation/u);
  assert.match(shell, /Drawer/u);
  assert.match(shell, /Skip to content/u);
  assert.match(shell, /data-reference-layout=\{layoutMode\}/u);

  for (const mode of ["reading", "reference", "catalog", "example", "wide"]) {
    assert.match(shell, new RegExp(`"${mode}"`, "u"));
    assert.match(styles, new RegExp(`data-reference-layout="${mode}"`, "u"));
  }

  assert.match(navigation, /documentationSearchRecords/u);
  assert.match(navigation, /publicDocsSections/u);
  assert.match(navigation, /getReferenceLocationHref/u);
});

test("Reference navigation stays registry-driven and route changes restore reading focus", () => {
  const app = read("apps/docs/src/App.tsx");
  const navigation = read("apps/docs/src/ReferenceNavigation.tsx");
  const shell = read("apps/docs/src/ReferenceShell.tsx");

  assert.match(navigation, /ReferencePrimaryNavigation/u);
  assert.match(navigation, /publicDocsSections/u);
  assert.match(navigation, /documentationSearchRecords/u);
  assert.match(navigation, /Search VyrnForge Reference/u);
  assert.match(navigation, /aria-live="polite"/u);
  assert.match(shell, /ReferencePrimaryNavigation/u);
  assert.match(shell, /Drawer/u);
  assert.match(
    app,
    /getElementById\(\s*"vf-reference-main"\s*\)\s*\?\.\s*focus/u,
  );
  assert.match(app, /VyrnForge Reference/u);
});

test("reading templates use the unified main landmark and source-driven deep links", () => {
  const template = read("apps/docs/src/DocumentationPageTemplate.tsx");
  const guide = read("apps/docs/src/GuidePage.tsx");
  const markdown = read("apps/docs/src/MarkdownView.tsx");
  const styles = read("apps/docs/src/styles/docs.css");

  assert.doesNotMatch(template, /<main/u);
  assert.doesNotMatch(guide, /<main/u);
  assert.doesNotMatch(template, /vf-docs-page(?:__intro)?/u);
  assert.match(template, /vf-reference-page__hero/u);
  assert.match(template, /vf-reference-page__eyebrow/u);
  assert.doesNotMatch(styles, /\.vf-docs-page__intro/u);
  assert.match(markdown, /vf-docs-markdown__heading-link/u);
  assert.match(markdown, /headingId/u);
  assert.match(styles, /max-width: 78ch/u);
  assert.doesNotMatch(
    styles,
    /\.vf-docs-markdown,\s*\.vf-docs-reference\s*\{[^}]*border:/su,
  );
});

test("component reference leads with real VyrnForge specimens before generated contracts", () => {
  const componentReference = read("apps/docs/src/ComponentReferencePage.tsx");
  const gallery = read("apps/docs/src/ReferenceComponentGallery.tsx");
  const specimen = read("apps/docs/src/ReferenceComponentSpecimen.tsx");
  const styles = read("apps/docs/src/styles/reference-shell.css");

  assert.doesNotMatch(
    componentReference,
    /\bCard\b|ComponentIndexCard|vf-docs-reference-card/u,
  );
  assert.match(componentReference, /ReferenceComponentGallery/u);
  assert.match(componentReference, /ReferenceComponentSpecimen/u);
  assert.match(gallery, /@vyrnforge\/ui-components/u);
  assert.match(gallery, /vf-docs-component-showcase__stage/u);
  assert.match(specimen, /vf-docs-component-specimen__stage/u);
  assert.match(componentReference, /ComponentIndexRow/u);
  assert.match(componentReference, /vf-docs-catalog__jump-nav/u);
  assert.match(componentReference, /vf-docs-component-group/u);
  assert.match(componentReference, /vf-docs-component-entry/u);
  assert.match(componentReference, /vf-docs-api-table/u);
  assert.match(componentReference, /componentApiMemberAnchor/u);
  assert.match(styles, /\.vf-docs-component-entry/u);
  assert.match(styles, /\.vf-docs-component-index/u);
  assert.match(styles, /\.vf-docs-api-table thead th/u);
});

test("package, token, and pattern discovery lead with architecture and live visual evidence", () => {
  const packageReference = read("apps/docs/src/PackageReferencePage.tsx");
  const discovery = read("apps/docs/src/DiscoveryReferencePage.tsx");
  const tokenGallery = read("apps/docs/src/ReferenceTokenGallery.tsx");
  const liveExample = read("apps/docs/src/ReferenceLiveExample.tsx");
  const styles = read("apps/docs/src/styles/reference-shell.css");

  assert.doesNotMatch(
    packageReference,
    /\bCard\b|PackageIndexCard|vf-docs-package-card/u,
  );
  assert.doesNotMatch(discovery, /\bCard\b|vf-docs-discovery-row-card/u);
  assert.match(packageReference, /PackageArchitecture/u);
  assert.match(packageReference, /vf-docs-package-architecture/u);
  assert.match(packageReference, /PackageIndexRow/u);
  assert.match(discovery, /ReferenceTokenGallery/u);
  assert.match(discovery, /ReferenceLiveExample/u);
  assert.match(tokenGallery, /vf-docs-token-swatch/u);
  assert.match(tokenGallery, /vf-docs-token-type-specimen/u);
  assert.match(tokenGallery, /vf-docs-token-density-specimen/u);
  assert.match(liveExample, /vf-docs-live-example__stage/u);
  assert.match(styles, /\.vf-docs-package-architecture/u);
  assert.match(styles, /\.vf-docs-token-gallery/u);
  assert.match(styles, /\.vf-docs-live-example/u);
  assert.match(styles, /\.vf-docs-catalog__intro/u);
  assert.doesNotMatch(styles, /\.vf-docs-preview(?:__|\s*\{)/u);
  assert.match(packageReference, /getReferenceRecordRoute/u);
  assert.match(discovery, /getReferenceRecordRoute/u);
});

test("Reference non-happy paths use explicit VyrnForge state patterns", () => {
  const app = read("apps/docs/src/App.tsx");
  const docsPage = read("apps/docs/src/DocsPage.tsx");
  const components = read("apps/docs/src/ComponentReferencePage.tsx");
  const packages = read("apps/docs/src/PackageReferencePage.tsx");
  const discovery = read("apps/docs/src/DiscoveryReferencePage.tsx");
  const routes = read("apps/docs/src/referenceRoutes.ts");

  assert.match(routes, /findRouteById/u);
  assert.match(app, /invalidPath/u);
  assert.match(docsPage, /title="Page not found"/u);
  assert.match(docsPage, /title="Unavailable in this context"/u);
  for (const source of [docsPage, components, packages, discovery]) {
    assert.match(source, /EmptyState/u);
  }
  assert.doesNotMatch(
    components,
    /<Heading[^>]*>\s*Component not found\s*<\/Heading>/su,
  );
  assert.doesNotMatch(
    packages,
    /<Heading[^>]*>\s*Package not found\s*<\/Heading>/su,
  );
});
