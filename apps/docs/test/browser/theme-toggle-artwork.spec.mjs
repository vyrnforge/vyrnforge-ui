import { test, expect } from '@playwright/test';

async function dragonGeometry(locator) {
  return locator.evaluate((svg) => ({
    viewBox: svg.getAttribute('viewBox'),
    paths: [...svg.querySelectorAll('path')].map((path) => ({
      className: path.getAttribute('class'),
      d: path.getAttribute('d'),
    })),
    circles: [...svg.querySelectorAll('circle')].map((circle) => ({
      className: circle.getAttribute('class'),
      cx: circle.getAttribute('cx'),
      cy: circle.getAttribute('cy'),
      r: circle.getAttribute('r'),
    })),
  }));
}

async function expectDragonAnatomy(art) {
  await expect(art).toHaveAttribute('viewBox', '0 0 72 56');
  await expect(art.locator('.vf-theme-toggle-dragon-body')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-tail')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-tail-plume')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-head')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-mane')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-horns')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-whiskers')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-foreleg')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-body-detail')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-face-detail')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-eye')).toHaveCount(1);
  await expect(art.locator('path')).toHaveCount(10);
  await expect(art.locator('circle')).toHaveCount(1);
}

test('docs AppShell uses the same detailed serpentine dragon artwork as the Theme Toggle showcase', async ({ page }, testInfo) => {
  await page.goto('/next/native-web/');
  await page.evaluate(() => localStorage.removeItem('vf-docs-theme'));
  await page.reload();

  const headerRoot = page.locator('.vf-docs-theme-control [data-vf-theme-toggle]');
  const headerControl = headerRoot.getByRole('switch', { name: 'Dark theme' });
  const headerDragon = headerRoot.locator('[data-vf-theme-toggle-dragon]');
  const headerArt = headerDragon.locator('svg.vf-theme-toggle-dragon-art');

  await expect(headerDragon).toHaveAttribute('data-vf-theme-toggle-dragon-artwork', '');
  await expect(headerArt).toHaveCount(1);
  await expectDragonAnatomy(headerArt);

  const lightTransform = await headerDragon.evaluate((element) => getComputedStyle(element).transform);
  const lightColor = await headerDragon.evaluate((element) => getComputedStyle(element).color);

  await headerControl.click();
  await expect(headerControl).toBeChecked();
  await expect.poll(() => headerDragon.evaluate((element) => getComputedStyle(element).transform)).not.toBe(lightTransform);
  await expect.poll(() => headerDragon.evaluate((element) => getComputedStyle(element).color)).not.toBe(lightColor);
  await page.waitForTimeout(650);
  await headerRoot.screenshot({ path: testInfo.outputPath('native-docs-header-theme-toggle-dark.png') });

  const headerGeometry = await dragonGeometry(headerArt);

  await page.goto('/next/native-web/components/theme-toggle/');
  const showcaseRoot = page.locator('[data-vf-docs-example] [data-vf-theme-toggle]').first();
  const showcaseDragon = showcaseRoot.locator('[data-vf-theme-toggle-dragon]');
  const showcaseArt = showcaseDragon.locator('svg.vf-theme-toggle-dragon-art');

  await expect(showcaseDragon).toHaveAttribute('data-vf-theme-toggle-dragon-artwork', '');
  await expect(showcaseArt).toHaveCount(1);
  await expectDragonAnatomy(showcaseArt);
  expect(await dragonGeometry(showcaseArt)).toEqual(headerGeometry);

  const showcaseControl = showcaseRoot.getByRole('switch', { name: 'Dark theme' });
  const showcaseLightTransform = await showcaseDragon.evaluate((element) => getComputedStyle(element).transform);
  await showcaseControl.check();
  await expect(showcaseControl).toBeChecked();
  await expect.poll(() => showcaseDragon.evaluate((element) => getComputedStyle(element).transform)).not.toBe(showcaseLightTransform);
  await page.waitForTimeout(650);
  await showcaseRoot.screenshot({ path: testInfo.outputPath('native-showcase-theme-toggle-dark.png') });
});
