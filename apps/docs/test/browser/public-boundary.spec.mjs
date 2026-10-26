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

  expect(manifest.pages.some((entry) => entry.slug === 'reference/packages')).toBeFalsy();

  for (const entry of manifest.pages) {
    const url = entry.slug ? `/next/${entry.slug}/` : '/next/';
    await page.goto(url);
    const text = await page.locator('main').innerText();

    for (const marker of internalMarkers) {
      expect(text, `${url} exposes internal marker ${marker}`).not.toContain(marker);
    }
  }
});
