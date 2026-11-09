import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Kbd preserves native semantics and visible key presentation', async ({ page }) => {
  await page.goto('/components/kbd/web.html');
  const kbd = page.locator('#kbd');
  await expect(kbd).toHaveJSProperty('tagName', 'KBD');
  expect(await kbd.evaluate((el) => getComputedStyle(el).display)).toBe('inline-block');
  expect(await kbd.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/mono/i);
  await page.emulateMedia({ forcedColors: 'active' });
  expect(await kbd.evaluate((el) => getComputedStyle(el).borderTopStyle)).toBe('solid');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
