import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'react';

test('public Select CSS uses canonical medium trigger inset and preserves overrides in forced colors', async ({ page }) => {
  test.skip(port !== 'web', 'Public spacing evidence is owned by the Web lane.');
  await page.goto('/components/select/web.html');

  const trigger = page.locator('#trigger');
  await expect(trigger).toHaveCSS('padding-left', '16px');
  await expect(trigger).toHaveCSS('padding-right', '16px');

  await trigger.evaluate((element) => element.style.setProperty('--vf-space-md', '20px'));
  await expect(trigger).toHaveCSS('padding-left', '20px');
  await expect(trigger).toHaveCSS('padding-right', '20px');

  await page.emulateMedia({ forcedColors: 'active' });
  await expect(trigger).toHaveCSS('padding-left', '20px');
});
