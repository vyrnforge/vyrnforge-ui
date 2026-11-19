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
  expect(manifest.routes.filter((entry) => entry.view !== 'unavailable').map((entry) => entry.route)).toEqual([
    '', 'components/button/', 'api/components/button/',
  ]);
  expect(manifest.routes).toContainEqual({ route: 'components/input/', view: 'unavailable' });
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
  const standards = page.locator('[data-vf-docs-react-component="button"] [data-vf-docs-accessibility]');
  await expect(standards.getByRole('heading', { name: 'Accessibility evidence' })).toBeVisible();
  await expect(standards.getByRole('link', { name: /WCAG 2\.2/ })).toHaveAttribute('href', 'https://www.w3.org/TR/WCAG22/');
  await expect(standards.locator('details')).not.toHaveAttribute('open', '');
  await standards.locator('summary').click();
  await expect(standards.locator('details')).toHaveAttribute('open', '');
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
    .getByRole('link', { name: 'Native Web' })).toHaveAttribute('href', '../../../native-web/components/button/');
  expect(errors).toEqual([]);
});

test('React API reference renders public source-derived types and inline semantic code', async ({ page }) => {
  await page.goto('/next/react/api/components/button/');
  await expect(page.getByRole('heading', { name: 'Public TypeScript types' })).toBeVisible();
  const types = page.locator('[data-vf-docs-react-api] pre code');
  await expect(types).toContainText('export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>');
  await expect(types).toContainText('variant?: ButtonVariant');
  await expect(types).toContainText('size?: ButtonSize');
  await expect(types).toContainText('loading?: boolean');
  await expect(page.locator('[data-vf-docs-react-api] code[data-vf-code]').first()).toBeVisible();
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
  await expect(page.locator('[data-vf-docs-react-api="button"] [data-vf-docs-accessibility]')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-vf-theme', 'dark');
  await page.getByRole('navigation', { name: 'Documentation framework' })
    .getByRole('link', { name: 'Native Web' }).click();
  await expect(page).toHaveURL(/\/next\/native-web\/api\/components\/button\/$/);
});

test('framework selector preserves Native/React guide and API context with browser history', async ({ page }) => {
  await page.goto('/next/native-web/components/button/');
  await expect(page.getByRole('combobox', { name: 'Version' })).toHaveValue('next');
  await page.getByRole('combobox', { name: 'Framework' }).selectOption({ label: 'React (Button pilot)' });
  await expect(page).toHaveURL(/\/next\/react\/components\/button\/$/);
  await expect(page.getByRole('heading', { name: 'Button', level: 1 })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Version' })).toHaveValue('next');
  await page.getByRole('combobox', { name: 'Framework' }).selectOption({ label: 'Native Web' });
  await expect(page).toHaveURL(/\/next\/native-web\/components\/button\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/next\/react\/components\/button\/$/);

  await page.goto('/next/react/api/components/button/');
  await page.getByRole('combobox', { name: 'Framework' }).selectOption({ label: 'Native Web' });
  await expect(page).toHaveURL(/\/next\/native-web\/api\/components\/button\/$/);
});

test('switching an undocumented React topic reports unavailability with recovery', async ({ page }) => {
  await page.goto('/next/native-web/components/input/');
  await page.getByRole('combobox', { name: 'Framework' }).selectOption({ label: 'React (Button pilot)' });
  await expect(page).toHaveURL(/\/next\/react\/components\/input\/$/);
  await expect(page.getByRole('heading', { name: 'React documentation unavailable' })).toBeVisible();
  await expect(page.locator('[data-vf-docs-react-unavailable]')).toContainText('Input');
  await page.getByRole('link', { name: 'Return to Native Web topic' }).click();
  await expect(page).toHaveURL(/\/next\/native-web\/components\/input\/$/);
});

test('React mobile navigation closes on Escape and returns focus to Menu', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/next/react/components/button/');
  const menu = page.getByRole('button', { name: 'Menu' });
  await menu.click();
  await page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Button API' }).focus();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
});

test('framework navigation remains available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/next/native-web/components/button/');
    await page.getByRole('link', { name: 'Open this topic in React documentation' }).click();
    await expect(page).toHaveURL(/\/next\/react\/components\/button\/$/);
    await expect(page.getByRole('heading', { name: 'Button', level: 1 })).toBeVisible();
    await page.getByRole('navigation', { name: 'Documentation framework' })
      .getByRole('link', { name: 'Native Web' }).click();
    await expect(page).toHaveURL(/\/next\/native-web\/components\/button\/$/);
  } finally {
    await context.close();
  }
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
