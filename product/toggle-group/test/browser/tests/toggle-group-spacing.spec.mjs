import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'react';

test('public ToggleGroup CSS uses canonical medium item inset and preserves overrides in forced colors', async ({ page }) => {
  test.skip(port !== 'web', 'Public spacing evidence is owned by the Web lane.');
  await page.goto('/components/toggle-group/web.html');

  const group = page.locator('#group');
  const item = page.locator('#bold');
  await expect(item).toHaveCSS('padding-left', '16px');
  await expect(item).toHaveCSS('padding-right', '16px');

  await group.evaluate((element) => element.style.setProperty('--vf-space-md', '20px'));
  await expect(item).toHaveCSS('padding-left', '20px');
  await expect(item).toHaveCSS('padding-right', '20px');

  await page.emulateMedia({ forcedColors: 'active' });
  await expect(item).toHaveCSS('padding-left', '20px');
});
