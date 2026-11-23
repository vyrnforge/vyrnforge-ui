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
  await expect(page.getByRole('button', { name: 'Hidden, seven unread' })).toBeVisible();
  for (const element of await page.locator('[data-vf-badge]').all()) {
    await expect(element).not.toHaveAttribute('tabindex');
    await expect(element).not.toHaveAttribute('role');
    await expect(element).not.toHaveAttribute('aria-live');
  }
  for (const element of await page.locator('[data-vf-badge-indicator]').all()) {
    await expect(element).toHaveAttribute('aria-hidden', 'true');
  }
  // New sizing specimens precede the original count; check native tab order.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Small, seven updates' })).toBeFocused();
  for (let index = 0; index < 4; index += 1) {
    await page.keyboard.press('Tab');
  }
  await expect(page.getByRole('button', { name: 'Inbox, 4 unread messages' })).toBeFocused();
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations).toEqual([]);
});

test('Badge sizes remain compact and scale count and dot separately', async ({ page }) => {
  await page.goto('/components/badge/' + port + '.html');
  const dimensions = async (host) => page.locator(host + ' [data-vf-badge-indicator]')
    .evaluate(el => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });

  const smallCount = await dimensions('#size-sm');
  const mediumCount = await dimensions('#count');
  const largeCount = await dimensions('#size-lg');
  expect(smallCount.height).toBeCloseTo(16, 0);
  expect(mediumCount.height).toBeCloseTo(20, 0);
  expect(largeCount.height).toBeCloseTo(24, 0);
  expect(smallCount.height).toBeLessThan(mediumCount.height);
  expect(mediumCount.height).toBeLessThan(largeCount.height);

  const smallDot = await dimensions('#dot-sm');
  const mediumDot = await dimensions('#dot');
  const largeDot = await dimensions('#dot-lg');
  for (const [value, expected] of [
    [smallDot, 6], [mediumDot, 8], [largeDot, 10],
  ]) {
    expect(value.width).toBeCloseTo(expected, 0);
    expect(value.height).toBeCloseTo(expected, 0);
  }

  const neutral = await page.locator('#size-sm [data-vf-badge-indicator]')
    .evaluate(el => {
      const css = getComputedStyle(el);
      return { border: css.borderColor, background: css.backgroundColor };
    });
  expect(neutral.border).not.toBe(neutral.background);
  await expect(page.getByRole('button', { name: 'Large, 42 updates' })).toBeVisible();
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
