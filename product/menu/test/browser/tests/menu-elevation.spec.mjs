import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'web';

test('public Menu CSS uses canonical medium elevation without a global z-index token', async ({ page }) => {
  test.skip(port !== 'web', 'Public elevation evidence is owned by the Web lane.');
  await page.goto('/components/menu/web.html');

  const menu = page.locator('#web-menu');
  await expect(menu).not.toHaveCSS('box-shadow', 'none');
  await expect(menu).toHaveCSS('z-index', 'auto');

  await menu.evaluate((element) => element.style.setProperty('--vf-shadow-md', '0 0 0 7px rgb(1 2 3)'));
  await expect(menu).toHaveCSS('box-shadow', 'rgb(1, 2, 3) 0px 0px 0px 7px');

  await page.emulateMedia({ forcedColors: 'active' });
  await expect(menu).toHaveCSS('box-shadow', 'none');
});
