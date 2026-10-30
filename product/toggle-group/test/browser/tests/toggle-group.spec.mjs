import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('toggle group exposes pressed state', async ({ page }) => {
  await page.goto(`/components/toggle-group/${port}.html`);
  await page.locator('#bold').click();
  await expect(page.locator('#bold')).toHaveAttribute('aria-pressed', 'true');
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('public ToggleGroup CSS resolves canonical subtle surface and control radii in light, dark, and forced-colors modes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/toggle-group/web.html');
  const group = page.locator('#group');
  const item = page.locator('#bold');
  const subtleSurfaceByTheme = {
    light: 'rgb(250, 250, 250)',
    dark: 'rgb(9, 9, 11)',
  };

  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(group).toHaveCSS('background-color', subtleSurfaceByTheme[theme]);
    await expect(group).toHaveCSS('border-radius', '6px');
    await expect(item).toHaveCSS('border-radius', '4px');
  }

  await page.emulateMedia({ forcedColors: 'active' });
  await expect(group).toHaveCSS('border-top-width', '1px');
});
