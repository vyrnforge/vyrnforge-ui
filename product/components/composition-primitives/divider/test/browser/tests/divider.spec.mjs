import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT === 'react' ? 'react' : 'web';

test('visual Divider provides real horizontal and vertical geometry without semantic role', async ({ page }) => {
  await page.goto('/components/divider/' + port + '.html');
  const horizontal = page.locator('#horizontal');
  const vertical = page.locator('#vertical');
  for (const line of [horizontal, vertical]) {
    await expect(line).toHaveJSProperty('tagName', 'SPAN');
    await expect(line).toHaveAttribute('aria-hidden', 'true');
    await expect(line).not.toHaveAttribute('role');
    await expect(line).not.toHaveAttribute('tabindex');
    await expect(line).toHaveCSS('pointer-events', 'none');
  }
  await expect(horizontal).toHaveAttribute('data-vf-divider-orientation', 'horizontal');
  await expect(vertical).toHaveAttribute('data-vf-divider-orientation', 'vertical');
  const h = await horizontal.boundingBox();
  const v = await vertical.boundingBox();
  expect(h.width).toBeGreaterThan(200);
  expect(h.height).toBe(1);
  expect(v.width).toBe(1);
  expect(v.height).toBeGreaterThan(20);
  await expect(page.getByRole('separator')).toHaveCount(0);
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations).toEqual([]);
});

test('Divider uses theme tokens, visible forced-colors paint and logical geometry', async ({ page }) => {
  await page.goto('/components/divider/' + port + '.html');
  const horizontal = page.locator('#horizontal');
  const vertical = page.locator('#vertical');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((el, value) => el.dataset.vfTheme = value, theme);
    const lineColor = await horizontal.evaluate(el => getComputedStyle(el).backgroundColor);
    const tokenColor = await horizontal.evaluate(el => getComputedStyle(document.documentElement).getPropertyValue('--vf-color-border').trim());
    expect(lineColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(tokenColor).toBeTruthy();
    await expect(vertical).toHaveCSS('width', '1px');
  }
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(horizontal).toHaveCSS('height', '1px');
  await expect(vertical).toHaveCSS('width', '1px');
  await page.locator('html').evaluate(el => el.dir = 'rtl');
  await expect(horizontal).toHaveCSS('width', '256px');
});
