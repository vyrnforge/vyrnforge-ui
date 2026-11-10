import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Image preserves native img semantics and responsive presentation', async ({ page }) => {
  await page.goto('/components/image/web.html');
  const image = page.locator('#image');

  await expect(image).toHaveJSProperty('tagName', 'IMG');
  await expect(image).toHaveAttribute('alt', 'Sample placeholder');
  await expect(image).toHaveAttribute('width', '16');
  await expect(image).toHaveAttribute('height', '16');
  await expect(image).toHaveAttribute('loading', 'lazy');
  await expect(image).toHaveAttribute('decoding', 'async');
  await expect(image).toHaveAttribute('fetchpriority', 'low');
  await expect(image).toHaveAttribute('referrerpolicy', 'no-referrer');
  await expect(image).toHaveAttribute('sizes', '16px');

  expect(await image.evaluate((el) => getComputedStyle(el).display)).toBe('block');
  expect(await image.evaluate((el) => getComputedStyle(el).maxInlineSize)).toBe('100%');
  expect(await image.evaluate((el) => getComputedStyle(el).blockSize)).toBe('16px');

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
