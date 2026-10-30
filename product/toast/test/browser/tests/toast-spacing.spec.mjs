import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'react';

test('public Toast CSS uses canonical viewport and surface rhythm and preserves overrides in forced colors', async ({ page }) => {
  test.skip(port !== 'web', 'Public spacing evidence is owned by the Web lane.');
  await page.goto('/components/toast/web.html');

  const viewport = page.locator('#viewport');
  const toast = page.locator('#controlled-toast');
  await expect(viewport).toHaveCSS('gap', '8px');
  await expect(viewport).toHaveCSS('right', '16px');
  await expect(viewport).toHaveCSS('bottom', '16px');
  await expect(toast).toHaveCSS('row-gap', '4px');
  await expect(toast).toHaveCSS('column-gap', '16px');
  await expect(toast).toHaveCSS('padding-left', '16px');

  await viewport.evaluate((element) => {
    element.style.setProperty('--vf-space-xs', '6px');
    element.style.setProperty('--vf-space-sm', '10px');
    element.style.setProperty('--vf-space-md', '20px');
  });
  await expect(viewport).toHaveCSS('gap', '10px');
  await expect(viewport).toHaveCSS('right', '20px');
  await expect(toast).toHaveCSS('row-gap', '6px');
  await expect(toast).toHaveCSS('column-gap', '20px');
  await expect(toast).toHaveCSS('padding-left', '20px');

  await page.emulateMedia({ forcedColors: 'active' });
  await expect(toast).toHaveCSS('padding-left', '20px');
});
