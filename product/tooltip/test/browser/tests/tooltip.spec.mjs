import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('tooltip relationship is accessible', async ({ page }) => {
  await page.goto(`/components/tooltip/${port}.html`);
  await expect(page.getByRole('tooltip')).toBeVisible();
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('public Tooltip CSS resolves the canonical control radius in light and dark themes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/tooltip/web.html');
  const tooltip = page.getByRole('tooltip');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(tooltip).toHaveCSS('border-radius', '6px');
  }
});
