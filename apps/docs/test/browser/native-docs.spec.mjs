import { existsSync, readFileSync } from 'node:fs';
import axeCore from 'axe-core';
import { test, expect } from '@playwright/test';

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
  await expect(page.locator('[data-vf-docs-framework], [data-vf-framework-picker]')).toHaveCount(0);
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

  const evidence = page.locator('article[data-vf-docs-component="button"] .vf-docs-evidence');
  await expect(evidence.getByRole('link', { name: 'button — HTML button element' }))
    .toHaveAttribute('href', 'https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element');
  await expect(evidence.getByRole('link', { name: '2.2 AA' }))
    .toHaveAttribute('href', 'https://www.w3.org/TR/WCAG22/');
  for (const [criterion, title, slug] of [
    ['1.3.1', 'Info and Relationships', 'info-and-relationships'],
    ['1.4.11', 'Non-text Contrast', 'non-text-contrast'],
    ['2.1.1', 'Keyboard', 'keyboard'],
    ['2.4.7', 'Focus Visible', 'focus-visible'],
    ['2.5.3', 'Label in Name', 'label-in-name'],
    ['2.5.8', 'Target Size (Minimum)', 'target-size-minimum'],
    ['4.1.2', 'Name, Role, Value', 'name-role-value'],
  ]) {
    await expect(evidence.getByRole('link', { name: `${criterion} ${title}`, exact: true }))
      .toHaveAttribute('href', `https://www.w3.org/WAI/WCAG22/Understanding/${slug}`);
  }
  await expect(evidence.getByRole('link', { name: 'ARIA in HTML (W3C)' }))
    .toHaveAttribute('href', 'https://www.w3.org/TR/html-aria/');
  await expect(evidence.getByRole('link', { name: 'WAI-ARIA 1.2' }))
    .toHaveAttribute('href', 'https://www.w3.org/TR/wai-aria-1.2/');
  await expect(page.locator('article[data-vf-docs-component="button"] > section[aria-labelledby="states-and-async-work"] a[href="https://www.w3.org/TR/wai-aria-1.2/#aria-busy"]'))
    .toHaveText('aria-busy="true"');
  await expect(evidence).toContainText('not a blanket compliance claim.');
  await expectNoAccessibilityViolations(page);
  expect(errors, errors.join('\n')).toEqual([]);
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
