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
  const dedicatedPages = read("apps/docs/src/DedicatedReferencePages.tsx");

  assert.match(app, /import \{ ReferenceShell \} from "\.\/ReferenceShell"/u);
  assert.doesNotMatch(app, /DocsShell|GuideShell/u);
  assert.match(shell, /<DocsPage/u);
  assert.match(shell, /data-reference-layout/u);
  assert.match(page, /AdvancedModulePage/u);
  assert.match(page, /ComponentReferencePage/u);
  assert.match(page, /PackageReferencePage/u);
  assert.match(page, /DiscoveryReferencePage/u);
  assert.match(page, /ExecutableExamplesPage/u);
  assert.match(page, /getDedicatedReferencePage/u);
  assert.doesNotMatch(page, /IconReferencePage/u);
  assert.match(dedicatedPages, /IconReferencePage/u);
});

test("Icons has one canonical generated route and renderer", () => {
  const registry = JSON.parse(
    read("docs/generated/documentation-registry.json"),
  );
  const iconsRoutes = registry.pages.filter(
    (page) => page.id === "icons" || page.route === "/icons",
  );

  assert.equal(iconsRoutes.length, 1);
  assert.equal(iconsRoutes[0].id, "icons");
  assert.equal(iconsRoutes[0].route, "/icons");
  assert.equal(iconsRoutes[0].renderer, "icon-reference");
  assert.equal(iconsRoutes[0].sourcePath, "packages/ui-core/src/icons.ts");
});

test("dedicated Reference pages override general presentation", () => {
  const policy = read("apps/docs/src/dedicatedReferencePagePolicy.ts");
  const bindings = read("apps/docs/src/DedicatedReferencePages.tsx");
  const referenceData = read("apps/docs/src/referenceData.ts");
  const app = read("apps/docs/src/App.tsx");
  const shell = read("apps/docs/src/ReferenceShell.tsx");
  const browser = read("tests/reference-ui/icon-reference.spec.ts");
  const components = JSON.parse(read("docs/metadata/components.json"));

  assert(
    components.components.some(
      (component) => component.id === "icon" && component.publicExport === true,
    ),
    "Icon must remain canonical component/API truth.",
  );
  assert.match(policy, /routeId: "icons"/u);
  assert.match(policy, /renderer: "icon-reference"/u);
  assert.match(policy, /layoutMode: "catalog"/u);
  assert.match(
    policy,
    /replacesRecords: \[\{ domain: "components", id: "icon" \}\]/u,
  );
  assert.match(bindings, /routeId: "icons"/u);
  assert.match(bindings, /IconReferencePage/u);
  assert.match(referenceData, /excludeDedicatedReferenceRecords/u);
  assert.match(app, /getDedicatedReferencePagePolicyForRecord/u);
  assert.match(shell, /getDedicatedReferencePagePolicy/u);
  assert.match(browser, /components\/icon/u);
  assert.match(browser, /toHaveCount\(0\)/u);
  assert.match(browser, /toHaveURL/u);
  assert.match(browser, /framework=react/u);
});

test("Reference page navigation exposes canonical hash hrefs", () => {
  const navigation = read("apps/docs/src/ReferenceNavigation.tsx");
  const iconBrowser = read("tests/reference-ui/icon-reference.spec.ts");
  const browserConfig = read("playwright.reference.config.ts");

  assert.match(
    navigation,
    /href: getReferenceLocationHref\(referenceModel, \{\s*frameworkId,\s*pathname: route\.route,\s*member: null,/u,
  );
  assert.match(iconBrowser, /getByRole\("link", \{ name: "Icons"/u);
  assert.match(
    iconBrowser,
    /toHaveAttribute\("href", "\?framework=react#\/icons"\)/u,
  );
  assert.match(iconBrowser, /\/vyrnforge-ui\//u);
  assert.match(
    iconBrowser,
    /getByRole\("combobox", \{ name: "Framework" \}\)/u,
  );
  assert.match(browserConfig, /--base \/vyrnforge-ui\//u);
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
