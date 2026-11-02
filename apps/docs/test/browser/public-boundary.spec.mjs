import { test, expect } from '@playwright/test';

const internalMarkers = [
  '@vyrnforge/core',
  'rebuild branch',
  'package skeleton',
  'Bootstrap private',
  '--_vf-'
];

test('published documentation stays on the consumer side of the public boundary', async ({ page, request }) => {
  const manifestResponse = await request.get('/next/site-manifest.json');
  expect(manifestResponse.ok()).toBeTruthy();
  const manifest = await manifestResponse.json();

  expect(manifest.pages.some((entry) => entry.logicalSlug === 'reference/packages')).toBeFalsy();

  const pages = manifest.pages.filter((entry) => entry.available && (
    entry.framework === 'native-web' ||
    entry.logicalSlug === '' ||
    entry.kind === 'framework' ||
    entry.logicalSlug === 'components/button'
  ));

  for (const entry of pages) {
    const url = `/next/${entry.slug}/`;
    await page.goto(url);
    const text = await page.locator('main').innerText();

    for (const marker of internalMarkers) {
      expect(text, `${url} exposes internal marker ${marker}`).not.toContain(marker);
    }
  }
});
