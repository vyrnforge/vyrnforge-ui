import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT === 'react' ? 'react' : 'web';
const route = '/components/avatar/' + port + '.html';

test('Avatar shows accessible initials, native image and distinct sizes', async ({ page }) => {
  await page.goto(route);
  const initials = page.locator('#initials');
  await expect(initials).toHaveAttribute('role', 'img');
  await expect(initials).toHaveAttribute('aria-label', 'Ada Lovelace');
  await expect(initials.locator('[data-vf-avatar-initials]')).toHaveText('AL');
  await expect(initials.locator('[data-vf-avatar-initials]')).toHaveAttribute('aria-hidden', 'true');
  await expect(initials.locator('img')).toHaveCount(0);
  await expect(initials).toHaveAttribute('data-vf-avatar-size', 'sm');
  const small = await initials.boundingBox();
  expect(small.width).toBe(32);
  expect(small.height).toBe(32);
  const photo = page.locator('#photo');
  await expect(photo).toHaveAttribute('role', 'img');
  await expect(photo).toHaveAttribute('aria-label', 'Alex Chen');
  const img = photo.locator('[data-vf-avatar-image]');
  await expect(img).toHaveJSProperty('tagName', 'IMG');
  await expect(img).toHaveAttribute('alt', '');
  await expect(img).toHaveAttribute('loading', 'eager');
  await expect(img).toHaveAttribute('decoding', 'async');
  await expect(img).toHaveCSS('object-fit', 'cover');
  const large = await photo.boundingBox();
  expect(large.width).toBe(48);
  expect(large.height).toBe(48);
  await expect(photo).toHaveCSS('border-radius', '50%');
  await expect(page.locator('#native-fallback [data-vf-avatar-initials]')).toHaveText('MG');
  await expect(page.locator('#native-fallback')).toHaveAttribute('aria-label', 'Maria García');
  await expect(page.getByRole('img', { name: 'Ada Lovelace' })).toHaveCount(1);
  await expect(page.locator('#decorative')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#decorative')).not.toHaveAttribute('role');
  await expect(page.locator('#decorative-line')).toContainText('Ada Lovelace');
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations).toEqual([]);
});

test('Avatar remains circular and readable across themes, RTL and forced colors', async ({ page }) => {
  await page.goto(route);
  const initials = page.locator('#initials');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((node, mode) => { node.dataset.vfTheme = mode; }, theme);
    const style = await initials.evaluate(node => getComputedStyle(node));
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(style.color).not.toBe(style.backgroundColor);
  }
  await page.locator('html').evaluate(node => { node.dir = 'rtl'; });
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(initials).toHaveCSS('border-radius', '50%');
  await expect(initials.locator('[data-vf-avatar-initials]')).toBeVisible();
  await expect(page.locator('#photo')).toHaveCSS('width', '48px');
  await expect(page.locator('#initials')).toHaveCSS('width', '32px');
});

test('React Avatar ref forwards host and broken image switches to initials, then recovers on source change', async ({ page }) => {
  test.skip(port !== 'react', 'Automatic image error fallback belongs to React Avatar');
  await page.goto(route);
  await expect(page.locator('body')).toHaveAttribute('data-avatar-ref-attached', 'true');
  const host = page.locator('#source-change');
  await expect(host).toHaveAttribute('aria-label', 'Alex Chen');
  await expect(host.locator('img')).toHaveCount(1);
  await page.locator('#break-source').click();
  await expect(host.locator('[data-vf-avatar-initials]')).toHaveText('AC');
  await expect(host.locator('img')).toHaveCount(0);
  await expect(host).toHaveAttribute('aria-label', 'Alex Chen');
  await page.locator('#restore-source').click();
  await expect(host.locator('img')).toHaveCount(1);
  await expect(host.locator('img')).toHaveAttribute('alt', '');
  await expect(host).toHaveAttribute('role', 'img');
});
