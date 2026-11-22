import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT === 'react' ? 'react' : 'web';

test('Badge augments a target and preserves its accessible name, keyboard focus and count visibility', async ({ page }) => {
  await page.goto('/components/badge/' + port + '.html');
  await expect(page.getByRole('button', { name: 'Inbox, 4 unread messages' })).toBeVisible();
  await expect(page.locator('#count [data-vf-badge-indicator]')).toHaveText('4');
  await expect(page.locator('#max [data-vf-badge-indicator]')).toHaveText('99+');
  await expect(page.getByRole('button', { name: 'Mail, 120 unread messages' })).toBeVisible();
  await expect(page.locator('#dot [data-vf-badge-indicator]')).toHaveText('');
  await expect(page.locator('#zero [data-vf-badge-indicator]')).toBeHidden();
  await expect(page.locator('#show-zero [data-vf-badge-indicator]')).toHaveText('0');
  await expect(page.locator('#invisible [data-vf-badge-indicator]')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Seven unread' })).toBeVisible();
  for (const element of await page.locator('[data-vf-badge]').all()) {
    await expect(element).not.toHaveAttribute('tabindex');
    await expect(element).not.toHaveAttribute('role');
    await expect(element).not.toHaveAttribute('aria-live');
  }
  for (const element of await page.locator('[data-vf-badge-indicator]').all()) {
    await expect(element).toHaveAttribute('aria-hidden', 'true');
  }
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Inbox, 4 unread messages' })).toBeFocused();
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations).toEqual([]);
});

test('Badge anchored placement responds to RTL and preserves narrow zoom and forced-color reflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/components/badge/' + port + '.html');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((node, current) => {
      node.dataset.vfTheme = current;
      node.style.fontSize = '200%';
      node.dir = 'rtl';
    }, theme);
    const start = page.locator('#start');
    const end = page.locator('#end-bottom');
    const startHost = await start.boundingBox();
    const startIndicator = await start.locator('[data-vf-badge-indicator]').boundingBox();
    const endHost = await end.boundingBox();
    const endIndicator = await end.locator('[data-vf-badge-indicator]').boundingBox();
    expect(startIndicator.x + startIndicator.width / 2).toBeGreaterThan(startHost.x + startHost.width / 2);
    expect(endIndicator.x + endIndicator.width / 2).toBeLessThan(endHost.x + endHost.width / 2);
    await expect(page.locator('#circle')).toHaveAttribute('data-vf-badge-overlap', 'circular');
  }
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.locator('#circle [data-vf-badge-indicator]')).toBeVisible();
  const border = await page.locator('#circle [data-vf-badge-indicator]')
    .evaluate(el => getComputedStyle(el).borderColor);
  expect(border).not.toBe('rgba(0, 0, 0, 0)');
  const dimensions = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
});
