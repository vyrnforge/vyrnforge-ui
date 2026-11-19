import { existsSync, readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';
import { compileFrameworkDocumentation } from '../../../../tooling/docs/framework-documentation.mjs';

test('React pilot artifact is Product Graph-backed and SSR-rendered with public React components', () => {
  const manifestPath = 'dist/docs/next/react/site-manifest.json';
  expect(existsSync(manifestPath)).toBe(true);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const button = compileFrameworkDocumentation('react').componentCatalog.find((entry) => entry.id === 'button');
  expect(manifest.framework).toBe('react');
  expect(manifest.status).toBe('button-pilot');
  expect(manifest.button.sharedSourcePath).toBe(button.sharedSourcePath);
  expect(manifest.button.frameworkSourcePath).toBe(button.frameworkSourcePath);
  expect(manifest.button.publicEntrypoints).toContain('@vyrnforge/react/button');
  expect(manifest.routes.map((entry) => entry.route)).toEqual([
    '', 'components/button/', 'api/components/button/',
  ]);
  for (const route of manifest.routes) {
    const html = readFileSync('dist/docs/next/react/' + route.route + 'index.html', 'utf8');
    expect(html).toContain('data-vf-app-shell');
    expect(html).toContain('data-vf-side-nav');
    expect(html).toContain('id="vf-react-root"');
    expect(html).toContain('id="vf-react-page-data"');
    expect(html).toContain('react-reference.js');
    expect(html).toContain('@vyrnforge/react/button');
  }
});

test('React Button guide SSR hydrates and uses public Button, AppShell, SideNav and live product example', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto('/next/react/components/button/');
  await expect(page.getByRole('heading', { name: 'Button', level: 1 })).toBeVisible();
  await expect(page.locator('[data-vf-docs-react-component="button"]')).toHaveCount(1);
  await expect(page.locator('[data-vf-app-shell]')).toHaveCount(1);
  await expect(page.locator('[data-vf-side-nav]')).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Documentation' })
    .getByRole('link', { name: 'Button guide' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.locator('[data-vf-docs-react-feedback]')).toHaveText('Save changes activated');
  await expect(page.frameLocator('iframe[title="Checked-in React Button example"]')
    .getByRole('button', { name: 'Save changes', exact: true })).toBeVisible();
  const source = page.getByText('View checked-in React source');
  await source.click();
  await expect(page.locator('article[data-vf-docs-react-component] pre').last()).toContainText("from '@vyrnforge/react/button'");
  await expect(page.getByRole('navigation', { name: 'Documentation framework' })
    .getByRole('link', { name: 'Native Web' })).toHaveAttribute('href', '../../native-web/components/button/');
  expect(errors).toEqual([]);
});

test('React URL context and framework-scoped search/theme work without inventing unsupported routes', async ({ page }) => {
  await page.goto('/next/react/');
  await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
  await page.getByRole('searchbox', { name: 'Search React documentation' }).fill('api');
  const results = page.locator('[data-vf-docs-react-results]');
  await expect(results.getByRole('link', { name: 'Button API' })).toBeVisible();
  await expect(results.getByRole('link', { name: 'React overview' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.getByRole('searchbox', { name: 'Search React documentation' })).toBeFocused();
  await expect(results).toBeHidden();

  await page.getByLabel('Theme').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-vf-theme', 'dark');
  await page.getByRole('navigation', { name: 'Documentation' })
    .getByRole('link', { name: 'Button API' }).click();
  await expect(page).toHaveURL(/\/next\/react\/api\/components\/button\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Button API' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-vf-theme', 'dark');
  await page.getByRole('navigation', { name: 'Documentation framework' })
    .getByRole('link', { name: 'Native Web' }).click();
  await expect(page).toHaveURL(/\/next\/native-web\/api\/components\/button\/$/);
});

test('React docs remain navigable at 320px/400% text, RTL and forced colors', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/next/react/components/button/');
  await expect(page.locator('html')).toHaveAttribute('data-vf-react-hydrated', 'true');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '400%';
    document.documentElement.dir = 'rtl';
  });
  await page.emulateMedia({ forcedColors: 'active' });
  const menu = page.getByRole('button', { name: 'Menu' });
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Button API' })).toBeVisible();
  const width = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth,
  }));
  expect(width.content).toBeLessThanOrEqual(width.viewport + 1);
  await page.screenshot({ path: testInfo.outputPath('react-button-320-text400-rtl-forced-colors.png'), fullPage: false });
  await page.addScriptTag({ content: axeCore.source });
  const results = await page.evaluate(async () => window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
  }));
  expect(results.violations, results.violations.map((entry) => entry.id + ': ' + entry.help).join('\n')).toEqual([]);
});

test('without JavaScript, React SSR content and native links remain readable', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/next/react/components/button/');
    await expect(page.getByRole('heading', { name: 'Button', level: 1 })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Documentation' })
      .getByRole('link', { name: 'Button API' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
    await expect(page.locator('html')).not.toHaveAttribute('data-vf-react-hydrated', 'true');
    await page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Button API' }).click();
    await expect(page).toHaveURL(/\/next\/react\/api\/components\/button\/$/);
  } finally {
    await context.close();
  }
});
