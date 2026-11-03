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

test('Native Web home uses the public Web shell and Product Graph navigation', async ({ page }, testInfo) => {
  const errors = collectPageErrors(page);
  await gotoWithCleanDocsState(page, '/next/native-web/');

  await expect(page.getByRole('heading', { level: 1, name: 'VyrnForge Native Web' })).toBeVisible();
  await expect(page.locator('[data-vf-app-shell]')).toHaveCount(1);
  await expect(page.locator('[data-vf-side-nav]')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Button' }).first()).toHaveAttribute('href', 'components/button/');
  await expect(page.locator('[data-vf-docs-framework], [data-vf-framework-picker]')).toHaveCount(0);
  await expect(page.getByRole('searchbox', { name: 'Search documentation' })).toHaveAttribute('data-vf-input', '');
  await expect(page.getByRole('searchbox', { name: 'Search documentation' })).not.toHaveAttribute('aria-expanded');
  await expect(page.getByLabel('Theme')).toHaveAttribute('data-vf-native-select', '');
  await expect(page.locator('.vf-docs-card-list [data-vf-surface]')).toHaveCount(1);

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
    '/components/surface/surface.css',
    '/components/button/button.css'
  ]) {
    expect(styleHrefs.some((href) => href?.endsWith(suffix)), `missing public Web stylesheet ${suffix}`).toBe(true);
  }

  expect(manifest.status).toBe('native-html-first');
  expect(manifest.framework).toBe('native-web');
  expect(manifest.pages).toEqual([
    {
      slug: 'components/button/',
      title: 'Button',
      group: 'actions',
      framework: 'native-web',
      source: 'product/components/button/docs/index.md',
      examples: ['button/basic', 'button/sizes', 'button/states', 'button/variants']
    }
  ]);

  const search = page.getByRole('searchbox', { name: 'Search documentation' });
  await search.fill('button');
  await expect(page.locator('[data-vf-docs-search-results]')).toBeVisible();
  await expect(page.locator('[data-vf-docs-search-item]:not([hidden])').getByRole('link', { name: /Button/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-vf-docs-search-results]')).toBeHidden();
  await expect(search).toBeFocused();

  await page.screenshot({ path: testInfo.outputPath('native-home.png'), fullPage: true });
  await expectNoAccessibilityViolations(page);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('Native Web theme selection is explicit and persists without a theme runtime', async ({ page }) => {
  const errors = collectPageErrors(page);
  await gotoWithCleanDocsState(page, '/next/native-web/');

  await expect(page.locator('html')).toHaveAttribute('data-vf-theme', 'light');
  const lightSurface = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--vf-color-surface').trim());

  const theme = page.getByLabel('Theme');
  await theme.selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-vf-theme', 'dark');
  const darkSurface = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--vf-color-surface').trim());
  expect(darkSurface).not.toBe(lightSurface);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-vf-theme', 'dark');
  await expect(theme).toHaveValue('dark');

  await theme.selectOption('system');
  await expect(page.locator('html')).toHaveAttribute('data-vf-theme', 'system');
  await expectNoAccessibilityViolations(page);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('Button page composes native guidance, TOC, examples, and public Web behavior', async ({ page }, testInfo) => {
  const errors = collectPageErrors(page);
  await gotoWithCleanDocsState(page, '/next/native-web/components/button/');

  await expect(page.getByRole('heading', { level: 1, name: 'Button' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Native Web');
  const toc = page.getByRole('navigation', { name: 'On this page' });
  await expect(toc.getByRole('link', { name: 'Native Web setup' })).toHaveAttribute('href', '#native-web-setup');
  await expect(toc.getByRole('link', { name: 'Examples' })).toHaveAttribute('href', '#examples');
  await expect(page.getByText('@vyrnforge/web/styles/button.css', { exact: false }).first()).toBeVisible();
  await expect(page.locator('article[data-vf-docs-component="button"]')).toHaveCount(1);
  await expect(page.locator('[data-vf-docs-example]')).toHaveCount(4);
  await expect(page.locator('[data-vf-docs-example][data-vf-surface]')).toHaveCount(4);
  await expectDeploymentRelativeStyles(page);

  const save = page.getByRole('button', { name: 'Save changes' });
  await expect(save).toHaveAttribute('data-vf-button', '');
  await expect(save).toHaveAttribute('data-vf-variant', 'primary');
  await expect(save).toHaveCSS('cursor', 'pointer');

  await save.evaluate((button) => {
    window.__vfActivations = 0;
    button.addEventListener('click', () => { window.__vfActivations += 1; });
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

  await page.screenshot({ path: testInfo.outputPath('native-button.png'), fullPage: true });
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
  await expect(navigation.getByRole('link', { name: 'Button' })).toHaveAttribute('aria-current', 'page');

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
