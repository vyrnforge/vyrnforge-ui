import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'react';

test('public Toast CSS preserves its boundary in forced-colors mode', async ({ page }) => {
  test.skip(port !== 'web', 'Public forced-colors evidence is owned by the Web lane.');
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/components/toast/web.html');

  const toast = page.locator('#controlled-toast');
  await expect(toast).toBeVisible();
  await expect(toast).toHaveCSS('border-top-width', '1px');
});
