import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Progress independent Web presentation and accessibility', async ({ page }) => {
  test.skip((process.env.VF_COMPONENT_PORT || 'web') !== 'web', 'Native Web CSS fixture');
  await page.goto('/components/progress/web.html');
  await expect(page.getByRole('progressbar', { name: 'Upload' })).toHaveJSProperty('value', 48);
  await expect(page.getByRole('progressbar', { name: 'Preparing' })).not.toHaveAttribute('value');
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.getByRole('progressbar', { name: 'Upload' })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
