import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('temporal field preserves native temporal input semantics', async ({ page }) => {
  await page.goto(`/components/temporal-field/${port}.html`);
  await expect(page.locator('#date')).toHaveAttribute('type', 'date');
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('public TemporalField CSS resolves canonical compact spacing in light and dark themes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/temporal-field/web.html');
  const root = page.locator('#root');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(root).toHaveCSS('gap', '4px');
  }
});
