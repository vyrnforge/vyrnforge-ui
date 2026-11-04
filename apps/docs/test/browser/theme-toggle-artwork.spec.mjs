import { test, expect } from '@playwright/test';

async function dragonGeometry(locator) {
  return locator.evaluate((svg) => ({
    viewBox: svg.getAttribute('viewBox'),
    paths: [...svg.querySelectorAll('path')].map((path) => ({
      className: path.getAttribute('class'),
      d: path.getAttribute('d'),
      fillRule: path.getAttribute('fill-rule'),
    })),
  }));
}

async function expectDragonArtwork(art) {
  await expect(art).toHaveAttribute('viewBox', '0 0 402 200');
  await expect(art.locator('.vf-theme-toggle-dragon-primary')).toHaveCount(2);
  await expect(art.locator('.vf-theme-toggle-dragon-secondary')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-gold')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-highlight')).toHaveCount(3);
  await expect(art.locator('.vf-theme-toggle-dragon-whisker')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-eye')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-eye-slit')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-face-line')).toHaveCount(1);
  await expect(art.locator('path')).toHaveCount(11);
  await expect(art.locator('circle')).toHaveCount(0);
}

test('docs AppShell and showcase use the exact same approved traced dragon geometry', async ({ page }, testInfo) => {
  await page.goto('/next/native-web/');
  await page.evaluate(() => localStorage.removeItem('vf-docs-theme'));
  await page.reload();

  const headerRoot = page.locator('.vf-docs-theme-control [data-vf-theme-toggle]');
  const headerControl = headerRoot.getByRole('switch', { name: 'Dark theme' });
  const headerDragon = headerRoot.locator('[data-vf-theme-toggle-dragon]');
  const headerArt = headerDragon.locator('svg.vf-theme-toggle-dragon-art');

  await expect(headerDragon).toHaveAttribute('data-vf-theme-toggle-dragon-artwork', '');
  await expect(headerArt).toHaveCount(1);
  await expectDragonArtwork(headerArt);

  const lightTransform = await headerDragon.evaluate((element) => getComputedStyle(element).transform);
  const lightPrimary = await headerArt.locator('.vf-theme-toggle-dragon-primary').first()
    .evaluate((element) => getComputedStyle(element).fill);

  await headerControl.click();
  await expect(headerControl).toBeChecked();
  await expect.poll(() => headerDragon.evaluate((element) => getComputedStyle(element).transform)).not.toBe(lightTransform);
  await expect.poll(() => headerArt.locator('.vf-theme-toggle-dragon-primary').first()
    .evaluate((element) => getComputedStyle(element).fill)).not.toBe(lightPrimary);
  await page.waitForTimeout(650);
  await headerRoot.screenshot({ path: testInfo.outputPath('native-docs-header-theme-toggle-dark.png') });

  const headerGeometry = await dragonGeometry(headerArt);

  await page.goto('/next/native-web/components/theme-toggle/');
  const showcaseRoot = page.locator('[data-vf-docs-example] [data-vf-theme-toggle]').first();
  const showcaseDragon = showcaseRoot.locator('[data-vf-theme-toggle-dragon]');
  const showcaseArt = showcaseDragon.locator('svg.vf-theme-toggle-dragon-art');

  await expect(showcaseDragon).toHaveAttribute('data-vf-theme-toggle-dragon-artwork', '');
  await expect(showcaseArt).toHaveCount(1);
  await expectDragonArtwork(showcaseArt);
  expect(await dragonGeometry(showcaseArt)).toEqual(headerGeometry);

  const showcaseControl = showcaseRoot.getByRole('switch', { name: 'Dark theme' });
  const showcaseLightTransform = await showcaseDragon.evaluate((element) => getComputedStyle(element).transform);
  await showcaseControl.check();
  await expect(showcaseControl).toBeChecked();
  await expect.poll(() => showcaseDragon.evaluate((element) => getComputedStyle(element).transform)).not.toBe(showcaseLightTransform);
  await page.waitForTimeout(650);
  await showcaseRoot.screenshot({ path: testInfo.outputPath('native-showcase-theme-toggle-dark.png') });
});
