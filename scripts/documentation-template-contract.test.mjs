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
      `Template ${page.template} does not own document type ${page.type}`,
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

test("shared page shell owns chrome while reading content owns document navigation", () => {
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
  const referenceShell = readFileSync(
    path.join(root, "apps/docs/src/ReferenceShell.tsx"),
    "utf8",
  );
  const main = readFileSync(path.join(root, "apps/docs/src/main.tsx"), "utf8");

  assert.match(docsPage, /const usesStandardReadingPage =/u);
  assert.match(docsPage, /<GuidePage/u);
  assert.match(template, /data-page-family=\{family\}/u);
  assert.match(template, /aria-label="Reference page introduction"/u);
  assert.match(template, /<PageHeader/u);
  assert.match(guidePage, /splitGuideSections/u);
  assert.match(guidePage, /aria-label="On this page"/u);
  assert.match(guidePage, /className="vf-docs-reading-layout"/u);
  assert.match(guidePage, /className="vf-docs-reading-prose"/u);
  assert.match(guidePage, /Run framework examples/u);
  assert.doesNotMatch(guidePage, /data-document-template=/u);
  assert.doesNotMatch(guidePage, /Framework surface/u);
  assert.match(referenceShell, /className="vf-reference-shell"/u);
  assert.match(referenceShell, /<DocsPage/u);
  assert.doesNotMatch(referenceShell, /GuideShell|DocsShell|DocsNav/u);
  assert.equal(main.includes("styles/content-pages.css"), true);
  assert.equal(main.includes("styles/docs-overview.css"), false);
  assert.doesNotMatch(docsPage, /OverviewPage/u);
});
