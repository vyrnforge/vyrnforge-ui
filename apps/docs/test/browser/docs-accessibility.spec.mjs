import { readFileSync } from 'node:fs';
import axeCore from 'axe-core';
import { test, expect } from '@playwright/test';

const manifest = JSON.parse(readFileSync('dist/docs/next/site-manifest.json', 'utf8'));
const representativePages = manifest.pages.filter((page) => page.available && (
  page.framework === 'native-web' ||
  page.logicalSlug === '' ||
  page.kind === 'framework' ||
  page.logicalSlug === 'components/button'
));

async function expectNoAxeViolations(page) {
  await page.addScriptTag({ content: axeCore.source });
  const results = await page.evaluate(async () => window.axe.run(document, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
    }
  }));
  expect(results.violations, results.violations.map((item) => `${item.id}: ${item.help}`).join('\n')).toEqual([]);
}

test('docs accessibility: framework gateway', async ({ page }) => {
  await page.goto('/next/');
  await expectNoAxeViolations(page);
});

for (const docsPage of representativePages) {
  test(`docs accessibility: ${docsPage.framework} / ${docsPage.title}`, async ({ page }) => {
    await page.goto(`/next/${docsPage.slug}/`);
    await expectNoAxeViolations(page);
  });
}
