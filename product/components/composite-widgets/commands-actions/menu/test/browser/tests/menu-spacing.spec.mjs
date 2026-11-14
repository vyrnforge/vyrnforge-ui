import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'web';

test('public Menu CSS uses canonical compact container rhythm plus medium item inset and preserves overrides in forced colors', async ({ page }) => {
  test.skip(port !== 'web', 'Public spacing evidence is owned by the Web lane.');
  await page.goto('/components/menu/web.html');

  const menu = page.locator('#web-menu');
  const item = page.locator('#web-edit');
  await expect(menu).toHaveCSS('padding-top', '8px');
  await expect(menu).toHaveCSS('padding-left', '8px');
  await expect(item).toHaveCSS('gap', '8px');
  await expect(item).toHaveCSS('padding-top', '8px');
  await expect(item).toHaveCSS('padding-left', '16px');

  await menu.evaluate((element) => {
    element.style.setProperty('--vf-space-sm', '10px');
    element.style.setProperty('--vf-space-md', '20px');
  });
  await expect(menu).toHaveCSS('padding-left', '10px');
  await expect(item).toHaveCSS('gap', '10px');
  await expect(item).toHaveCSS('padding-left', '20px');

  await page.emulateMedia({ forcedColors: 'active' });
  await expect(item).toHaveCSS('padding-left', '20px');
});
