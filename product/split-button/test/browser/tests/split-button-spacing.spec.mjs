import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'react';

test('public SplitButton CSS uses canonical medium action inset and preserves overrides in forced colors', async ({ page }) => {
  test.skip(port !== 'web', 'Public spacing evidence is owned by the Web lane.');
  await page.goto('/components/split-button/web.html');

  const root = page.locator('[data-vf-split-button-root]');
  const action = page.locator('#action');
  await expect(action).toHaveCSS('padding-left', '16px');
  await expect(action).toHaveCSS('padding-right', '16px');

  await root.evaluate((element) => element.style.setProperty('--vf-space-md', '20px'));
  await expect(action).toHaveCSS('padding-left', '20px');
  await expect(action).toHaveCSS('padding-right', '20px');

  await page.emulateMedia({ forcedColors: 'active' });
  await expect(action).toHaveCSS('padding-left', '20px');
});
