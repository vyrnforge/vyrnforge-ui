import { existsSync, readFileSync } from 'node:fs';
import axeCore from 'axe-core';
import { test, expect } from '@playwright/test';
import { compileNativeDocumentation } from '../../../../tooling/docs/native-documentation.mjs';
import { deriveAccessibilityReferences } from '../../../../tooling/docs/standard-references.mjs';

const manifest = JSON.parse(readFileSync('dist/docs/next/site-manifest.json', 'utf8'));

async function expectNoAccessibilityViolations(page) {
  await page.addScriptTag({ content: axeCore.source });
  const results = await page.evaluate(async () => window.axe.run(document, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
    }
  }));
  expect(results.violations, results.violations.map((item) => `${item.id}: ${item.help}`).join('\n')).toEqual([]);
}

function collectPageErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

async function gotoWithCleanDocsState(page, route) {
  await page.goto(route);
  await page.evaluate(() => localStorage.removeItem('vf-docs-theme'));
  await page.reload();
}

async function expectDeploymentRelativeStyles(page) {
  const styleHrefs = await page.locator('link[rel="stylesheet"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(styleHrefs.length).toBeGreaterThan(0);
  for (const href of styleHrefs) {
    expect(href, 'stylesheet URL must remain inside the deployed docs base path').toBeTruthy();
    expect(href.startsWith('/'), `stylesheet URL must be deployment-relative: ${href}`).toBe(false);
    const response = await page.request.get(new URL(href, page.url()).href);
    expect(response.ok(), `stylesheet must resolve: ${href}`).toBe(true);
  }
  return styleHrefs;
}

function catalogEntry(slug, title) {
  const entry = manifest.componentCatalog.find((component) => component.slug === slug);
  expect(entry, `${title} must be present in the Native Web Product Graph catalog`).toBeTruthy();
  return entry;
}

function buttonCatalogEntry() {
  return catalogEntry('button', 'Button');
}


function loadingPatternEntry() {
  const entry = manifest.patternCatalog?.find((pattern) => pattern.slug === 'loading');
  expect(entry, 'Loading must be present in the Native Web Pattern catalog').toBeTruthy();
  return entry;
}

test('Every emitted Native Web guide uses canonical Flow and AutoGrid layout hooks', () => {
  expect(manifest.pages.length).toBeGreaterThan(0);
  for (const guide of manifest.pages) {
    const html = readFileSync('dist/docs/next/native-web/' + guide.slug + 'index.html', 'utf8');
    expect(html, guide.slug + ' must compose native semantic article with Flow')
      .toContain('class="vf-docs-article" data-vf-flow data-vf-flow-gap="3xl"');
    expect(html, guide.slug + ' must use Flow for evidence rhythm')
      .toContain('class="vf-docs-standards" data-vf-flow data-vf-flow-gap="sm"');
    expect(html, guide.slug + ' must use Flow for standards links')
      .toContain('class="vf-docs-standards-primary" data-vf-flow');
    if (guide.kind !== 'pattern') {
      expect(html, guide.slug + ' must use Flow for example headers')
        .toContain('class="vf-docs-example-header" data-vf-flow');
      expect(html, guide.slug + ' must use Flow for its TOC')
        .toContain('<ol data-vf-flow data-vf-flow-gap="xs">');
    }
  }
  for (const foundation of manifest.foundations) {
    const html = readFileSync('dist/docs/next/native-web/' + foundation.slug + 'index.html', 'utf8');
    expect(html).toContain('class="vf-docs-article" data-vf-flow data-vf-flow-gap="3xl"');
  }
});

test('Native Web home uses the VyrnForge shell and separates documentation surfaces', async ({ page }, testInfo) => {
  const errors = collectPageErrors(page);
  await gotoWithCleanDocsState(page, '/next/native-web/');

  await expect(page.getByRole('heading', { level: 1, name: 'VyrnForge Native Web' })).toBeVisible();
  await expect(page.locator('[data-vf-app-shell]')).toHaveCount(1);
  await expect(page.locator('[data-vf-side-nav]')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Browse all', exact: true })).toHaveAttribute('href', 'components/');
  const explore = page.getByRole('link', { name: 'Browse components', exact: true });
  await expect(explore).toHaveAttribute('data-vf-link', '');
  await expect(explore).not.toHaveAttribute('data-vf-button', '');
  await expect(explore).toHaveAttribute('href', 'components/');
  const exploreBox = await explore.boundingBox();
  expect(exploreBox?.height ?? 0).toBeGreaterThanOrEqual(32);
  await expect(page.getByRole('link', { name: 'Components API', exact: true })).toHaveAttribute('href', 'api/components/');
  const sideNavigation = page.locator('[data-vf-side-nav]');
  const groupLabels = await sideNavigation.locator('[data-vf-side-nav-group-label]').allTextContents();
  expect(groupLabels).toContain('Actions');
  expect(groupLabels).toContain('Forms & Inputs');
  expect(groupLabels).toContain('Content & Media');
  expect(groupLabels.some((label) => /\bL[1-6]\b|Elemental Primitives|Interactive Controls|Composite Widgets/.test(label))).toBe(false);

  const button = buttonCatalogEntry();
  const text = catalogEntry('text', 'Text');
  const input = catalogEntry('input', 'Input');
  const actions = sideNavigation.locator('[data-vf-side-nav-group]')
    .filter({ has: page.getByText('Actions', { exact: true }) });
  await expect(actions.getByRole('link', { name: 'Button', exact: true })).toHaveAttribute('href', button.showcase ? 'components/button/' : 'api/components/button/');
  const content = sideNavigation.locator('[data-vf-side-nav-group]')
    .filter({ has: page.getByText('Content & Media', { exact: true }) });
  await expect(content.getByRole('link', { name: 'Text', exact: true })).toHaveAttribute('href', text.showcase ? 'components/text/' : 'api/components/text/');
  const forms = sideNavigation.locator('[data-vf-side-nav-group]')
    .filter({ has: page.getByText('Forms & Inputs', { exact: true }) });
  await expect(forms.getByRole('link', { name: 'Input', exact: true })).toHaveAttribute('href', input.showcase ? 'components/input/' : 'api/components/input/');
  await expect(page.getByRole('link', { name: 'Styling', exact: true })).toHaveAttribute('href', 'foundations/styling/');
  await expect(page.getByRole('link', { name: 'Design tokens', exact: true })).toHaveAttribute('href', 'foundations/tokens/');
  await expect(page.getByRole('combobox', { name: 'Framework' })).toHaveValue('./');
  await expect(page.getByRole('combobox', { name: 'Framework' }).locator('option')).toHaveCount(2);
  await expect(page.getByRole('combobox', { name: 'Version' })).toHaveValue('next');
  await expect(page.getByRole('searchbox', { name: 'Search documentation' })).toHaveAttribute('data-vf-input', '');
  await expect(page.getByRole('searchbox', { name: 'Search documentation' })).not.toHaveAttribute('aria-expanded');
  await expect(page.getByRole('combobox', { name: 'Theme' })).toHaveAttribute('data-vf-native-select', '');

  const styleHrefs = await expectDeploymentRelativeStyles(page);
  for (const suffix of [
    '/styles/tokens.css',
    '/styles/reset.css',
    '/styles/foundation.css',
    '/components/app-shell/app-shell.css',
    '/components/side-nav/side-nav.css',
    '/components/input/input.css',
    '/components/search-field/search-field.css',
    '/components/native-select/native-select.css',
    '/components/link/link.css',
    '/components/button/button.css'
  ]) {
    expect(styleHrefs.some((href) => href?.endsWith(suffix)), `missing public Web stylesheet ${suffix}`).toBe(true);
  }

  expect(manifest.status).toBe('native-html-first');
  expect(manifest.framework).toBe('native-web');
  expect(manifest.componentCatalog.length).toBeGreaterThan(0);
  expect(manifest.api.length).toBe(manifest.componentCatalog.length);
  expect(manifest.foundations.map((pageEntry) => pageEntry.slug)).toEqual([
    'foundations/styling/',
    'foundations/tokens/'
  ]);

  expect(button.api).toBe(true);
  expect(button.category).toBe('Actions');
  expect(button.publicEntrypoints).toContain('@vyrnforge/web/styles/button.css');
  expect(manifest.pages.some((pageEntry) => pageEntry.slug === 'components/button/')).toBe(button.showcase);


  const search = page.getByRole('searchbox', { name: 'Search documentation' });
  await search.fill('input');
  await expect(page.locator('[data-vf-docs-search-results]')).toBeVisible();
  await expect(page.locator('[data-vf-docs-search-item]:not([hidden])').getByRole('link', { name: /Input/ }).first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-vf-docs-search-results]')).toBeHidden();
  await expect(search).toBeFocused();

  await page.screenshot({ path: testInfo.outputPath('native-home.png'), fullPage: true });
  await expectNoAccessibilityViolations(page);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('Native Web quick start links the component guide, catalog category, and verified API', async ({ page }) => {
  const button = buttonCatalogEntry();
  expect(button.showcase, 'Button quick start must be grounded in a real showcase').toBe(true);
  expect(button.api).toBe(true);

  await gotoWithCleanDocsState(page, '/next/native-web/');
  const quickStart = page.getByRole('link', { name: 'Start with Button' });
  await expect(quickStart).toHaveAttribute('href', 'components/button/');
  await quickStart.click();
  await expect(page.getByRole('heading', { level: 1, name: 'Button' })).toBeVisible();
  await expect(page.locator('[data-vf-docs-component="button"] [data-vf-docs-example]').first()).toBeVisible();

  const breadcrumbs = page.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(breadcrumbs.getByRole('link', { name: 'Components' })).toHaveAttribute('href', '../');
  await expect(breadcrumbs.getByRole('link', { name: 'Actions' })).toHaveAttribute('href', '../#component-group-actions');

  await page.getByRole('link', { name: 'Button API reference' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Button API' })).toBeVisible();
  const apiBreadcrumbs = page.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(apiBreadcrumbs.getByRole('link', { name: 'API Reference' })).toHaveAttribute('href', '../');
  await apiBreadcrumbs.getByRole('link', { name: 'API Reference' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Components API' })).toBeVisible();

  await page.goto('/next/native-web/components/button/');
  await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Actions' }).click();
  await expect(page).toHaveURL(/\/next\/native-web\/components\/#component-group-actions$/);
  await expect(page.locator('#component-group-actions')).toBeVisible();
});

test('Native component catalog is Product Graph scoped and API reference is independent of showcase readiness', async ({ page }, testInfo) => {
  const errors = collectPageErrors(page);
  const button = buttonCatalogEntry();

  await gotoWithCleanDocsState(page, '/next/native-web/components/');
  await expect(page.getByRole('heading', { level: 1, name: 'Components' })).toBeVisible();
  await expect(page.locator('.vf-docs-card-list > li')).toHaveCount(manifest.componentCatalog.length);
  await expect(page.locator('[data-vf-docs-component-group="forms-inputs"]').getByRole('heading', { name: 'Forms & Inputs' })).toBeVisible();
  await expect(page.locator('[data-vf-docs-component-group="actions"]').getByRole('heading', { name: 'Actions' })).toBeVisible();
  await expect(page.locator('[data-vf-docs-component-group="content-media"]').getByRole('heading', { name: 'Content & Media' })).toBeVisible();
  const inputCatalogLink = page.locator('[data-vf-docs-component-group="forms-inputs"] .vf-docs-card-link')
    .filter({ has: page.getByText('Input', { exact: true }) });
  await expect(inputCatalogLink).toBeVisible();
  const buttonCatalogLink = page.locator('.vf-docs-card-list a').filter({ hasText: 'Button' }).first();
  await expect(buttonCatalogLink).toHaveAttribute('href', button.showcase ? 'button/' : '../api/components/button/');

  await page.screenshot({ path: testInfo.outputPath('native-components.png'), fullPage: true });

  await gotoWithCleanDocsState(page, '/next/native-web/api/components/');
  await expect(page.getByRole('heading', { level: 1, name: 'Components API' })).toBeVisible();
  await expect(page.locator('.vf-docs-card-list > li')).toHaveCount(manifest.api.length);
  const inputApiLink = page.locator('[data-vf-docs-component-group="forms-inputs"] .vf-docs-card-link')
    .filter({ has: page.getByText('Input', { exact: true }) });
  await expect(inputApiLink).toHaveAttribute('href', 'input/');
  const actionsApiGroup = page.locator('[data-vf-docs-component-group="actions"]');
  const buttonApiLink = actionsApiGroup.locator('.vf-docs-card-link')
    .filter({ has: page.getByText('Button', { exact: true }) });

  await gotoWithCleanDocsState(page, '/next/native-web/api/components/button/');
  await expect(page.getByRole('heading', { level: 1, name: 'Button API' })).toBeVisible();
  await expect(page.getByText('@vyrnforge/web/styles/button.css', { exact: true })).toBeVisible();
  if (button.showcase) {
    await expect(page.getByRole('link', { name: 'Open Button showcase' })).toHaveAttribute('href', '../../../components/button/');
  }
  await expectDeploymentRelativeStyles(page);
  await expectNoAccessibilityViolations(page);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('agreed Layer 1 Typography and Media members publish complete Native Web guidance', async ({ page }) => {
  const errors = collectPageErrors(page);
  const expected = new Map([
    ['text', '@vyrnforge/web/styles/text.css'],
    ['code', '@vyrnforge/web/styles/code.css'],
    ['kbd', '@vyrnforge/web/styles/kbd.css'],
    ['icon', '@vyrnforge/web/styles/icon.css'],
    ['image', '@vyrnforge/web/styles/image.css'],
  ]);

  for (const [id, styleSpecifier] of expected) {
    const entry = catalogEntry(id, id);
    expect(entry.api, id + ' API must be available').toBe(true);
    expect(entry.showcase, id + ' must have a complete showcase').toBe(true);
    expect(entry.publicEntrypoints).toContain(styleSpecifier);

    await gotoWithCleanDocsState(page, `/next/native-web/components/${id}/`);
    await expect(page.locator(`article[data-vf-docs-component="${id}"]`)).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 2, name: 'Accessibility evidence' })).toBeVisible();
    await expect(page.getByText(styleSpecifier, { exact: false }).first()).toBeVisible();
    await expectDeploymentRelativeStyles(page);
  }

  await expectNoAccessibilityViolations(page);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('settings navigation guide is discoverable without a synthetic public API', async ({ page }) => {
  const pattern = manifest.patternCatalog.find((entry) => entry.slug === 'settings-navigation');
  expect(pattern).toMatchObject({ showcase: true, api: false, publicEntrypoints: [], guideOnly: true, exampleFrameworks: ['react'] });
  expect(existsSync('dist/docs/next/native-web/api/patterns/settings-navigation/index.html')).toBe(false);
  expect(manifest.patternApi.some((entry) => entry.slug === 'api/patterns/settings-navigation/')).toBe(false);
  await page.goto('/next/native-web/patterns/');
  await page.getByRole('link', { name: /Settings navigation/ }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: 'Settings navigation' })).toBeVisible();
  await expect(page.getByText('Guide only.', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'app-shell/settings-navigation' })).toHaveAttribute('href', /examples\/settings-navigation\/react.tsx$/);
  await expect(page.getByRole('link', { name: /Settings navigation API/ })).toHaveCount(0);
  await page.locator('[data-vf-docs-search]').fill('settings navigation');
  await expect(page.locator('[data-vf-docs-search-results]').getByRole('link', { name: /Settings navigation/ })).toBeVisible();
});

test('Loading is documented as a Pattern rather than a component while preserving its public Web stylesheet', async ({ page }) => {
  const errors = collectPageErrors(page);
  const loading = loadingPatternEntry();

  expect(manifest.componentCatalog.some((component) => component.slug === 'loading')).toBe(false);
  expect(manifest.api.some((entry) => entry.slug === 'api/components/loading/')).toBe(false);
  expect(loading.publicEntrypoints).toContain('@vyrnforge/web/styles/loading.css');
  expect(manifest.patternApi.some((entry) => entry.slug === 'api/patterns/loading/')).toBe(true);

  await gotoWithCleanDocsState(page, '/next/native-web/patterns/');
  await expect(page.getByRole('heading', { level: 1, name: 'Patterns' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Loading', exact: true })).toHaveAttribute('href', 'loading/');

  await gotoWithCleanDocsState(page, '/next/native-web/patterns/loading/');
  await expect(page.getByRole('heading', { level: 1, name: 'Loading' })).toBeVisible();
  await expect(page.locator('article[data-vf-docs-pattern="loading"]')).toHaveCount(1);
  await expect(page.getByText('@vyrnforge/web/styles/loading.css', { exact: false }).first()).toBeVisible();
  await expectDeploymentRelativeStyles(page);

  await gotoWithCleanDocsState(page, '/next/native-web/api/patterns/loading/');
  await expect(page.getByRole('heading', { level: 1, name: 'Loading API' })).toBeVisible();
  await expect(page.locator('article[data-vf-docs-api-pattern="loading"]')).toHaveCount(1);
  await expect(page.getByText('@vyrnforge/web/styles/loading.css', { exact: true })).toBeVisible();

  await expectNoAccessibilityViolations(page);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('Native foundations keep styling and tokens separate from component pages', async ({ page }) => {
  const errors = collectPageErrors(page);

  await gotoWithCleanDocsState(page, '/next/native-web/foundations/styling/');
  await expect(page.getByRole('heading', { level: 1, name: 'Styling' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Public entrypoints' })).toBeVisible();
  await expect(page.getByText('@vyrnforge/web/styles/button.css', { exact: true })).toBeVisible();

  await gotoWithCleanDocsState(page, '/next/native-web/foundations/tokens/');
  await expect(page.getByRole('heading', { level: 1, name: 'Design tokens' })).toBeVisible();
  await expect(page.getByText('@vyrnforge/web/styles/tokens.css', { exact: true })).toBeVisible();
  await expectDeploymentRelativeStyles(page);
  await expectNoAccessibilityViolations(page);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('Native Web docs theme preference remains application-owned and supports system mode', async ({ page }) => {
  const errors = collectPageErrors(page);
  await gotoWithCleanDocsState(page, '/next/native-web/');

  const theme = page.getByRole('combobox', { name: 'Theme' });
  await expect(theme).toHaveValue('light');
  await theme.selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-vf-theme', 'dark');
  expect(await page.evaluate(() => localStorage.getItem('vf-docs-theme'))).toBe('dark');

  await theme.selectOption('system');
  expect(await page.evaluate(() => localStorage.getItem('vf-docs-theme'))).toBe('system');

  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Theme' })).toHaveValue('system');
  await expectNoAccessibilityViolations(page);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('Button showcase composes shared guidance, Native adaptation, examples, reference links, and public Web behavior', async ({ page }, testInfo) => {
  const errors = collectPageErrors(page);
  const button = buttonCatalogEntry();
  expect(button.showcase).toBe(true);
  await gotoWithCleanDocsState(page, '/next/native-web/components/button/');

  await expect(page.getByRole('heading', { level: 1, name: 'Button' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Native Web');
  const toc = page.getByRole('navigation', { name: 'On this page' });
  await expect(toc.getByRole('link').first()).toHaveText('Accessibility evidence');
  await expect(toc.getByRole('link', { name: 'Accessibility evidence' })).toHaveAttribute('href', '#accessibility-evidence');
  await expect(page.locator('article[data-vf-docs-component="button"] > header #accessibility-evidence')).toBeVisible();
  await expect(toc.getByRole('link', { name: 'Native Web setup' })).toHaveAttribute('href', '#native-web-setup');
  await expect(toc.getByRole('link', { name: 'Usage preview' })).toHaveAttribute('href', '#usage-preview');
  await expect(toc.getByRole('link', { name: 'More examples' })).toHaveCount(0);
  const sectionOrder = await page.locator('article[data-vf-docs-component="button"] > section[aria-labelledby]')
    .evaluateAll((sections) => sections.map((section) => section.getAttribute('aria-labelledby')));
  expect(sectionOrder.slice(0, 8)).toEqual([
    'native-web-setup', 'usage-preview', 'when-to-use', 'native-baseline',
    'variants', 'sizes', 'states-and-async-work', 'forms',
  ]);
  const featured = page.locator('article[data-vf-docs-component="button"] > section[aria-labelledby="usage-preview"] [data-vf-docs-example]');
  await expect(featured).toHaveAttribute('data-vf-docs-example', 'button/basic');
  for (const [heading, sectionId, exampleId] of [
    ['Variants', 'variants', 'button/variants'],
    ['Sizes', 'sizes', 'button/sizes'],
    ['States and async work', 'states-and-async-work', 'button/states'],
    ['Forms', 'forms', 'button/forms'],
  ]) {
    const section = page.locator(`article[data-vf-docs-component="button"] > section[aria-labelledby="${sectionId}"]`);
    await expect(toc.getByRole('link', { name: heading })).toHaveAttribute('href', `#${sectionId}`);
    await expect(section.getByRole('heading', { level: 2, name: heading })).toBeVisible();
    await expect(section.locator('[data-vf-docs-example]')).toHaveAttribute('data-vf-docs-example', exampleId);
    await expect(section.locator('[data-vf-docs-preview]')).toBeVisible();
    await expect(section.locator('[data-vf-docs-source]')).not.toBeEmpty();
  }
  const variants = page.locator('article[data-vf-docs-component="button"] > section[aria-labelledby="variants"]');
  for (const variant of ['primary', 'secondary', 'ghost']) {
    await expect(variants.locator(`[data-vf-docs-preview] button[data-vf-variant="${variant}"]`)).toHaveCount(1);
  }
  const sizes = page.locator('article[data-vf-docs-component="button"] > section[aria-labelledby="sizes"]');
  for (const size of ['sm', 'md', 'lg']) {
    await expect(sizes.locator(`[data-vf-docs-preview] button[data-vf-size="${size}"]`)).toHaveCount(1);
  }
  const exampleIds = await page.locator('[data-vf-docs-example]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-vf-docs-example')));
  expect(new Set(exampleIds).size).toBe(exampleIds.length);
  await expect(toc.getByRole('link', { name: 'Reference' })).toHaveAttribute('href', '#reference');
  await expect(page.getByText('@vyrnforge/web/styles/button.css', { exact: false }).first()).toBeVisible();
  await expect(page.locator('article[data-vf-docs-component="button"]')).toHaveCount(1);
  await expect(page.locator('[data-vf-docs-example]')).toHaveCount(5);
  const reference = page.locator('#main');
  await expect(reference.getByRole('link', { name: 'Button API reference' })).toHaveAttribute('href', '../../api/components/button/');
  await expect(reference.getByRole('link', { name: 'Styling foundation' })).toHaveAttribute('href', '../../foundations/styling/');
  await expect(reference.getByRole('link', { name: 'Design tokens' })).toHaveAttribute('href', '../../foundations/tokens/');
  await expectDeploymentRelativeStyles(page);

  const save = page.getByRole('button', { name: 'Save changes' });
  await expect(save).toHaveAttribute('data-vf-button', '');
  await expect(save).toHaveAttribute('data-vf-variant', 'primary');
  await expect(save).toHaveCSS('cursor', 'pointer');

  await save.evaluate((buttonElement) => {
    window.__vfActivations = 0;
    buttonElement.addEventListener('click', () => { window.__vfActivations += 1; });
  });
  await save.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  expect(await page.evaluate(() => window.__vfActivations)).toBe(2);

  const disabled = page.getByRole('button', { name: 'Disabled', exact: true });
  await expect(disabled).toBeDisabled();
  const loading = page.getByRole('button', { name: 'Loading', exact: true });
  await expect(loading).toHaveAttribute('aria-busy', 'true');
  await expect(loading).toBeEnabled();

  const formExample = page.locator('[data-vf-docs-example="button/forms"]');
  const form = formExample.locator('form');
  const field = form.getByRole('textbox', { name: 'Example value' });
  const submit = form.getByRole('button', { name: 'Submit form' });
  const reset = form.getByRole('button', { name: 'Reset form' });
  const plain = form.getByRole('button', { name: 'Inspect value' });
  const feedback = formExample.locator('[data-vf-docs-form-feedback]');
  await expect(form).toHaveCount(1);
  await expect(page.locator('[data-vf-docs-form-feedback]')).toHaveCount(1);
  await expect(field).toHaveAttribute('data-vf-input', '');
  await expect(field).toHaveCSS('border-top-style', 'solid');
  await expect(field).toHaveValue('Original');
  await expect(submit).toHaveAttribute('type', 'submit');
  await expect(reset).toHaveAttribute('type', 'reset');
  await expect(plain).toHaveAttribute('type', 'button');
  const formPayload = await form.evaluate((element) => [...new FormData(element, element.querySelector('button[type="submit"]')).entries()]);
  expect(formPayload).toEqual([['example', 'Original'], ['intent', 'submit']]);
  await plain.click();
  await expect(feedback).toHaveText('Current demo value: Original.');
  await field.fill('Edited');
  await plain.click();
  await expect(feedback).toHaveText('Current demo value: Edited.');
  await submit.click();
  await expect(page).toHaveURL(/\/next\/native-web\/components\/button\/$/);
  await expect(feedback).toHaveText('Demo form submitted locally. No data was sent.');
  await expect(field).toHaveValue('Edited');
  await reset.click();
  await expect(field).toHaveValue('Original');
  await expect(feedback).toHaveText('Demo form reset.');

  await page.screenshot({ path: testInfo.outputPath('native-button.png'), fullPage: true });
  await page.evaluate(() => { document.documentElement.dataset.vfTheme = 'dark'; });
  await expect(submit).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('native-button-dark.png'), fullPage: true });
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await expect(submit).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('native-button-forced-colors.png'), fullPage: true });
  await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'no-preference' });
  await page.evaluate(() => { document.documentElement.dataset.vfTheme = 'light'; });
  const firstExample = page.locator('[data-vf-docs-example]').first();
  const copy = firstExample.locator('[data-vf-docs-copy]');
  await copy.click();
  await expect(copy).toHaveText('Copied');
  await expect(firstExample.getByRole('status')).toHaveText('HTML copied to clipboard.');

  const evidence = page.locator('article[data-vf-docs-component="button"] > header .vf-docs-standards');
  await expect(evidence).toHaveCount(1);
  await expect(evidence.getByRole('heading', { name: 'Accessibility evidence' })).toBeVisible();
  const standards = evidence.getByRole('list', { name: 'Standards', exact: true });
  for (const [name, source] of [
    ['HTML button', 'https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element'],
    ['WCAG 2.2 AA (target)', 'https://www.w3.org/TR/WCAG22/'],
    ['ARIA in HTML', 'https://www.w3.org/TR/html-aria/'],
    ['WAI-ARIA 1.2', 'https://www.w3.org/TR/wai-aria-1.2/'],
  ]) {
    await expect(standards.getByRole('link', { name, exact: true })).toHaveAttribute('href', source);
  }
  const disclosure = evidence.locator('details.vf-docs-standards-details');
  const summary = disclosure.locator('summary');
  await expect(disclosure).not.toHaveAttribute('open', '');
  await expect(summary).toHaveText('7 WCAG criteria');
  const criteria = evidence.getByRole('list', { name: 'Mapped WCAG criteria', exact: true });
  await expect(criteria.getByRole('link')).toHaveCount(0);
  await summary.click();
  await expect(disclosure).toHaveAttribute('open', '');
  await expect(criteria.getByRole('link')).toHaveCount(7);
  for (const [criterion, title, slug] of [
    ['1.3.1', 'Info and Relationships', 'info-and-relationships'],
    ['1.4.11', 'Non-text Contrast', 'non-text-contrast'],
    ['2.1.1', 'Keyboard', 'keyboard'],
    ['2.4.7', 'Focus Visible', 'focus-visible'],
    ['2.5.3', 'Label in Name', 'label-in-name'],
    ['2.5.8', 'Target Size (Minimum)', 'target-size-minimum'],
    ['4.1.2', 'Name, Role, Value', 'name-role-value'],
  ]) {
    await expect(criteria.getByRole('link', { name: `${criterion} ${title}`, exact: true }))
      .toHaveAttribute('href', `https://www.w3.org/WAI/WCAG22/Understanding/${slug}`);
  }
  await expect(page.locator('article[data-vf-docs-component="button"] > section[aria-labelledby="states-and-async-work"] a[href="https://www.w3.org/TR/wai-aria-1.2/#aria-busy"]'))
    .toHaveText('aria-busy="true"');
  await expect(evidence).toContainText('Mapping status: mapped');
  await expect(evidence).toContainText('not a blanket compliance claim.');
  await expect(page.locator('article[data-vf-docs-component="button"] .vf-docs-evidence')).toHaveCount(0);
  await expectNoAccessibilityViolations(page);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('Button header holds all mapped accessibility standards and criterion links', async ({ page }, testInfo) => {
  for (const width of [320, 375, 768]) {
    for (const textPercent of [100, 200, 400]) {
      await page.setViewportSize({ width, height: 720 });
      await gotoWithCleanDocsState(page, '/next/native-web/components/button/');
      await page.evaluate((percent) => { document.documentElement.style.fontSize = `${percent}%`; }, textPercent);

      const header = page.locator('article[data-vf-docs-component="button"] > header');
      const labels = header.locator('.vf-docs-standards');
      const standardsList = labels.getByRole('list', { name: 'Standards' });
      await expect(labels).toBeVisible();
      await expect(standardsList.getByRole('link')).toHaveCount(4);
      const disclosure = labels.locator('details.vf-docs-standards-details');
      const summary = disclosure.locator('summary');
      await expect(disclosure).not.toHaveAttribute('open', '');
      await expect(summary).toHaveText('7 WCAG criteria');
      const criteria = labels.getByRole('list', { name: 'Mapped WCAG criteria' });
      await expect(criteria.getByRole('link')).toHaveCount(0);
      await expect(summary).toBeVisible();
      await expect(labels).toContainText('Mapping status: mapped');
      await expect(labels).toContainText('not a blanket compliance claim.');
      const sources = [
        ['HTML button', 'https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element'],
        ['WCAG 2.2 AA (target)', 'https://www.w3.org/TR/WCAG22/'],
        ['ARIA in HTML', 'https://www.w3.org/TR/html-aria/'],
        ['WAI-ARIA 1.2', 'https://www.w3.org/TR/wai-aria-1.2/'],
      ];
      for (const [name, source] of sources) {
        const link = standardsList.getByRole('link', { name, exact: true });
        await expect(link).toHaveAttribute('data-vf-link', '');
        await expect(link).toHaveAttribute('href', source);
        await expect(link).not.toHaveAttribute('target', '_blank');
      }

      const wcagLink = standardsList.getByRole('link', { name: 'WCAG 2.2 AA (target)' });
      await wcagLink.focus();
      await expect(wcagLink).toBeFocused();
      await expect(wcagLink).toHaveCSS('text-decoration-line', 'underline');

      const documentWidth = () => page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      const closedWidth = await documentWidth();
      expect(closedWidth.scrollWidth, `${width}px/${textPercent}% closed standards must not overflow the document`)
        .toBeLessThanOrEqual(closedWidth.clientWidth + 1);
      if (width === 320 && [100, 400].includes(textPercent)) {
        await header.scrollIntoViewIfNeeded();
        await page.screenshot({ path: testInfo.outputPath(`button-standards-${width}-text${textPercent}.png`), fullPage: false });
      }

      await summary.focus();
      await expect(summary).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(disclosure).toHaveAttribute('open', '');
      await expect(criteria.getByRole('link')).toHaveCount(7);
      const expandedWidth = await documentWidth();
      expect(expandedWidth.scrollWidth, `${width}px/${textPercent}% expanded criteria must not overflow the document`)
        .toBeLessThanOrEqual(expandedWidth.clientWidth + 1);
      if (width === 320 && [100, 400].includes(textPercent)) {
        await summary.scrollIntoViewIfNeeded();
        await page.screenshot({ path: testInfo.outputPath(`button-criteria-open-${width}-text${textPercent}.png`), fullPage: false });
      }
      await page.keyboard.press('Space');
      await expect(disclosure).not.toHaveAttribute('open', '');
      await expect(criteria.getByRole('link')).toHaveCount(0);
    }
  }
});

test('featured Native usage preview reflows and stays reachable at reference widths', async ({ page }, testInfo) => {
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 720 });
    await gotoWithCleanDocsState(page, '/next/native-web/components/button/');

    const preview = page.locator('article[data-vf-docs-component="button"] > section[aria-labelledby="usage-preview"]');
    await expect(preview.getByRole('heading', { level: 2, name: 'Usage preview' })).toBeVisible();
    await expect(preview.locator('[data-vf-docs-example]')).toHaveCount(1);
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(metrics.scrollWidth, `${width}px usage preview must not create page-level horizontal overflow`)
      .toBeLessThanOrEqual(metrics.clientWidth + 1);

    await page.screenshot({ path: testInfo.outputPath(`native-usage-${width}-top.png`), fullPage: false });
    await preview.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`native-usage-${width}-preview.png`), fullPage: false });
  }
});

test('C2 approved docs geometry fills wide chrome without stretching reading content', async ({ page }) => {
  for (const width of [1920, 2560]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [route, readableSelector] of [
      ['/next/native-web/components/button/', '.vf-docs-content-grid'],
      ['/next/native-web/', '.vf-docs-main > .vf-docs-catalog'],
    ]) {
      await gotoWithCleanDocsState(page, route);
      const layout = await page.evaluate((selector) => {
        const rect = (element) => {
          const bounds = document.querySelector(element)?.getBoundingClientRect();
          return bounds ? { x: bounds.x, width: bounds.width } : null;
        };
        return {
          header: rect('.vf-docs-header-inner'),
          body: rect('.vf-docs-app-body'),
          rail: rect('.vf-docs-navigation-region'),
          main: rect('.vf-docs-main'),
          footer: rect('.vf-docs-footer'),
          reading: rect(selector),
          rem: parseFloat(getComputedStyle(document.documentElement).fontSize),
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        };
      }, readableSelector);
      for (const selector of ['header', 'body', 'footer']) {
        expect(layout[selector], selector + ' missing').toBeTruthy();
        expect(Math.abs(layout[selector].x), selector + ' must start at the viewport edge').toBeLessThanOrEqual(1);
        expect(Math.abs(layout[selector].width - width), selector + ' must fill the viewport').toBeLessThanOrEqual(1);
      }
      expect(Math.abs(layout.rail.width - 17 * layout.rem)).toBeLessThanOrEqual(1);
      expect(layout.reading).toBeTruthy();
      expect(layout.reading.width).toBeLessThanOrEqual(70 * layout.rem + 1);
      expect(Math.abs(
        layout.reading.x + layout.reading.width / 2 -
        (layout.main.x + layout.main.width / 2)
      ), 'reading measure must be centered inside main, not the shell').toBeLessThanOrEqual(2);
      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
    }
  }
});

test('C2 narrow RTL and long labels reflow in dark and forced-colors modes', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await gotoWithCleanDocsState(page, '/next/native-web/components/button/');
  await page.evaluate(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.dataset.vfTheme = 'dark';
    const groupLabel = document.querySelector('[data-vf-side-nav-group-label]');
    if (groupLabel) groupLabel.textContent = 'Documentation navigation with an intentionally long translated label';
  });
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.locator('#vf-docs-navigation')).toBeVisible();
  await expect(page.locator('#vf-docs-navigation a[aria-current="page"]')).toHaveText('Button');
  for (const style of [{ forcedColors: 'none', reducedMotion: 'reduce' }, { forcedColors: 'active', reducedMotion: 'reduce' }]) {
    await page.emulateMedia(style);
    const widths = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      shellWidth: document.querySelector('[data-vf-docs-shell]').getBoundingClientRect().width,
    }));
    expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth + 1);
    expect(Math.abs(widths.shellWidth - 320)).toBeLessThanOrEqual(1);
  }
});

test('Native shell reflows at 320 CSS pixels and exposes responsive navigation', async ({ page }, testInfo) => {
  const errors = collectPageErrors(page);
  await page.setViewportSize({ width: 320, height: 720 });
  await gotoWithCleanDocsState(page, '/next/native-web/components/button/');

  const toggle = page.getByRole('button', { name: 'Menu' });
  const navigation = page.locator('#vf-docs-navigation');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(navigation).toBeHidden();

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation).toBeVisible();
  await expect(navigation.locator('a[aria-current="page"]')).toHaveText('Button');

  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await expect(page.getByRole('heading', { level: 1, name: 'Button' })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);

  // The 200%-text page can be over 47,000px tall. A single full-page
  // screenshot exceeds Firefox/WebKit's 32,767px capture limit. Retain
  // representative top/middle/bottom viewport images without dropping any
  // reflow, current-link, accessibility or console-error assertions.
  for (const [filename, position] of [
    ['native-responsive-200.png', 0],
    ['native-responsive-200-middle.png', 0.5],
    ['native-responsive-200-bottom.png', 1],
  ]) {
    await page.evaluate((fraction) => {
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo(0, Math.round(maxScroll * fraction));
    }, position);
    await page.screenshot({ path: testInfo.outputPath(filename), fullPage: false });
  }
  await expectNoAccessibilityViolations(page);
  expect(errors, errors.join('\n')).toEqual([]);

  // DOCUX-01: narrow reading is now production CSS rather than a
  // screenshot-only override. Preserve actual-size captures.
  await expect(page.locator('.vf-docs-header')).toHaveCSS('position', 'relative');

  const tocLinks = page.locator('.vf-docs-toc a[href]');
  const sectionHeadings = page.locator('.vf-docs-article > section h2');
  const tocCount = await tocLinks.count();
  const sectionCount = await sectionHeadings.count();
  expect(tocCount, 'TOC must have content to capture').toBeGreaterThanOrEqual(3);
  expect(sectionCount, 'Article must have top, middle and bottom sections').toBeGreaterThanOrEqual(3);

  const captures = [
    ['native-responsive-200-toc-top.png', tocLinks.first()],
    ['native-responsive-200-toc-bottom.png', tocLinks.last()],
    ['native-responsive-200-article-top.png', sectionHeadings.first()],
    ['native-responsive-200-article-middle.png', sectionHeadings.nth(Math.floor(sectionCount / 2))],
    ['native-responsive-200-article-bottom.png', sectionHeadings.last()],
  ];
  for (const [filename, target] of captures) {
    await target.evaluate((element) => element.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'instant' }));
    const visibleContent = await target.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const header = document.querySelector('.vf-docs-header').getBoundingClientRect();
      return {
        top: bounds.top,
        bottom: bounds.bottom,
        headerBottom: header.bottom,
        text: element.textContent.trim(),
        viewportHeight: window.innerHeight,
        scrollY: window.scrollY,
      };
    });
    expect(visibleContent.text, filename + ' requires real authored text').not.toBe('');
    expect(visibleContent.scrollY, filename + ' must be away from the page top').toBeGreaterThan(0);
    expect(visibleContent.headerBottom, filename + ' must not be occluded by the former sticky header').toBeLessThanOrEqual(1);
    expect(visibleContent.top, filename + ' content starts after the viewport').toBeLessThan(visibleContent.viewportHeight);
    expect(visibleContent.bottom, filename + ' content ends before the viewport').toBeGreaterThan(0);
    // Capture the real rendered content at its normal 320×720 viewport size.
    // Product CSS controls the responsive header here; no injected style override.
    await page.screenshot({ path: testInfo.outputPath(filename), fullPage: false });
  }
});

test('mobile TOC keeps links keyboard reachable across narrow/zoom/RTL/forced-colors layouts', async ({ page }, testInfo) => {
  const errors = collectPageErrors(page);
  for (const width of [320, 375, 768]) {
    for (const textPercent of [100, 200, 400]) {
      await page.setViewportSize({ width, height: 720 });
      await gotoWithCleanDocsState(page, '/next/native-web/components/button/');
      await page.evaluate((percent) => {
        document.documentElement.style.fontSize = `${percent}%`;
      }, textPercent);

      const toc = page.getByRole('navigation', { name: 'On this page' });
      const list = toc.locator('ol');
      await expect(list).toHaveCSS('overflow-y', 'auto');
      const dimensions = await list.evaluate((element) => ({
        height: element.getBoundingClientRect().height,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
        limit: Math.min(8 * parseFloat(getComputedStyle(document.documentElement).fontSize), window.innerHeight * 0.2),
      }));
      expect(dimensions.height, `${width}px / ${textPercent}% TOC height`).toBeLessThanOrEqual(dimensions.limit + 2);
      expect(await toc.getByRole('link').count()).toBeGreaterThanOrEqual(12);
      await expect(toc.getByRole('link', { name: 'Usage preview' })).toHaveAttribute('href', '#usage-preview');

      const lastLink = toc.getByRole('link', { name: 'Reference', exact: true });
      await lastLink.focus();
      await expect(lastLink).toBeFocused();
      if (dimensions.scrollHeight > dimensions.clientHeight + 1) {
        expect(await list.evaluate((element) => element.scrollTop), 'TOC focus scrolls its own container').toBeGreaterThan(0);
      }
      await lastLink.click();
      await expect(page).toHaveURL(/#reference$/);
      const widths = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
      }));
      expect(widths.document, `${width}px / ${textPercent}% reflow`).toBeLessThanOrEqual(widths.viewport + 1);
      if (width === 320 && (textPercent === 100 || textPercent === 400)) {
        await page.screenshot({
          path: testInfo.outputPath(`mobile-toc-${width}-text${textPercent}.png`),
          fullPage: false,
        });
      }
    }
  }

  await page.setViewportSize({ width: 320, height: 720 });
  await gotoWithCleanDocsState(page, '/next/native-web/components/button/');
  await page.evaluate(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.style.fontSize = '200%';
  });
  await page.emulateMedia({ forcedColors: 'active' });
  const toc = page.getByRole('navigation', { name: 'On this page' });
  const finalLink = toc.getByRole('link', { name: 'Reference', exact: true });
  await finalLink.focus();
  await expect(finalLink).toBeFocused();
  await finalLink.click();
  await expect(page).toHaveURL(/#reference$/);
  const widths = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(widths.document, 'RTL + forced colors must not create overflow').toBeLessThanOrEqual(widths.viewport + 1);
  await expectNoAccessibilityViolations(page);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('Native header uses a compact named brand and full-width context controls at high text zoom', async ({ page }, testInfo) => {
  for (const [width, textPercent] of [[320, 200], [320, 400], [768, 400]]) {
    await page.setViewportSize({ width, height: 720 });
    await gotoWithCleanDocsState(page, '/next/native-web/components/button/');
    await page.evaluate((percent) => {
      document.documentElement.style.fontSize = `${percent}%`;
    }, textPercent);

    const brand = page.getByRole('link', { name: /VF Docs.*VyrnForge/ });
    await expect(brand).toBeVisible();
    await expect(brand.locator('.vf-docs-brand-compact')).toBeVisible();
    await expect(brand.locator('.vf-docs-brand-full')).toBeHidden();
    await expect(page.locator('.vf-docs-surface')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Menu' })).toHaveCSS('white-space', 'nowrap');
    await expect(page.getByRole('searchbox', { name: 'Search documentation' })).toHaveAttribute('placeholder', 'Search docs');
    const framework = page.getByRole('combobox', { name: 'Framework' });
    await expect(framework.locator('option:checked')).toHaveText('Native Web');
    const widths = await page.evaluate(() => {
      const select = document.querySelector('[data-vf-docs-framework]').getBoundingClientRect();
      const control = document.querySelector('.vf-docs-framework-control').getBoundingClientRect();
      return {
        select: select.width,
        control: control.width,
        scroll: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
      };
    });
    expect(widths.select, 'Framework select should receive entire available row').toBeGreaterThanOrEqual(widths.control - 2);
    expect(widths.scroll, 'Header should not cause document-wide overflow').toBeLessThanOrEqual(widths.viewport + 1);
    await page.screenshot({
      path: testInfo.outputPath(`native-compact-header-${width}-text${textPercent}.png`),
      fullPage: false,
    });
  }
});

test('docs header scrolls away across viewports under 200% text without occluding article targets', async ({ page }, testInfo) => {
  const errors = collectPageErrors(page);

  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 720 });
    await gotoWithCleanDocsState(page, '/next/native-web/components/button/');
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });

    const header = page.locator('.vf-docs-header');
    await expect(header).toHaveCSS('position', 'relative');

    // Intrinsic layout must not overlap brand and tools when text grows.
    const regions = await page.evaluate(() => {
      const brand = document.querySelector('.vf-docs-brand-row').getBoundingClientRect();
      const tools = document.querySelector('.vf-docs-header-tools').getBoundingClientRect();
      return {
        overlap: brand.top < tools.bottom && tools.top < brand.bottom
          && brand.left < tools.right && tools.left < brand.right,
        brandRight: brand.right,
        toolsRight: tools.right,
        clientWidth: document.documentElement.clientWidth,
      };
    });
    expect(regions.overlap, width + 'px header regions must not overlap').toBe(false);
    expect(regions.brandRight, width + 'px brand must remain within viewport').toBeLessThanOrEqual(regions.clientWidth + 1);
    expect(regions.toolsRight, width + 'px tools must remain within viewport').toBeLessThanOrEqual(regions.clientWidth + 1);
    if ([320, 1024, 1440].includes(width)) {
      await page.screenshot({ path: testInfo.outputPath('docs-header-' + width + '-text200-top.png'), fullPage: false });
    }

    const target = page.locator('#native-web-setup');
    await target.evaluate((element) => element.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'instant' }));
    const geometry = await page.evaluate(() => {
      const headerBounds = document.querySelector('.vf-docs-header').getBoundingClientRect();
      const targetBounds = document.querySelector('#native-web-setup').getBoundingClientRect();
      return {
        headerBottom: headerBounds.bottom,
        targetTop: targetBounds.top,
        targetBottom: targetBounds.bottom,
        scrollY: window.scrollY,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      };
    });
    expect(geometry.scrollY, width + 'px needs a real scrolled article target').toBeGreaterThan(0);
    expect(geometry.headerBottom, width + 'px header must scroll away').toBeLessThanOrEqual(1);
    expect(geometry.targetTop, width + 'px target must begin inside viewport').toBeLessThan(720);
    expect(geometry.targetBottom, width + 'px target must remain visible').toBeGreaterThan(0);
    expect(geometry.scrollWidth, width + 'px must not overflow horizontally').toBeLessThanOrEqual(geometry.clientWidth + 1);
    if ([320, 1024, 1440].includes(width)) {
      await page.screenshot({ path: testInfo.outputPath('docs-header-' + width + '-text200-reading.png'), fullPage: false });
    }

    const search = page.locator('[data-vf-docs-search]');
    await search.focus();
    await expect(search).toBeFocused();
    const searchBounds = await search.boundingBox();
    expect(searchBounds?.y ?? -1, width + 'px header controls should be recoverable by focus').toBeGreaterThanOrEqual(0);

    if (width <= 768) {
      const menu = page.locator('[data-vf-docs-nav-toggle]');
      await expect(menu).toBeVisible();
      await menu.click();
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await menu.click();
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
      await expect(menu).toBeFocused();
    }
  }

  // The same scroll-away behavior applies to default text at desktop size.
  await page.setViewportSize({ width: 1280, height: 720 });
  await gotoWithCleanDocsState(page, '/next/native-web/components/button/');
  await expect(page.locator('.vf-docs-header')).toHaveCSS('position', 'relative');
  expect(errors, errors.join('\n')).toEqual([]);
});

test('C1 responsive navigation transfers only disappearing focus and resets disclosure', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/next/native-web/components/button/');
  const nav = page.locator('#vf-docs-navigation');
  const menu = page.locator('[data-vf-docs-nav-toggle]');
  const current = nav.locator('a[aria-current="page"]');
  const first = nav.locator('a[href]').first();
  const main = page.locator('#main');
  const search = page.locator('[data-vf-docs-search]');
  await expect(menu).toBeHidden();
  await current.focus();
  await page.setViewportSize({ width: 480, height: 800 });
  await expect(menu).toBeFocused();
  await expect(nav).toBeHidden();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Enter');
  await expect(nav).toBeVisible();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await current.focus();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(current).toBeFocused();
  await expect(menu).toBeHidden();
  await page.setViewportSize({ width: 480, height: 800 });
  await expect(menu).toBeFocused();
  await expect(nav).toBeHidden();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(current).toBeFocused();
  await expect(nav).toBeVisible();
  await page.setViewportSize({ width: 480, height: 800 });
  await expect(menu).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await expect(menu).toBeFocused();
  await expect(nav).toBeHidden();
  await current.evaluate(node => node.removeAttribute('aria-current'));
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(first).toBeFocused();
  await page.setViewportSize({ width: 480, height: 800 });
  await expect(menu).toBeFocused();
  await nav.evaluate(node => node.querySelectorAll('a').forEach(link => link.remove()));
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(main).toBeFocused();
  await search.focus();
  await page.setViewportSize({ width: 480, height: 800 });
  await expect(search).toBeFocused();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(search).toBeFocused();
  await main.focus();
  await page.setViewportSize({ width: 480, height: 800 });
  await expect(main).toBeFocused();
});

test('C1 narrow keyboard order, skip link and table of contents stay meaningful', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 800 });
  await page.goto('/next/native-web/components/button/');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  const menu = page.getByRole('button', { name: 'Menu' });
  const main = page.locator('#main');
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(menu).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(main).toBeFocused();
  const toc = page.getByRole('navigation', { name: 'On this page' });
  const article = page.locator('.vf-docs-article');
  expect(await toc.evaluate(node => !!(node.compareDocumentPosition(document.querySelector('.vf-docs-article')) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  const tocBox = await toc.boundingBox();
  const articleBox = await article.boundingBox();
  expect(tocBox.y).toBeLessThan(articleBox.y);
  await toc.getByRole('link', { name: 'Native Web setup' }).click();
  await expect(page).toHaveURL(/#native-web-setup$/);
});

test.describe('C1 without JavaScript', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 480, height: 800 } });
  test('native rail stays available without a dead Menu', async ({ page }) => {
    await page.goto('/next/native-web/components/button/');
    await expect(page.locator('[data-vf-docs-nav-toggle]')).toBeHidden();
    const nav = page.locator('#vf-docs-navigation');
    await expect(nav).toBeVisible();
    await expect(nav.locator('a[aria-current="page"]')).toHaveText('Button');
    const standards = page.locator('article[data-vf-docs-component="button"] .vf-docs-standards');
    const criteria = standards.getByRole('list', { name: 'Mapped WCAG criteria' });
    const disclosure = standards.locator('details');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await disclosure.locator('summary').click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(criteria.getByRole('link')).toHaveCount(7);
    await nav.getByRole('link', { name: 'Input', exact: true }).click();
    await expect(page).toHaveURL(/components\/input\//);
  });
});

test('C1 failed script load leaves native navigation usable', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 800 });
  await page.route('**/assets/docs.js', route => route.abort());
  await page.goto('/next/native-web/components/button/');
  await expect(page.locator('[data-vf-docs-nav-toggle]')).toBeHidden();
  await expect(page.locator('#vf-docs-navigation')).toBeVisible();
});


test('all metadata-backed guides and API references use one shared accessibility section', () => {
  const catalog = compileNativeDocumentation();
  const pages = [...catalog.showcasePages, ...catalog.apiPages];
  let backedPages = 0;

  for (const productPage of pages) {
    const filepath = `dist/docs/next/native-web/${productPage.route}index.html`;
    expect(existsSync(filepath), filepath).toBe(true);
    const markup = readFileSync(filepath, 'utf8');
    const count = [...markup.matchAll(/data-vf-docs-accessibility\b/g)].length;
    const references = productPage.standardReferences;

    expect(count, `${productPage.route}: evidence block must follow product metadata`)
      .toBe(references ? 1 : 0);
    if (!references) continue;
    backedPages += 1;
    expect(markup).toContain('not a blanket compliance claim');
    expect(markup).toContain('Mapping status: <strong>' + references.mappingStatus + '</strong>');
    if (references.criteria.length) {
      const countLabel = references.criteria.length === 1 ? 'criterion' : 'criteria';
      expect(markup).toContain('<summary>' + references.criteria.length + ' WCAG ' + countLabel + '</summary>');
    }
    for (const standard of references.standards) {
      if (standard.url) expect(markup, `${productPage.route} missing ${standard.label}`).toContain('href="' + standard.url + '"');
    }
    for (const criterion of references.criteria) {
      if (criterion.url) expect(markup, `${productPage.route} missing WCAG ${criterion.id}`).toContain('href="' + criterion.url + '"');
    }
    if (references.reviewStatus === 'review-required') {
      expect(markup).toContain('Accessibility review required.');
    }
  }

  expect(backedPages, 'product-owned metadata must reach multiple page families').toBeGreaterThan(10);
  for (const route of ['', 'components/', 'patterns/', 'api/components/', 'api/patterns/',
    'foundations/styling/', 'foundations/tokens/']) {
    const markup = readFileSync(`dist/docs/next/native-web/${route}index.html`, 'utf8');
    expect(markup, `${route}: catalog/foundation must not invent product-unit evidence`)
      .not.toContain('data-vf-docs-accessibility');
  }
});

test('metadata-only additions preserve official references, review status, and unknown fallbacks', () => {
  const catalog = compileNativeDocumentation();
  const input = catalog.componentApiPages.find((item) => item.id === 'input');
  const appShell = catalog.componentApiPages.find((item) => item.id === 'app-shell');
  const reviewRequired = catalog.componentApiPages.find((item) => item.standardReferences?.reviewStatus === 'review-required');

  expect(input.standardReferences.standards).toContainEqual({
    label: 'HTML input',
    url: 'https://html.spec.whatwg.org/multipage/input.html#the-input-element',
  });
  expect(input.standardReferences.criteria).toContainEqual({
    id: '3.3.2',
    label: 'Labels or Instructions',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions',
  });
  expect(appShell.standardReferences.nativeBaseline).toContain('authored header');
  expect(appShell.standardReferences.standards.some((item) => item.label.startsWith('HTML'))).toBe(false);
  expect(reviewRequired).toBeDefined();

  const unknown = deriveAccessibilityReferences({
    nativeBaseline: { kind: 'structural', reference: 'consumer-specific landmarks' },
    wcag: { target: '2.3 AA', status: 'review-required', criteria: ['9.9.9'] },
    reviewStatus: 'review-required',
  });
  expect(unknown.criteria).toEqual([{ id: '9.9.9', label: null, url: null }]);
  expect(unknown.standards.some((item) => item.label === 'WCAG 2.3 AA (target)' && item.url === null)).toBe(true);
  expect(unknown.reviewStatus).toBe('review-required');
  expect(deriveAccessibilityReferences(null)).toBeNull();
});

test('non-Button API pages expose the same accessible standards disclosure', async ({ page }) => {
  const catalog = compileNativeDocumentation();
  const cases = ['input', 'app-shell'];
  const reviewRequired = catalog.componentApiPages.find((item) => item.standardReferences?.reviewStatus === 'review-required');
  if (reviewRequired && !cases.includes(reviewRequired.id)) cases.push(reviewRequired.id);

  for (const id of cases) {
    await gotoWithCleanDocsState(page, `/next/native-web/api/components/${id}/`);
    const product = catalog.componentApiPages.find((item) => item.id === id);
    const section = page.locator(`[data-vf-docs-api-component="${id}"] [data-vf-docs-accessibility]`);
    await expect(section).toHaveCount(1);
    await expect(section.getByRole('heading', { name: 'Accessibility evidence' })).toBeVisible();
    const details = section.locator('details');
    await expect(details).not.toHaveAttribute('open', '');
    await details.locator('summary').click();
    await expect(details).toHaveAttribute('open', '');
    await expect(details.getByRole('link')).toHaveCount(product.standardReferences.criteria.filter((item) => item.url).length);
    if (id === 'app-shell') await expect(details).toContainText('Semantic baseline: authored header');
    if (product.standardReferences.reviewStatus === 'review-required') {
      await expect(section).toContainText('Accessibility review required.');
    }
  }
});


test('shared standards remain readable on Native API pages at mobile and 400% text', async ({ page }, testInfo) => {
  const scenarios = [
    ['input', 1280, 100],
    ['input', 320, 400],
    ['app-shell', 1280, 100],
    ['app-shell', 320, 400],
  ];
  for (const [id, width, textPercent] of scenarios) {
    await page.setViewportSize({ width, height: 720 });
    await gotoWithCleanDocsState(page, `/next/native-web/api/components/${id}/`);
    await page.evaluate((percent) => {
      document.documentElement.style.fontSize = `${percent}%`;
    }, textPercent);

    const section = page.locator(`[data-vf-docs-api-component="${id}"] [data-vf-docs-accessibility]`);
    await expect(section).toBeVisible();
    await expect(section.locator('details')).not.toHaveAttribute('open', '');
    await section.locator('summary').click();
    await expect(section.locator('details')).toHaveAttribute('open', '');
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(metrics.scrollWidth, `${id} ${width}px / ${textPercent}% must reflow`)
      .toBeLessThanOrEqual(metrics.clientWidth + 1);
    await section.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: testInfo.outputPath(`standardized-standards-${id}-${width}-text${textPercent}.png`),
      fullPage: false,
    });
  }
});


test('every Native documentation page family loads public Text, Code and Layout foundations', () => {
  const routes = [
    '', 'components/', 'patterns/', 'api/components/', 'api/patterns/',
    'foundations/styling/', 'foundations/tokens/',
    'components/button/', 'api/components/button/',
    'patterns/loading/', 'api/patterns/loading/',
    'patterns/settings-navigation/',
  ];
  const sharedStyles = compileNativeDocumentation().shellStyles;
  const publicStyles = ['text.css', 'code.css', 'layout.css'].map((asset) => {
    const style = sharedStyles.find((entry) => entry.specifier === `@vyrnforge/web/styles/${asset}`);
    expect(style, `${asset} should resolve from the public Web package export map`).toBeDefined();
    return style;
  });
  for (const route of routes) {
    const path = `dist/docs/next/native-web/${route}index.html`;
    expect(existsSync(path), path).toBe(true);
    const html = readFileSync(path, 'utf8');
    for (const style of publicStyles) {
      expect(html, `${route}: ${style.specifier} must be loaded`)
        .toContain(style.assetPath.replace(/^\//, ''));
    }
  }

  const button = readFileSync('dist/docs/next/native-web/components/button/index.html', 'utf8');
  expect((button.match(/<pre data-vf-code-block/g) ?? []).length).toBeGreaterThanOrEqual(2);
  expect(button).toContain('<code data-vf-code>');
  expect(button).toContain('data-vf-text-variant="overline"');
  expect(button).toContain('data-vf-text-variant="body-lg"');
  expect(button).toContain('data-vf-flow');
  expect(button).toContain('data-vf-flow data-vf-flow-direction="block" data-vf-flow-gap="xl"');
  const home = readFileSync('dist/docs/next/native-web/index.html', 'utf8');
  expect(home).toContain('data-vf-flow data-vf-flow-direction="inline" data-vf-flow-gap="lg"');

  const foundation = readFileSync('dist/docs/next/native-web/foundations/styling/index.html', 'utf8');
  expect(foundation).toContain('<code data-vf-code>');
  const api = readFileSync('dist/docs/next/native-web/api/components/button/index.html', 'utf8');
  expect(api).toContain('<code data-vf-code>');
});

test('Text, Code and Layout reuse retains navigation, source reading and narrow reflow', async ({ page }, testInfo) => {
  const routes = [
    ['home', '/next/native-web/'],
    ['catalog', '/next/native-web/components/'],
    ['foundation', '/next/native-web/foundations/styling/'],
    ['showcase', '/next/native-web/components/button/'],
    ['api', '/next/native-web/api/components/button/'],
    ['pattern', '/next/native-web/patterns/loading/'],
  ];
  for (const [name, route] of routes) {
    await page.setViewportSize({ width: 1280, height: 720 });
    await gotoWithCleanDocsState(page, route);
    await expect(page.locator('[data-vf-app-shell]')).toHaveCount(1);
    await expectDeploymentRelativeStyles(page);

    const links = await page.locator('link[rel="stylesheet"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
    const publicStyles = compileNativeDocumentation().shellStyles
      .filter((style) => ['text.css', 'code.css', 'layout.css'].some((asset) =>
        style.specifier === `@vyrnforge/web/styles/${asset}`));
    expect(publicStyles).toHaveLength(3);
    for (const style of publicStyles) {
      expect(links.some((href) => href.includes(style.assetPath.replace(/^\//, ''))),
        `${name}: ${style.specifier} must load through the published export target`).toBe(true);
    }

    if (['home', 'catalog', 'foundation', 'showcase', 'pattern'].includes(name)) {
      const overline = page.locator('[data-vf-text][data-vf-text-variant="overline"]').first();
      await expect(overline).toBeVisible();
    }
    if (['home', 'catalog', 'foundation', 'showcase', 'api'].includes(name)) {
      const lede = page.locator('[data-vf-text][data-vf-text-variant="body-lg"]').first();
      await expect(lede).toBeVisible();
    }
    if (['foundation', 'showcase', 'api'].includes(name)) {
      await expect(page.locator('code[data-vf-code]:visible').first()).toBeVisible();
    }
    if (['home', 'catalog'].includes(name)) {
      const cards = page.locator('ul[data-vf-auto-grid]').first();
      await expect(cards).toBeVisible();
      await expect(cards).toHaveCSS('display', 'grid');
      await expect(page.locator('a[data-vf-flow][data-vf-flow-direction="inline"]').first()).toBeVisible();
    }
    if (name === 'showcase') {
      const preview = page.locator('[data-vf-docs-preview][data-vf-flow]').first();
      await expect(preview).toBeVisible();
      await expect(preview).toHaveCSS('flex-wrap', 'wrap');
      const block = page.locator('pre[data-vf-code-block]').first();
      await expect(block).toBeVisible();
      await expect(block).toHaveCSS('overflow-x', 'auto');
      await block.focus();
      await expect(block).toBeFocused();
    }

    if (['home', 'catalog', 'foundation', 'showcase', 'api'].includes(name)) {
      await page.setViewportSize({ width: 320, height: 720 });
      await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
      const bounds = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(bounds.scrollWidth, `${name}: 320px/200% should not introduce document-wide horizontal overflow`)
        .toBeLessThanOrEqual(bounds.clientWidth + 1);
      await page.screenshot({ path: testInfo.outputPath(`docs-reuse-${name}-320-text200.png`), fullPage: false });
    }
  }
});


test('SearchField composition comes from one public entrypoint on every Native page family', () => {
  const model = compileNativeDocumentation();
  const entry = model.shellStyles.find((item) => item.specifier === '@vyrnforge/web/styles/search-field.css');
  expect(entry, 'SearchField must resolve through the public Web package').toBeDefined();
  expect(entry.assetPath).toBe('/assets/vyrnforge-web/components/search-field/search-field.css');

  for (const route of [
    '', 'components/', 'patterns/', 'foundations/styling/', 'foundations/tokens/',
    'components/button/', 'api/components/button/', 'patterns/loading/', 'api/patterns/loading/',
  ]) {
    const html = readFileSync(`dist/docs/next/native-web/${route}index.html`, 'utf8');
    expect(html).toContain('vyrnforge-web/components/search-field/search-field.css');
    expect(html).toContain('<search class="vf-docs-search" data-vf-search-field-root');
    expect(html).toContain('data-vf-input data-vf-search-field-input data-vf-docs-search');
    expect(html).toContain('data-vf-search-field-clear data-vf-docs-search-clear');
    expect(html).toContain('data-vf-docs-search-status role="status"');
    expect(html).not.toContain('role="combobox"');
  }
});

test('docs SearchField clear, results, and keyboard behavior remain accessible', async ({ page }, testInfo) => {
  const scenarios = [
    ['/next/native-web/', 1280, 100],
    ['/next/native-web/components/button/', 320, 400],
  ];
  for (const [route, width, textPercent] of scenarios) {
    await page.setViewportSize({ width, height: 720 });
    await gotoWithCleanDocsState(page, route);
    await page.evaluate((percent) => { document.documentElement.style.fontSize = `${percent}%`; }, textPercent);

    const search = page.getByRole('search', { name: 'Documentation search' });
    const input = search.getByRole('searchbox', { name: 'Search documentation' });
    const clear = search.getByRole('button', { name: 'Clear search' });
    const panel = search.locator('[data-vf-docs-search-results]');
    const status = search.getByRole('status');
    await expect(search).toHaveAttribute('data-vf-search-field-root', '');
    await expect(input).toHaveAttribute('data-vf-search-field-input', '');
    await expect(input).not.toHaveAttribute('role', 'combobox');
    await expect(clear).toBeDisabled();
    await expect(panel).toBeHidden();

    await input.fill('input');
    await expect(panel).toBeVisible();
    // The result overlay must obscure the document, not blend its text into
    // the underlying page at desktop, mobile, or enlarged text sizes.
    const panelBackground = await panel.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(panelBackground).not.toBe('rgba(0, 0, 0, 0)');
    expect(panelBackground).not.toBe('transparent');
    await expect(panel).toHaveCSS('border-top-style', 'solid');
    await expect(clear).toBeEnabled();
    await expect(status).toContainText(/documentation results?\./);
    await expect(panel.getByRole('link', { name: /Input/ }).first()).toBeVisible();

    await clear.focus();
    await expect(clear).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
    await expect(clear).toBeDisabled();
    await expect(panel).toBeHidden();
    await expect(status).toBeEmpty();

    await input.fill('unlikely-no-matching-documents-1234');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('No matching documentation.');
    await expect(status).toContainText('0 documentation results.');
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(input).toBeFocused();
    // Native type=search may also clear itself on Escape in Chromium. Preserve
    // the platform behavior and assert the Clear affordance reflects its value.
    await expect(clear).toHaveJSProperty('disabled', !(await input.inputValue()));

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(metrics.scrollWidth, `${route} ${width}px/${textPercent}% search must not cause page overflow`)
      .toBeLessThanOrEqual(metrics.clientWidth + 1);

    await input.fill('button');
    await input.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: testInfo.outputPath(`docs-search-field-${width}-text${textPercent}.png`),
      fullPage: false,
    });
    await expectNoAccessibilityViolations(page);
  }
});

test('SearchField remains a labeled native search input when docs JavaScript fails', async ({ page }) => {
  await page.route('**/assets/docs.js', route => route.abort());
  await page.goto('/next/native-web/');
  const search = page.getByRole('search', { name: 'Documentation search' });
  const input = search.getByRole('searchbox', { name: 'Search documentation' });
  const clear = search.getByRole('button', { name: 'Clear search' });
  await expect(input).toHaveAttribute('type', 'search');
  await expect(clear).toBeDisabled();
  await input.fill('button');
  await expect(input).toHaveValue('button');
  await expect(clear).toBeDisabled();
  await expect(search.locator('[data-vf-docs-search-results]')).toBeHidden();
});

test('Layout guide is discoverable in the Layout & Structure submenu and renders every CSS recipe', async ({ page }, testInfo) => {
  const errors = collectPageErrors(page);
  const layout = catalogEntry('layout', 'Layout');
  expect(layout).toMatchObject({ category: 'Layout & Structure', showcase: true, api: true });
  expect(layout.publicEntrypoints).toContain('@vyrnforge/web/styles/layout.css');
  expect(manifest.pages.some(entry => entry.slug === 'components/layout/')).toBe(true);

  await gotoWithCleanDocsState(page, '/next/native-web/');
  const layoutGroup = page.locator('[data-vf-side-nav-group]').filter({
    has: page.locator('[data-vf-side-nav-group-label]').getByText('Layout & Structure', { exact: true }),
  });
  const layoutLink = layoutGroup.getByRole('link', { name: 'Layout', exact: true });
  await expect(layoutLink).toHaveAttribute('href', 'components/layout/');
  await layoutLink.click();
  await expect(page).toHaveURL(/\/next\/native-web\/components\/layout\/$/);
  await expect(layoutGroup.getByRole('link', { name: 'Layout', exact: true })).toHaveAttribute('aria-current', 'page');

  const article = page.locator('[data-vf-docs-component="layout"]');
  await expect(page.getByRole('heading', { level: 1, name: 'Layout: Flow & AutoGrid' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Flow: vertical rhythm' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Flow: wrapping peers' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'AutoGrid: intrinsic equal tracks' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Migration from older layout names' })).toBeVisible();
  await expect(article.getByText('review required', { exact: false }).first()).toBeVisible();

  const accessibility = article.locator('[data-vf-docs-accessibility]');
  await accessibility.locator('summary').click();
  const mappedCriteria = accessibility.getByRole('list', { name: 'Mapped WCAG criteria' });
  await expect(mappedCriteria.getByRole('link')).toHaveCount(6);
  for (const [id, label, slug] of [
    ['1.3.2', 'Meaningful Sequence', 'meaningful-sequence'],
    ['1.4.10', 'Reflow', 'reflow'],
  ]) {
    await expect(mappedCriteria.getByRole('link', { name: `${id} ${label}`, exact: true }))
      .toHaveAttribute('href', `https://www.w3.org/WAI/WCAG22/Understanding/${slug}`);
  }

  for (const id of ['basic', 'flow-block', 'flow-inline', 'flow-wrap', 'auto-grid', 'semantic-groups', 'dividers']) {
    const example = article.locator('[data-vf-docs-example="layout/' + id + '"]');
    await expect(example).toHaveCount(1);
    await expect(example.getByRole('button', { name: 'Copy HTML' })).toBeVisible();
    await example.getByText('View HTML source').click();
    await expect(example.locator('code[data-vf-docs-source]')).toBeVisible();
  }
  await expect(article.locator('[data-vf-docs-example="layout/flow-block"] [data-vf-docs-preview] > [data-vf-flow]')).toHaveCSS('flex-direction', 'column');
  await expect(article.locator('[data-vf-docs-example="layout/flow-inline"] [data-vf-docs-preview] > [data-vf-flow]')).toHaveCSS('flex-wrap', 'nowrap');
  const rtl = article.locator('[data-vf-docs-example="layout/flow-wrap"] [dir="rtl"]');
  await expect(rtl).toHaveCSS('direction', 'rtl');
  await expect(rtl).toHaveCSS('flex-wrap', 'wrap');
  await expect(article.locator('[data-vf-docs-example="layout/auto-grid"] [data-vf-auto-grid]')).toHaveCSS('display', 'grid');
  const fieldset = article.locator('[data-vf-docs-example="layout/semantic-groups"] fieldset');
  await expect(fieldset.getByText('Reminder frequency')).toBeVisible();
  await expect(fieldset.getByRole('radio')).toHaveCount(2);
  await fieldset.getByRole('radio', { name: 'Weekly' }).check();
  await expect(fieldset.getByRole('radio', { name: 'Weekly' })).toBeChecked();
  await expect(fieldset.getByRole('radio', { name: 'Daily' })).not.toBeChecked();
  const nativeDividers = article.locator('[data-vf-docs-example="layout/dividers"] [data-vf-docs-preview]');
  await expect(nativeDividers.getByRole('separator')).toHaveCount(1);
  await expect(nativeDividers.locator('hr')).not.toHaveAttribute('tabindex');
  await expect(nativeDividers.locator('hr')).toHaveCount(1);
  await expect(article.locator('[data-vf-stack], [data-vf-inline], [data-vf-cluster], [data-vf-container], [data-vf-control-group]')).toHaveCount(0);

  await expectDeploymentRelativeStyles(page);
  await expectNoAccessibilityViolations(page);
  await page.screenshot({ path: testInfo.outputPath('native-layout-guide-wide.png'), fullPage: true });
  expect(errors, errors.join('\n')).toEqual([]);
});

test('Native Web Divider shows horizontal and vertical visual lines without separator semantics', async ({ page }) => {
  const errors = collectPageErrors(page);
  await gotoWithCleanDocsState(page, '/next/native-web/components/divider/');
  const article = page.locator('[data-vf-docs-component="divider"]');
  await expect(article.getByRole('heading', { name: 'Divider', level: 1 })).toBeVisible();
  for (const orientation of ['horizontal', 'vertical']) {
    const slug = orientation === 'horizontal' ? 'basic' : 'vertical';
    const example = article.locator('[data-vf-docs-example="divider/' + slug + '"] [data-vf-docs-preview]');
    const line = example.locator('[data-vf-divider]');
    await expect(line).toHaveAttribute('data-vf-divider-orientation', orientation);
    await expect(line).toHaveAttribute('aria-hidden', 'true');
    await expect(example.getByRole('separator')).toHaveCount(0);
    await expect(line).not.toHaveAttribute('tabindex');
    const rect = await line.boundingBox();
    if (orientation === 'horizontal') {
      expect(rect.width).toBeGreaterThan(100);
      expect(rect.height).toBeGreaterThanOrEqual(1);
      expect(rect.height).toBeLessThanOrEqual(2);
    } else {
      expect(rect.width).toBeGreaterThanOrEqual(1);
      expect(rect.width).toBeLessThanOrEqual(2);
      expect(rect.height).toBeGreaterThan(10);
    }
  }
  await expectNoAccessibilityViolations(page);
  expect(errors).toEqual([]);
});

test('Native Web Divider labels are readable in horizontal and vertical previews', async ({ page }) => {
  const errors = collectPageErrors(page);
  await gotoWithCleanDocsState(page, '/next/native-web/components/divider/');
  const guide = page.locator('[data-vf-docs-component="divider"]');
  await expect(guide.getByRole('heading', { name: 'Text and alignment' })).toBeVisible();
  for (const [slug, orientation] of [
    ['labeled-horizontal', 'horizontal'],
    ['labeled-vertical', 'vertical'],
  ]) {
    const preview = guide.locator('[data-vf-docs-example="divider/' + slug + '"] [data-vf-docs-preview]');
    await expect(preview.locator('[data-vf-divider-labeled]')).toHaveCount(3);
    for (const align of ['start', 'center', 'end']) {
      const line = preview.locator('[data-vf-divider-align="' + align + '"]');
      await expect(line).toHaveAttribute('data-vf-divider-orientation', orientation);
      await expect(line).not.toHaveAttribute('aria-hidden');
      await expect(line.locator('[data-vf-divider-label]')).toBeVisible();
      await expect(line.locator('[data-vf-divider-label]')).toHaveText(
        align === 'start' ? 'Start' : align === 'center' ? 'OR' : 'End');
      if (orientation === 'vertical') {
        await expect(line.locator('[data-vf-divider-label]')).toHaveCSS('writing-mode', 'vertical-rl');
      }
    }
    await expect(preview.getByRole('separator')).toHaveCount(0);
  }
  await expectNoAccessibilityViolations(page);
  expect(errors).toEqual([]);
});

test('Native Web Divider guide previews vertical text direction options', async ({ page }) => {
  const errors = collectPageErrors(page);
  await gotoWithCleanDocsState(page, '/next/native-web/components/divider/');
  const guide = page.locator('[data-vf-docs-component="divider"]');
  await expect(guide.getByRole('heading', { name: 'Vertical label direction' })).toBeVisible();
  const preview = guide.locator('[data-vf-docs-example="divider/text-direction"] [data-vf-docs-preview]');
  await expect(preview.locator('[data-vf-divider-labeled]')).toHaveCount(3);
  for (const [index, text, direction, mode] of [
    [0, 'OR', 'horizontal', 'horizontal-tb'],
    [1, 'Next', null, 'vertical-rl'],
    [2, 'Previous', 'bottom-to-top', 'vertical-rl'],
  ]) {
    const line = preview.locator('[data-vf-divider-labeled]').nth(index);
    await expect(line).not.toHaveAttribute('aria-hidden');
    if (direction) {
      await expect(line).toHaveAttribute('data-vf-divider-text-direction', direction);
    } else {
      await expect(line).not.toHaveAttribute('data-vf-divider-text-direction');
    }
    const label = line.locator('[data-vf-divider-label]');
    await expect(label).toHaveText(text);
    await expect(label).toHaveCSS('writing-mode', mode);
  }
  await expect(preview.locator('[data-vf-divider-labeled]').nth(2)
    .locator('[data-vf-divider-label]')).toHaveCSS('transform', 'matrix(-1, 0, 0, -1, 0, 0)');
  await expect(preview.getByRole('separator')).toHaveCount(0);
  await expectNoAccessibilityViolations(page);
  expect(errors).toEqual([]);
});

test('Layout guide remains navigable at 320 CSS px with enlarged text and RTL previews', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await gotoWithCleanDocsState(page, '/next/native-web/components/layout/');
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });

  const article = page.locator('[data-vf-docs-component="layout"]');
  await expect(article).toBeVisible();
  await expect(article.locator('[data-vf-docs-example="layout/auto-grid"] [data-vf-auto-grid]')).toHaveCSS('display', 'grid');
  await expect(article.locator('[data-vf-docs-example="layout/flow-wrap"] [dir="rtl"]')).toHaveCSS('flex-wrap', 'wrap');
  const documentWidth = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(documentWidth.scrollWidth).toBeLessThanOrEqual(documentWidth.clientWidth);

  const toc = page.getByRole('navigation', { name: 'On this page' });
  await toc.getByRole('link', { name: 'AutoGrid: intrinsic equal tracks' }).click();
  await expect(page).toHaveURL(/#autogrid-intrinsic-equal-tracks$/);
  await expect(article.locator('[data-vf-docs-example="layout/auto-grid"]')).toBeVisible();
  await expectNoAccessibilityViolations(page);
  await page.screenshot({ path: testInfo.outputPath('native-layout-guide-narrow-200percent.png'), fullPage: true });
});

test('documentation search prioritizes exact topics over incidental guide mentions', async ({ page }) => {
  await gotoWithCleanDocsState(page, '/next/native-web/');
  const search = page.getByRole('searchbox', { name: 'Search documentation' });
  const visibleResults = page.locator('[data-vf-docs-search-item]:not([hidden])');
  await search.fill('input');
  await expect(visibleResults.first().getByRole('link', { name: /Input/ })).toBeVisible();
  await search.fill('layout');
  await expect(visibleResults.first().getByRole('link', { name: /Layout/ })).toBeVisible();
  await search.fill('no-results-layout-123456');
  await expect(visibleResults).toHaveCount(0);
  await search.fill('input');
  await expect(visibleResults.first().getByRole('link', { name: /Input/ })).toBeVisible();
});

test('Native Image guide renders source-backed meaningful, decorative and captioned examples', async ({ page }) => {
  const image = catalogEntry('image', 'Image');
  expect(image.showcase).toBe(true);

  await page.goto('/next/native-web/components/image/');
  await expect(page.getByRole('heading', { level: 1, name: 'Image' })).toBeVisible();

  const article = page.locator('article[data-vf-docs-component="image"]');
  await expect(article).toHaveCount(1);
  await expect(article.locator('[data-vf-docs-example]')).toHaveCount(3);
  await expect(article.locator('[data-vf-docs-example="image/basic"] [data-vf-docs-preview] img[data-vf-image]')).toHaveAttribute(
    'alt', 'Illustration of green hills beneath a yellow sun'
  );

  for (const [sectionId, exampleId] of [
    ['informative-and-decorative-content', 'image/decorative'],
    ['captions-and-context', 'image/captioned'],
  ]) {
    const section = article.locator(`section[aria-labelledby="${sectionId}"]`);
    await expect(section.locator('[data-vf-docs-example]')).toHaveAttribute('data-vf-docs-example', exampleId);
    await expect(section.locator('[data-vf-docs-source]')).not.toBeEmpty();
  }

  const decorative = article.locator('[data-vf-docs-example="image/decorative"] [data-vf-docs-preview] img[data-vf-image]');
  await expect(decorative).toHaveAttribute('alt', '');

  const captioned = article.locator('[data-vf-docs-example="image/captioned"] [data-vf-docs-preview] figure');
  await expect(captioned.locator('figcaption')).toHaveText('Study of shape and contrast');
  await expect(captioned.locator('img')).toHaveAttribute('alt', 'A blue circle centered on a pale background');

  await expectNoAccessibilityViolations(page);
});
