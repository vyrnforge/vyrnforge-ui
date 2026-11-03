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

test('Native Web home is generated from documented Product Graph components', async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.goto('/next/native-web/');

  await expect(page.getByRole('heading', { level: 1, name: 'VyrnForge Native Web' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Button' }).first()).toHaveAttribute('href', '/next/native-web/components/button/');
  await expect(page.locator('[data-vf-docs-framework], [data-vf-framework-picker]')).toHaveCount(0);

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

  await expectNoAccessibilityViolations(page);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('Button page uses native semantics, public Web styling, and Native Web examples only', async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.goto('/next/native-web/components/button/');

  await expect(page.getByRole('heading', { level: 1, name: 'Button' })).toBeVisible();
  await expect(page.getByText('@vyrnforge/web/styles/button.css', { exact: false }).first()).toBeVisible();
  await expect(page.locator('article[data-vf-docs-component="button"]')).toHaveCount(1);
  await expect(page.locator('[data-vf-docs-example]')).toHaveCount(4);

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

  const disabled = page.getByRole('button', { name: 'Disabled' });
  await expect(disabled).toBeDisabled();
  const loading = page.getByRole('button', { name: 'Loading', exact: true });
  await expect(loading).toHaveAttribute('aria-busy', 'true');
  await expect(loading).toBeEnabled();

  await expect(page.getByText('This is repository evidence metadata, not a blanket compliance claim.')).toBeVisible();
  await expectNoAccessibilityViolations(page);
  expect(errors, errors.join('\n')).toEqual([]);
});
