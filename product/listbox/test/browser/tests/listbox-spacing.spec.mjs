import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'web';

test('public Listbox CSS uses canonical medium option inset and preserves overrides in forced colors', async ({ page }) => {
  test.skip(port !== 'web', 'Public spacing evidence is owned by the Web lane.');
  await page.goto('/components/listbox/web.html');

  const listbox = page.locator('#web-list');
  const option = page.locator('#web-one');
  await expect(option).toHaveCSS('padding-left', '16px');
  await expect(option).toHaveCSS('padding-right', '16px');

  await listbox.evaluate((element) => element.style.setProperty('--vf-space-md', '20px'));
  await expect(option).toHaveCSS('padding-left', '20px');
  await expect(option).toHaveCSS('padding-right', '20px');

  await page.emulateMedia({ forcedColors: 'active' });
  await expect(option).toHaveCSS('padding-left', '20px');
});
