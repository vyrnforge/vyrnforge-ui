import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('ColorSwatch keeps a textual accessible equivalent and visible boundary', async ({ page }) => {
  await page.goto('/components/color-swatch/web.html');
  const swatch = page.locator('#swatch');
  await expect(swatch).toHaveAttribute('aria-label', 'Brand blue');
  expect(await swatch.evaluate((el) => getComputedStyle(el).width)).toBe('20px');
  expect(await swatch.evaluate((el) => getComputedStyle(el).height)).toBe('20px');
  await page.emulateMedia({ forcedColors: 'active' });
  expect(await swatch.evaluate((el) => getComputedStyle(el).borderTopStyle)).toBe('solid');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
