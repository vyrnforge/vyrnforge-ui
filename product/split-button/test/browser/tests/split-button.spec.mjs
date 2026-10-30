import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

const expectedThemeColors = {
  light: {
    background: 'rgb(36, 94, 219)',
    foreground: 'rgb(255, 255, 255)',
    border: 'rgb(212, 212, 216)',
  },
  dark: {
    background: 'rgb(141, 180, 255)',
    foreground: 'rgb(11, 31, 77)',
    border: 'rgb(63, 63, 70)',
  },
};

test('split button keeps primary action independent', async ({ page }) => {
  await page.goto(`/components/split-button/${port}.html`);
  await page.locator('#action').click();
  expect(await page.evaluate(() => window.primary())).toBe(1);
  await expect(page.locator('#menu')).toBeHidden();
  await page.locator('#trigger').click();
  await expect(page.locator('#menu')).toBeVisible();
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('public SplitButton CSS resolves canonical accent and border colors in light and dark themes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/split-button/web.html');
  const action = page.locator('#action');
  const trigger = page.locator('#trigger');

  for (const [theme, expected] of Object.entries(expectedThemeColors)) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    for (const control of [action, trigger]) {
      await expect(control).toHaveCSS('background-color', expected.background);
      await expect(control).toHaveCSS('color', expected.foreground);
      await expect(control).toHaveCSS('border-top-color', expected.border);
    }
  }
});
