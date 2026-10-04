import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) =>
  readFileSync(path.join(root, relativePath), "utf8");

test("all public docs render through the unified Reference shell", () => {
  const app = read("apps/docs/src/App.tsx");
  const shell = read("apps/docs/src/ReferenceShell.tsx");
  const page = read("apps/docs/src/DocsPage.tsx");

  assert.match(app, /import \{ ReferenceShell \} from "\.\/ReferenceShell"/u);
  assert.doesNotMatch(app, /DocsShell|GuideShell/u);
  assert.match(shell, /<DocsPage/u);
  assert.match(shell, /data-reference-layout/u);
  assert.match(page, /AdvancedModulePage/u);
  assert.match(page, /ComponentReferencePage/u);
  assert.match(page, /PackageReferencePage/u);
  assert.match(page, /DiscoveryReferencePage/u);
  assert.match(page, /ExecutableExamplesPage/u);
});

test("Reference verification covers representative templates and adaptive states", () => {
  const browser = read("tests/reference-ui/reference-product.spec.ts");
  for (const route of [
    "overview",
    "getting-started",
    "component-reference",
    "package-reference",
    "token-reference",
    "pattern-reference",
    "executable-examples",
    "data-grid",
  ]) {
    assert.match(browser, new RegExp(`"${route}"`, "u"));
  }
  assert.match(browser, /Unavailable in this context/u);
  assert.match(browser, /Page not found/u);
  assert.match(browser, /390, height: 844/u);
  assert.match(browser, /Toggle dark theme/u);
  assert.match(browser, /toBeFocused/u);
  assert.match(browser, /expectNoPageOverflow/u);
  assert.match(browser, /expectReferenceHero/u);
  assert.match(browser, /vf-reference-page__hero/u);
  assert.match(browser, /expectComponentDirectoryReadable/u);
  assert.match(browser, /vf-docs-component-entry/u);
  assert.match(browser, /expectPackageCatalogReadable/u);
  assert.match(browser, /vf-docs-package-entry/u);
  assert.match(browser, /expectDiscoveryTilesReadable/u);
  assert.match(browser, /vf-docs-discovery-tile/u);
  assert.match(browser, /vf-docs-pattern-tile/u);
  assert.match(browser, /expectCodeBlockUsesBlockStyling/u);
  assert.match(browser, /backgroundColor/u);
  assert.match(browser, /vf-docs-code-block__language/u);
  assert.match(browser, /vf-docs-code-block__copy/u);
});

test("browser verification has a dedicated Reference server and evidence output", () => {
  assert.equal(
    existsSync(path.join(root, "playwright.reference.config.ts")),
    true,
  );
  const config = read("playwright.reference.config.ts");
  const browser = read("tests/reference-ui/reference-product.spec.ts");
  assert.match(config, /tests\/reference-ui/u);
  assert.match(config, /@vyrnforge\/ui-docs/u);
  assert.match(browser, /test-results\/reference-ui-evidence/u);
});
