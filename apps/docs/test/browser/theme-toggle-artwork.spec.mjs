import { test, expect } from '@playwright/test';

async function dragonGeometry(locator) {
  return locator.evaluate((svg) => ({
    viewBox: svg.getAttribute('viewBox'),
    paths: [...svg.querySelectorAll('path')].map((path) => ({
      className: path.getAttribute('class'),
      d: path.getAttribute('d'),
    })),
    ellipses: [...svg.querySelectorAll('ellipse')].map((ellipse) => ({
      className: ellipse.getAttribute('class'),
      cx: ellipse.getAttribute('cx'),
      cy: ellipse.getAttribute('cy'),
      rx: ellipse.getAttribute('rx'),
      ry: ellipse.getAttribute('ry'),
    })),
  }));
}

async function expectDragonAnatomy(art) {
  await expect(art).toHaveAttribute('viewBox', '0 0 104 48');
  await expect(art.locator('.vf-theme-toggle-dragon-crest')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-upper-jaw')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-brow')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-lower-jaw')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-fangs')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-eye')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-nostril')).toHaveCount(1);
  await expect(art.locator('.vf-theme-toggle-dragon-mouth-glow')).toHaveCount(1);
}

test('docs AppShell uses the same Native dragon-mouth artwork as the Theme Toggle showcase', async ({ page }, testInfo) => {
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

  await headerControl.click();
  await expect(headerControl).toBeChecked();
  await expect.poll(() => headerDragon.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
  await page.waitForTimeout(600);
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
  await showcaseControl.check();
  await expect(showcaseControl).toBeChecked();
  await expect.poll(() => showcaseDragon.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
  await page.waitForTimeout(600);
  await showcaseRoot.screenshot({ path: testInfo.outputPath('native-showcase-theme-toggle-dark.png') });
});
