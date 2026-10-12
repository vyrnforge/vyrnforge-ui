import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildDocumentationRegistry } from "./generate-documentation-registry.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("generated documentation templates cover every registered public page type", () => {
  const registry = buildDocumentationRegistry();
  const templates = new Map(
    registry.templates.map((template) => [template.id, template]),
  );

  assert.equal(registry.templates.length, 8);

  for (const page of registry.pages) {
    const template = templates.get(page.template);
    assert(
      template,
      `Missing generated template ${page.template} for ${page.id}`,
    );
    assert(
      template.documentTypes.includes(page.type),
      `Template ${template.id} does not own document type ${page.type}`,
    );
  }
});

test("component template preserves the standard documentation anatomy", () => {
  const registry = buildDocumentationRegistry();
  const component = registry.templates.find(
    (template) => template.id === "component",
  );

  assert(component);
  assert.deepEqual(component.sections, [
    "summary",
    "usage",
    "configuration",
    "behavior",
    "accessibility",
    "api",
    "styling",
    "related",
  ]);
});

test("Docs rendering selects generated templates and default page families", () => {
  const docsPage = readFileSync(
    path.join(root, "apps/docs/src/DocsPage.tsx"),
    "utf8",
  );
  const pageFamily = readFileSync(
    path.join(root, "apps/docs/src/documentationPageFamily.ts"),
    "utf8",
  );
  const routes = readFileSync(
    path.join(root, "apps/docs/src/referenceRoutes.ts"),
    "utf8",
  );

  assert.match(docsPage, /getDocumentationTemplate\(route\.template\)/u);
  assert.match(
    docsPage,
    /getDocumentationPageFamily\(route, referenceRecord\)/u,
  );
  assert.match(docsPage, /const usesStandardReadingPage =/u);
  assert.match(docsPage, /route\.kind === "overview"/u);
  assert.match(docsPage, /route\.kind === "markdown"/u);
  assert.match(docsPage, /route\.template !== "advanced-module"/u);
  assert.match(docsPage, /<GuidePage/u);
  assert.match(docsPage, /<DocumentationPageTemplate/u);
  assert.match(docsPage, /family=\{family\}/u);
  assert.match(pageFamily, /return "landing"/u);
  assert.match(pageFamily, /return "showcase"/u);
  assert.match(pageFamily, /\? "reference" : "catalog"/u);
  assert.match(pageFamily, /return "reading"/u);
  assert.match(routes, /template: page\.template/u);
  assert.doesNotMatch(docsPage, /route\.type\s*===\s*["']component["']/u);
});

test("shared families preserve rich landing and reading presentation", () => {
  const docsPage = readFileSync(
    path.join(root, "apps/docs/src/DocsPage.tsx"),
    "utf8",
  );
  const template = readFileSync(
    path.join(root, "apps/docs/src/DocumentationPageTemplate.tsx"),
    "utf8",
  );
  const guidePage = readFileSync(
    path.join(root, "apps/docs/src/GuidePage.tsx"),
    "utf8",
  );
  const contentStyles = readFileSync(
    path.join(root, "apps/docs/src/styles/content-pages.css"),
    "utf8",
  );
  const appShell = readFileSync(
    path.join(root, "apps/docs/src/DocumentationAppShell.tsx"),
    "utf8",
  );
  const referenceShell = readFileSync(
    path.join(root, "apps/docs/src/ReferenceShell.tsx"),
    "utf8",
  );
  const main = readFileSync(path.join(root, "apps/docs/src/main.tsx"), "utf8");

  assert.match(docsPage, /Build once\. Stay native to every framework\./u);
  assert.match(docsPage, /Start building/u);
  assert.match(docsPage, /Browse components/u);
  assert.match(docsPage, /Selected surface/u);
  assert.match(docsPage, /Reading for/u);
  assert.match(docsPage, /onFrameworkChange\(candidate\.id\)/u);
  assert.match(template, /heroActions\?: ReactNode/u);
  assert.match(template, /heroAside\?: ReactNode/u);
  assert.match(template, /vf-reference-page__hero-layout/u);
  assert.match(template, /data-page-family=\{family\}/u);
  assert.match(guidePage, /splitGuideSections/u);
  assert.match(guidePage, /aria-label="On this page"/u);
  assert.match(guidePage, /vf-docs-reading-outline__step/u);
  assert.match(guidePage, /vf-docs-reading-section__step/u);
  assert.match(guidePage, /String\(index \+ 1\)\.padStart\(2, "0"\)/u);
  assert.match(contentStyles, /vf-docs-framework-context/u);
  assert.match(contentStyles, /grid-template-columns: repeat\(4,/u);
  assert.match(contentStyles, /vf-docs-reading-section__heading/u);
  assert.match(appShell, /className="vf-docs-app-shell"/u);
  assert.match(referenceShell, /<DocumentationAppShell/u);
  assert.match(referenceShell, /<DocsPage/u);
  assert.doesNotMatch(referenceShell, /GuideShell|DocsShell|DocsNav/u);
  assert.equal(main.includes("styles/content-pages.css"), true);
  assert.equal(main.includes("styles/docs-overview.css"), false);
  assert.doesNotMatch(docsPage, /OverviewPage/u);
  assert.doesNotMatch(guidePage, /data-document-template=/u);
});
