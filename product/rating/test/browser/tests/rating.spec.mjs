import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('rating uses native radio selection', async ({ page }) => {
  await page.goto(`/components/rating/${port}.html`);
  await page.locator('#five').check();
  await expect(page.locator('#five')).toBeChecked();
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('public Rating CSS resolves canonical compact spacing and focus ring in light and dark themes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  const themes = [
    ['light', 'rgb(47, 111, 237)'],
    ['dark', 'rgb(141, 180, 255)'],
  ];
  for (const [theme, focusColor] of themes) {
    await page.goto('/components/rating/web.html');
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(page.locator('#root')).toHaveCSS('gap', '4px');
    await page.keyboard.press('Tab');
    await expect(page.locator('#one')).toBeFocused();
    await expect(page.locator('#one-item')).toHaveCSS('outline-color', focusColor);
  }
});
