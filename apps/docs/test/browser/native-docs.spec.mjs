import { readFileSync } from 'node:fs';
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

function themeToggleCatalogEntry() {
  return catalogEntry('theme-toggle', 'Theme Toggle');
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
  expect(groupLabels.some((label) => /\bL[1-6]\b|Elemental Primitives|Interactive Controls|Composite Components/.test(label))).toBe(false);

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
  await expect(page.locator('[data-vf-theme-toggle]')).toHaveCount(1);
  await expect(page.getByRole('switch', { name: 'Dark theme' })).toHaveAttribute('data-vf-theme-toggle-control', '');

  const styleHrefs = await expectDeploymentRelativeStyles(page);
  for (const suffix of [
    '/styles/tokens.css',
    '/styles/reset.css',
    '/styles/foundation.css',
    '/components/app-shell/app-shell.css',
    '/components/side-nav/side-nav.css',
    '/components/input/input.css',
    '/components/native-select/native-select.css',
    '/components/theme-toggle/theme-toggle.css',
    '/components/link/link.css',
    '/components/surface/surface.css',
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

  const themeToggle = themeToggleCatalogEntry();
  expect(themeToggle.api).toBe(true);
  expect(themeToggle.showcase).toBe(true);
  expect(themeToggle.publicEntrypoints).toContain('@vyrnforge/web/styles/theme-toggle.css');
  expect(manifest.pages.some((pageEntry) => pageEntry.slug === 'components/theme-toggle/')).toBe(true);

  const search = page.getByRole('searchbox', { name: 'Search documentation' });
  await search.fill('theme toggle');
  await expect(page.locator('[data-vf-docs-search-results]')).toBeVisible();
  await expect(page.locator('[data-vf-docs-search-item]:not([hidden])').getByRole('link', { name: /Theme Toggle/ }).first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-vf-docs-search-results]')).toBeHidden();
  await expect(search).toBeFocused();

  await page.screenshot({ path: testInfo.outputPath('native-home.png'), fullPage: true });
  await expectNoAccessibilityViolations(page);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('Native component catalog is Product Graph scoped and API reference is independent of showcase readiness', async ({ page }, testInfo) => {
  const errors = collectPageErrors(page);
  const button = buttonCatalogEntry();
  const themeToggle = themeToggleCatalogEntry();

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
  const themeToggleCatalogLink = page.locator('.vf-docs-card-list a').filter({ hasText: 'Theme Toggle' }).first();
  await expect(themeToggleCatalogLink).toHaveAttribute('href', themeToggle.showcase ? 'theme-toggle/' : '../api/components/theme-toggle/');

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
  const themeToggleApiLink = actionsApiGroup.locator('.vf-docs-card-link')
    .filter({ has: page.getByText('Theme Toggle', { exact: true }) });
  await expect(buttonApiLink).toHaveAttribute('href', 'button/');
  await expect(themeToggleApiLink).toHaveAttribute('href', 'theme-toggle/');

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
  await expect(page.getByText('@vyrnforge/web/styles/theme-toggle.css', { exact: true })).toBeVisible();

  await gotoWithCleanDocsState(page, '/next/native-web/foundations/tokens/');
  await expect(page.getByRole('heading', { level: 1, name: 'Design tokens' })).toBeVisible();
  await expect(page.getByText('@vyrnforge/web/styles/tokens.css', { exact: true })).toBeVisible();
  await expectDeploymentRelativeStyles(page);
  await expectNoAccessibilityViolations(page);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('Native Web Theme Toggle selects and persists explicit light and dark themes', async ({ page }) => {
  const errors = collectPageErrors(page);
  await gotoWithCleanDocsState(page, '/next/native-web/');

  await expect(page.locator('html')).toHaveAttribute('data-vf-theme', 'light');
  const lightSurface = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--vf-color-surface').trim());

  const theme = page.getByRole('switch', { name: 'Dark theme' });
  await expect(theme).not.toBeChecked();
  await theme.focus();
  await page.keyboard.press('Space');
  await expect(theme).toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('data-vf-theme', 'dark');
  const darkSurface = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--vf-color-surface').trim());
  expect(darkSurface).not.toBe(lightSurface);
  expect(await page.evaluate(() => localStorage.getItem('vf-docs-theme'))).toBe('dark');

  await page.reload();
  const persistedTheme = page.getByRole('switch', { name: 'Dark theme' });
  await expect(page.locator('html')).toHaveAttribute('data-vf-theme', 'dark');
  await expect(persistedTheme).toBeChecked();

  await persistedTheme.click();
  await expect(persistedTheme).not.toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('data-vf-theme', 'light');
  expect(await page.evaluate(() => localStorage.getItem('vf-docs-theme'))).toBe('light');

  await page.evaluate(() => localStorage.setItem('vf-docs-theme', 'system'));
  await page.reload();
  const migrated = await page.evaluate(() => ({
    stored: localStorage.getItem('vf-docs-theme'),
    active: document.documentElement.dataset.vfTheme
  }));
  expect(['light', 'dark']).toContain(migrated.stored);
  expect(migrated.active).toBe(migrated.stored);
  await expectNoAccessibilityViolations(page);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('Theme Toggle showcase uses native switch state and component-owned motion', async ({ page }, testInfo) => {
  const errors = collectPageErrors(page);
  const themeToggle = themeToggleCatalogEntry();
  expect(themeToggle.showcase).toBe(true);
  await gotoWithCleanDocsState(page, '/next/native-web/components/theme-toggle/');

  await expect(page.getByRole('heading', { level: 1, name: 'Theme Toggle' })).toBeVisible();
  await expect(page.getByText('@vyrnforge/web/styles/theme-toggle.css', { exact: false }).first()).toBeVisible();
  await expect(page.locator('article[data-vf-docs-component="theme-toggle"]')).toHaveCount(1);
  await expect(page.locator('[data-vf-docs-example]')).toHaveCount(1);
  await expectDeploymentRelativeStyles(page);

  const example = page.locator('[data-vf-docs-example]').first();
  const control = example.getByRole('switch', { name: 'Dark theme' });
  const thumb = example.locator('[data-vf-theme-toggle-thumb]');
  const track = example.locator('[data-vf-theme-toggle-track]');
  await expect(control).not.toBeChecked();

  const target = await control.boundingBox();
  expect(target?.width ?? 0).toBeGreaterThanOrEqual(24);
  expect(target?.height ?? 0).toBeGreaterThanOrEqual(24);

  const before = await thumb.evaluate((element) => getComputedStyle(element).transform);
  await control.click();
  await expect(control).toBeChecked();
  await expect.poll(() => thumb.evaluate((element) => getComputedStyle(element).transform)).not.toBe(before);

  await control.focus();
  await page.keyboard.press('Space');
  await expect(control).not.toBeChecked();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reducedMotion = await thumb.evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(reducedMotion).toBe('0s');
  await expect(track).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath('native-theme-toggle.png'), fullPage: true });
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
  await expect(toc.getByRole('link', { name: 'Examples' })).toHaveAttribute('href', '#examples');
  await expect(toc.getByRole('link', { name: 'Reference' })).toHaveAttribute('href', '#reference');
  await expect(page.getByText('@vyrnforge/web/styles/button.css', { exact: false }).first()).toBeVisible();
  await expect(page.locator('article[data-vf-docs-component="button"]')).toHaveCount(1);
  await expect(page.locator('[data-vf-docs-example]')).toHaveCount(5);
  await expect(page.locator('[data-vf-docs-example][data-vf-surface]')).toHaveCount(5);
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

  await expect(page.getByText('This is repository evidence metadata, not a blanket compliance claim.')).toBeVisible();
  await expectNoAccessibilityViolations(page);
  expect(errors, errors.join('\n')).toEqual([]);
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

  await page.screenshot({ path: testInfo.outputPath('native-responsive-200.png'), fullPage: true });
  await expectNoAccessibilityViolations(page);
  expect(errors, errors.join('\n')).toEqual([]);
});
