import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('number field steps a native numeric value', async ({ page }) => {
  await page.goto(`/components/number-field/${port}.html`);
  await page.locator('#inc').click();
  await expect(page.locator('#input')).toHaveValue('3');
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('public NumberField CSS resolves the canonical control radius in light and dark themes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/number-field/web.html');
  const input = page.locator('#input');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(input).toHaveCSS('border-radius', '6px');
  }
});
