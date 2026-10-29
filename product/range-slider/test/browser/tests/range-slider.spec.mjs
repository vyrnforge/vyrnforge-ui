import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('range slider exposes labelled native ranges', async ({ page }) => {
  await page.goto(`/components/range-slider/${port}.html`);
  await expect(page.locator('#min')).toHaveAttribute('aria-label', 'Minimum');
  await expect(page.locator('#max')).toHaveAttribute('aria-label', 'Maximum');
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('public RangeSlider CSS resolves canonical root spacing in light and dark themes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/range-slider/web.html');
  const root = page.locator('#root');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(root).toHaveCSS('gap', '8px');
  }
});
