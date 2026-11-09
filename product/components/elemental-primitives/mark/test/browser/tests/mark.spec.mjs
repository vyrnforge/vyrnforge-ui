import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Mark preserves native semantics, token overrides, and forced-colors emphasis', async ({ page }) => {
  await page.goto('/components/mark/web.html');
  const mark = page.locator('#mark');
  await expect(mark).toHaveJSProperty('tagName', 'MARK');
  expect(await page.locator('#scoped').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(200, 225, 255)');
  await page.emulateMedia({ forcedColors: 'active' });
  const colors = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.backgroundColor = 'Highlight';
    probe.style.color = 'HighlightText';
    document.body.append(probe);
    const expectedBackground = getComputedStyle(probe).backgroundColor;
    const expectedText = getComputedStyle(probe).color;
    probe.remove();
    const actual = getComputedStyle(document.querySelector('#mark'));
    return { expectedBackground, expectedText, background: actual.backgroundColor, color: actual.color };
  });
  expect(colors.background).toBe(colors.expectedBackground);
  expect(colors.color).toBe(colors.expectedText);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
