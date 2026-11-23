import { test, expect } from '@playwright/test';
import { defineNativeControlBrowserTests } from '../../../../../../_test-support/native-controls/native-control-browser-tests.mjs';

await defineNativeControlBrowserTests('toggle-button');

const port = process.env.VF_COMPONENT_PORT || 'web';

test('icon-only ToggleButton has a square target and keeps native pressed/focus behavior', async ({ page }) => {
  test.skip(port !== 'web', 'Framework marker propagation is covered by each port SSR test');
  await page.goto('/components/toggle-button/web.html');
  const toggle = page.locator('#control');
  await toggle.evaluate(element => {
    element.setAttribute('data-vf-icon-only', '');
    element.setAttribute('aria-label', 'Pin document');
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('width', '20');
    icon.setAttribute('height', '20');
    icon.setAttribute('aria-hidden', 'true');
    element.replaceChildren(icon);
  });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(toggle).toHaveAttribute('data-vf-icon-only', '');
  await expect(toggle).toHaveCSS('width', '40px');
  await expect(toggle).toHaveCSS('height', '40px');
  await toggle.focus();
  await expect(toggle).toBeFocused();
  await toggle.press('Space');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(toggle).toHaveCSS('background-color', 'rgb(243, 247, 255)');
  await page.evaluate(() => { document.documentElement.dataset.vfDensity = 'compact'; });
  const compact = await toggle.evaluate(el => {
    const rect = el.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  expect(compact.width).toBe(compact.height);
  expect(compact.width).toBeGreaterThanOrEqual(32);
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(toggle).toBeFocused();
  await toggle.screenshot({ path: test.info().outputPath('toggle-icon-only-forced-colors.png') });
});
