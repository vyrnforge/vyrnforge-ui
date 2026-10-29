import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('menubar moves focus horizontally', async ({ page }) => {
  await page.goto(`/components/menubar/${port}.html`);
  await page.locator('#file').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#edit')).toBeFocused();
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('public Menubar CSS resolves canonical compact spacing in light and dark themes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/menubar/web.html');
  const bar = page.locator('#bar');
  const file = page.locator('#file');

  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(bar).toHaveCSS('gap', '4px');
    await expect(bar).toHaveCSS('padding-top', '4px');
    await expect(bar).toHaveCSS('padding-left', '4px');
    await expect(file).toHaveCSS('padding-left', '8px');
    await expect(file).toHaveCSS('padding-right', '8px');
  }
});
