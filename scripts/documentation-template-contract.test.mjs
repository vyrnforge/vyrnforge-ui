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

test("Docs rendering selects the page template from generated registry metadata", () => {
  const docsPage = readFileSync(
    path.join(root, "apps/docs/src/DocsPage.tsx"),
    "utf8",
  );
  const routes = readFileSync(
    path.join(root, "apps/docs/src/referenceRoutes.ts"),
    "utf8",
  );

  assert.match(docsPage, /getDocumentationTemplate\(route\.template\)/u);
  assert.match(docsPage, /<DocumentationPageTemplate/u);
  assert.match(routes, /template: page\.template/u);
  assert.doesNotMatch(docsPage, /route\.type\s*===\s*["']component["']/u);
});
