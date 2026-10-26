import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';
const port = process.env.VF_COMPONENT_PORT || 'web';

test('Icon exposes one semantic contract across ports', async ({ page }) => {
  await page.goto(`/next/icon-fixtures/${port}.html`);
  const decorative = page.locator('#decorative').locator('[data-vf-icon]').or(page.locator('#decorative[data-vf-icon]'));
  const meaningful = page.locator('#meaningful').locator('[data-vf-icon]').or(page.locator('#meaningful[data-vf-icon]'));
  await expect(decorative).toHaveAttribute('aria-hidden', 'true');
  await expect(decorative).toHaveAttribute('data-vf-variant', 'outlined');
  await expect(decorative).toHaveAttribute('data-vf-shape', 'rounded');
  await expect(meaningful).toHaveAttribute('role', 'img');
  await expect(meaningful).toHaveAttribute('aria-label', 'Bookmark');
  await expect(meaningful).toHaveAttribute('data-vf-variant', port === 'web' ? 'outlined' : 'filled');
  await expect(meaningful).toHaveAttribute('data-vf-size', 'lg');
  expect(await meaningful.evaluate((element) => getComputedStyle(element).inlineSize)).toBe('24px');
  await page.addScriptTag({ content: axeCore.source });
  const results = await page.evaluate(async () => globalThis.axe.run(document));
  expect(results.violations).toEqual([]);
});
