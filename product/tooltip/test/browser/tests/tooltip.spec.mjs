import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('tooltip relationship is accessible', async ({ page }) => {
  await page.goto(`/components/tooltip/${port}.html`);
  await expect(page.getByRole('tooltip')).toBeVisible();
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('public Tooltip CSS resolves canonical control radius and typography in light, dark, and forced-colors modes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/tooltip/web.html');
  const tooltip = page.getByRole('tooltip');

  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(tooltip).toHaveCSS('border-radius', '6px');
    await expect(tooltip).toHaveCSS('font-size', '15px');
    await expect(tooltip).toHaveCSS('font-weight', '600');
    expect(await tooltip.evaluate((element) => getComputedStyle(element).fontFamily)).toContain('ui-sans-serif');
  }

  await page.locator('html').evaluate((element) => {
    element.style.setProperty('--vf-control-font-family', 'monospace');
    element.style.setProperty('--vf-control-font-size', '18px');
    element.style.setProperty('--vf-control-font-weight', '700');
  });
  await expect(tooltip).toHaveCSS('font-family', 'monospace');
  await expect(tooltip).toHaveCSS('font-size', '18px');
  await expect(tooltip).toHaveCSS('font-weight', '700');

  await page.locator('html').evaluate((element) => {
    element.style.removeProperty('--vf-control-font-family');
    element.style.removeProperty('--vf-control-font-size');
    element.style.removeProperty('--vf-control-font-weight');
  });
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(tooltip).toHaveCSS('border-radius', '6px');
  await expect(tooltip).toHaveCSS('font-size', '15px');
  await expect(tooltip).toHaveCSS('font-weight', '600');
});
