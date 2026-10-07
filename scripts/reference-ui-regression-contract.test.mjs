import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";

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
  assert.match(browser, /expectComponentReferenceIsVisual/u);
  assert.match(browser, /vf-docs-component-showcase/u);
  assert.match(browser, /expectPackageReferenceExplainsArchitecture/u);
  assert.match(browser, /vf-docs-package-architecture/u);
  assert.match(browser, /expectTokenReferenceIsVisual/u);
  assert.match(browser, /vf-docs-token-gallery/u);
  assert.match(browser, /expectPatternReferenceIsLive/u);
  assert.match(browser, /vf-docs-live-example/u);
  assert.match(browser, /expectFrameworkExampleIsDeveloperFirst/u);
  assert.match(browser, /vf-docs-framework-example__concepts/u);
  assert.match(browser, /components\/button/u);
  assert.match(browser, /vf-docs-component-specimen/u);
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

test("emit temporary benchmark Prettier output", async () => {
  const config = (await resolveConfig(root)) ?? {};
  const files = [
    "apps/docs/src/styles/component-reference.css",
    "tests/reference-ui/component-reference-benchmark.spec.ts",
  ];

  for (const relativePath of files) {
    const formatted = await format(read(relativePath), {
      ...config,
      filepath: path.join(root, relativePath),
    });
    const encoded = Buffer.from(formatted).toString("base64");
    console.log(`BENCHMARK_PRETTIER:${relativePath}:${encoded}`);
  }
});
