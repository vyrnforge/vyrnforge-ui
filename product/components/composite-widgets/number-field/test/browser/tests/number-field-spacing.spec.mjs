import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'react';

test('public NumberField CSS uses canonical medium control inset and preserves overrides in forced colors', async ({ page }) => {
  test.skip(port !== 'web', 'Public spacing evidence is owned by the Web lane.');
  await page.goto('/components/number-field/web.html');

  const input = page.locator('#input');
  await expect(input).toHaveCSS('padding-left', '16px');
  await expect(input).toHaveCSS('padding-right', '16px');

  await input.evaluate((element) => element.style.setProperty('--vf-space-md', '20px'));
  await expect(input).toHaveCSS('padding-left', '20px');
  await expect(input).toHaveCSS('padding-right', '20px');

  await page.emulateMedia({ forcedColors: 'active' });
  await expect(input).toHaveCSS('padding-left', '20px');
});
