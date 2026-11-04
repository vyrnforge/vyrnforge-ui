import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const canonicalArtworkUrl = new URL('../../../../product/components/theme-toggle/web/theme-toggle-dragon-orb.svg', import.meta.url);

function normalizedPathData(source) {
  return [...source.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)]
    .map((match) => match[1].replace(/\s+/g, ' ').trim());
}

async function artworkGeometry(locator) {
  return locator.evaluate((svg) => ({
    viewBox: svg.getAttribute('viewBox'),
    paths: [...svg.querySelectorAll('path')].map((path) =>
      (path.getAttribute('d') ?? '').replace(/\s+/g, ' ').trim()
    ),
    circles: svg.querySelectorAll('circle').length,
    ellipses: svg.querySelectorAll('ellipse').length,
  }));
}

async function expectArtwork(art) {
  await expect(art).toHaveAttribute('viewBox', '0 0 650 740');
  await expect(art.locator('[data-vf-theme-toggle-dragon-mark]')).toHaveCount(1);
  await expect(art.locator('[data-vf-theme-toggle-orb]')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-silhouette')).toHaveCount(1);
  expect(await art.locator('.vf-theme-toggle-dragon-silhouette').getAttribute('d')).not.toMatch(/\bM\b[\s\S]*\bM\b/);
  await expect(art.locator('.vf-theme-toggle-dragon-accent')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-eye')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-eye-slit')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-horn-detail')).toHaveCount(0);
  await expect(art.locator('.vf-theme-toggle-dragon-muzzle-detail')).toHaveCount(1);
  await expect(art.locator('path')).toHaveCount(5);
  await expect(art.locator('circle')).toHaveCount(2);
  await expect(art.locator('ellipse')).toHaveCount(1);
}

test('docs AppShell and showcase use the canonical smooth dragon asset and motion', async ({ page }, testInfo) => {
  const canonical = await readFile(canonicalArtworkUrl, 'utf8');
  const canonicalPaths = normalizedPathData(canonical);

  await page.goto('/next/native-web/');
  await page.evaluate(() => localStorage.removeItem('vf-docs-theme'));
  await page.reload();

  const headerRoot = page.locator('.vf-docs-theme-control [data-vf-theme-toggle]');
  const headerControl = headerRoot.getByRole('switch', { name: 'Dark theme' });
  const headerDragon = headerRoot.locator('[data-vf-theme-toggle-dragon]');
  const headerArt = headerDragon.locator('svg.vf-theme-toggle-dragon-art');

  await expect(headerDragon).toHaveAttribute('data-vf-theme-toggle-dragon-artwork', '');
  await expectArtwork(headerArt);
  const headerGeometry = await artworkGeometry(headerArt);
  expect(headerGeometry.paths).toEqual(canonicalPaths);

  const lightTransform = await headerDragon.evaluate((element) => getComputedStyle(element).transform);
  const lightFill = await headerArt.locator('.vf-theme-toggle-dragon-silhouette')
    .evaluate((element) => getComputedStyle(element).fill);

  await headerControl.click();
  await expect(headerControl).toBeChecked();
  await expect.poll(() => headerDragon.evaluate((element) => getComputedStyle(element).transform)).not.toBe(lightTransform);
  await expect.poll(() => headerArt.locator('.vf-theme-toggle-dragon-silhouette')
    .evaluate((element) => getComputedStyle(element).fill)).not.toBe(lightFill);
  await page.waitForTimeout(720);
  await headerRoot.screenshot({ path: testInfo.outputPath('native-docs-header-theme-toggle-dark.png') });

  await page.goto('/next/native-web/components/theme-toggle/');
  const showcaseRoot = page.locator('[data-vf-docs-example] [data-vf-theme-toggle]').first();
  const showcaseDragon = showcaseRoot.locator('[data-vf-theme-toggle-dragon]');
  const showcaseArt = showcaseDragon.locator('svg.vf-theme-toggle-dragon-art');

  await expectArtwork(showcaseArt);
  expect(await artworkGeometry(showcaseArt)).toEqual(headerGeometry);

  const showcaseControl = showcaseRoot.getByRole('switch', { name: 'Dark theme' });
  const showcaseLightTransform = await showcaseDragon.evaluate((element) => getComputedStyle(element).transform);
  await showcaseControl.check();
  await expect(showcaseControl).toBeChecked();
  await expect.poll(() => showcaseDragon.evaluate((element) => getComputedStyle(element).transform)).not.toBe(showcaseLightTransform);
  await page.waitForTimeout(720);
  await showcaseRoot.screenshot({ path: testInfo.outputPath('native-showcase-theme-toggle-dark.png') });
});
