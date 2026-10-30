import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('split panel exposes keyboard-resizable separator semantics', async ({ page }) => {
  await page.goto(`/components/split-panel/${port}.html`);
  await page.locator('#handle').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#handle')).toHaveAttribute('aria-valuenow', '51');
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('public SplitPanel CSS resolves the canonical boundary and focus ring in light, dark, and forced-colors modes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/split-panel/web.html');
  const handle = page.locator('#handle');
  const themeTokens = {
    light: { border: 'rgb(212, 212, 216)', focusRing: 'rgb(47, 111, 237)' },
    dark: { border: 'rgb(63, 63, 70)', focusRing: 'rgb(141, 180, 255)' },
  };

  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(handle).toHaveCSS('background-color', themeTokens[theme].border);
    await handle.focus();
    await expect(handle).toHaveCSS('outline-width', '2px');
    await expect(handle).toHaveCSS('outline-color', themeTokens[theme].focusRing);
  }

  await page.emulateMedia({ forcedColors: 'active' });
  await expect(handle).toBeVisible();
  await expect(handle).toHaveCSS('width', '6px');
});
