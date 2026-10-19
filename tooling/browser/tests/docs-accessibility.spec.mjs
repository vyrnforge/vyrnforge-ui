import { readFileSync } from 'node:fs';
import axeCore from 'axe-core';
import { test, expect } from '@playwright/test';

const manifest = JSON.parse(readFileSync('dist/docs/next/site-manifest.json', 'utf8'));

for (const docsPage of manifest.pages) {
  const route = docsPage.slug ? `/next/${docsPage.slug}/` : '/next/';
  test(`docs accessibility: ${docsPage.title}`, async ({ page }) => {
    await page.goto(route);
    await page.addScriptTag({ content: axeCore.source });
    const results = await page.evaluate(async () => window.axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
      }
    }));
    expect(results.violations, results.violations.map((item) => `${item.id}: ${item.help}`).join('\n')).toEqual([]);
  });
}
