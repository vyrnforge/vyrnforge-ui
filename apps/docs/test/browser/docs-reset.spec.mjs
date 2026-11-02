import { readFileSync } from 'node:fs';
import axeCore from 'axe-core';
import { test, expect } from '@playwright/test';

const manifest = JSON.parse(readFileSync('dist/docs/next/site-manifest.json', 'utf8'));

test('documentation surface is reset for a Native HTML-first rebuild', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/next/');

  await expect(page.getByRole('heading', { level: 1, name: 'VyrnForge Documentation' })).toBeVisible();
  await expect(page.getByText(/rebuilt from the Native HTML surface first/i)).toBeVisible();
  await expect(page.locator('[data-vf-docs-framework], [data-vf-framework-picker], [data-vf-docs-search], [data-vf-side-nav]')).toHaveCount(0);

  expect(manifest.status).toBe('reset');
  expect(manifest.pages).toEqual([
    { slug: '', title: 'VyrnForge Documentation', framework: 'native-web' }
  ]);

  await page.addScriptTag({ content: axeCore.source });
  const results = await page.evaluate(async () => window.axe.run(document, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
    }
  }));
  expect(results.violations, results.violations.map((item) => `${item.id}: ${item.help}`).join('\n')).toEqual([]);
  expect(errors, errors.join('\n')).toEqual([]);
});
