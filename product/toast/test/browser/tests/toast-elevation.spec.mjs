import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'react';

test('public Toast CSS uses canonical medium elevation without a global z-index token', async ({ page }) => {
  test.skip(port !== 'web', 'Public elevation evidence is owned by the Web lane.');
  await page.goto('/components/toast/web.html');

  const viewport = page.locator('#viewport');
  const toast = page.locator('#controlled-toast');
  await expect(viewport).toHaveCSS('z-index', 'auto');
  await expect(toast).not.toHaveCSS('box-shadow', 'none');

  await toast.evaluate((element) => element.style.setProperty('--vf-shadow-md', '0 0 0 7px rgb(1 2 3)'));
  await expect(toast).toHaveCSS('box-shadow', 'rgb(1, 2, 3) 0px 0px 0px 7px');

  await page.emulateMedia({ forcedColors: 'active' });
  await expect(toast).toHaveCSS('box-shadow', 'none');
});
