import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT === 'react' ? 'react' : 'web';

test('List preserves native collection semantics and independent action keyboard focus', async ({ page }) => {
  await page.goto('/components/list/' + port + '.html');
  const people = page.getByRole('list', { name: 'People' });
  await expect(people).toBeVisible();
  await expect(people.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByRole('list', { name: 'Release steps' })).toHaveAttribute('start', '3');
  await expect(page.locator('#steps')).toHaveCSS('list-style-type', 'decimal');
  await expect(page.locator('#people [role="option"], #people [role="menuitem"]')).toHaveCount(0);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'View Alex Chen' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'View Maria García' })).toBeFocused();
  await expect(page.locator('#people [tabindex]')).toHaveCount(0);
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations).toEqual([]);
});

test('inherited compact density changes row rhythm without changing list identity', async ({ page }) => {
  await page.goto('/components/list/' + port + '.html');
  const rows = page.locator('#people > [data-vf-list-item]');
  const original = await rows.first().evaluate(el => parseFloat(getComputedStyle(el).paddingBlockStart));
  await page.evaluate(() => { document.documentElement.dataset.vfDensity = 'compact'; });
  const compact = await rows.first().evaluate(el => parseFloat(getComputedStyle(el).paddingBlockStart));
  expect(compact).toBeLessThan(original);
  await expect(page.getByRole('list', { name: 'People' })).toBeVisible();
});

test('rich rows wrap without horizontal page overflow at narrow and zoom-like widths', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/components/list/' + port + '.html');
  const metrics = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1);
  expect(metrics.bodyWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1);
  for (const label of ['View Alex Chen', 'View Maria García']) {
    await expect(page.getByRole('button', { name: label })).toBeVisible();
  }
});

test('RTL keeps semantic order and visible divider borders in forced colors', async ({ page, browserName }) => {
  await page.goto('/components/list/' + port + '.html');
  await page.evaluate(() => document.documentElement.dir = 'rtl');
  await expect(page.getByRole('listitem').first()).toContainText('Alex Chen');
  if (browserName === 'chromium') {
    await page.emulateMedia({ forcedColors: 'active' });
    const border = await page.locator('#people li').nth(1)
      .evaluate(el => getComputedStyle(el).borderBlockStartStyle);
    expect(border).toBe('solid');
  }
});
