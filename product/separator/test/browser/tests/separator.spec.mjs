import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const port = process.env.VF_COMPONENT_PORT || 'web';
test('Separator preserves native semantics and orientation across ports', async ({ page }) => {
  await page.goto(`/components/separator/${port}.html`);
  const horizontal = page.locator('#horizontal');
  const vertical = page.locator('#vertical');
  await expect(horizontal).toHaveJSProperty('tagName', 'HR');
  await expect(horizontal).toHaveAttribute('data-vf-separator-orientation', 'horizontal');
  await expect(vertical).toHaveJSProperty('tagName', 'HR');
  await expect(vertical).toHaveAttribute('data-vf-separator-orientation', 'vertical');
  await expect(vertical).toHaveAttribute('aria-orientation', 'vertical');
  expect(await horizontal.evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe('1px');
  expect(await vertical.evaluate((el) => getComputedStyle(el).borderLeftWidth)).toBe('1px');
  await page.addScriptTag({ content: axeCore.source });
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
