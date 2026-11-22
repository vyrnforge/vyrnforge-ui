import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT === 'react' ? 'react' : 'web';

test('Badge is readable, noninteractive and accessible in both ports', async ({ page }) => {
  await page.goto('/components/badge/' + port + '.html');
  await expect(page.getByText('Draft')).toBeVisible();
  await expect(page.locator('#count')).toHaveText('0');
  await expect(page.getByRole('img', { name: 'Sync in progress' })).toHaveCount(1);
  await expect(page.locator('#decorative-dot')).toHaveAttribute('aria-hidden', 'true');
  for (const badge of await page.locator('[data-vf-badge]').all()) {
    await expect(badge).not.toHaveAttribute('tabindex');
    await expect(badge).not.toHaveAttribute('role', 'status');
    await expect(badge).not.toHaveAttribute('aria-live');
  }
  const report = await new AxeBuilder({ page }).analyze();
  expect(report.violations).toEqual([]);
});

test('Badge uses token colors and keeps contrast in dark, forced colors, RTL and zoom', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/components/badge/' + port + '.html');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((node, value) => {
      node.dataset.vfTheme = value;
      node.dir = 'rtl';
      node.style.fontSize = '200%';
    }, theme);
    await expect(page.locator('#text')).toBeVisible();
    await expect(page.locator('#danger')).toHaveCSS('border-style', 'solid');
  }
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.locator('#named-dot')).toBeVisible();
  const paint = await page.locator('#named-dot').evaluate(el =>
    getComputedStyle(el, '::before').backgroundColor);
  expect(paint).not.toBe('rgba(0, 0, 0, 0)');
  const dimensions = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
});
