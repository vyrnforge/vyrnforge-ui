import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Code preserves native semantics and presentation', async ({ page }) => {
  await page.goto('/components/code/web.html');
  const inline = page.locator('#inline');
  const block = page.locator('#block');
  await expect(inline).toHaveJSProperty('tagName', 'CODE');
  await expect(block).toHaveJSProperty('tagName', 'PRE');
  expect(await inline.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/mono/i);
  expect(await inline.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  await page.emulateMedia({ forcedColors: 'active' });
  expect(await block.evaluate((el) => getComputedStyle(el).borderTopStyle)).toBe('solid');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
