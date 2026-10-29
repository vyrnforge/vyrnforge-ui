import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('color picker synchronizes accessible inputs', async ({ page }) => {
  await page.goto(`/components/color-picker/${port}.html`);
  await page.locator('#text').fill('#ff0000');
  await expect(page.locator('#color')).toHaveValue('#ff0000');
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('public ColorPicker CSS resolves canonical spacing and control radius in light and dark themes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/color-picker/web.html');
  const root = page.locator('#root');
  const swatch = page.locator('#swatch');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(root).toHaveCSS('gap', '8px');
    await expect(swatch).toHaveCSS('border-top-left-radius', '6px');
    await expect(swatch).toHaveCSS('border-top-right-radius', '6px');
  }
});
