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

test('Avatar supports square shape, decorative icon appearance and icon fallback', async ({ page }) => {
  await page.goto(route);
  const square = page.locator('#square-avatar');
  await expect(square).toHaveAttribute('data-vf-avatar-shape', 'square');
  await expect(square).toHaveCSS('border-radius', '0px');
  const box = await square.boundingBox();
  expect(box.width).toBe(48);
  expect(box.height).toBe(48);

  const icon = page.locator('#icon-avatar');
  await expect(icon).toHaveAttribute('aria-label', 'Anonymous member');
  await expect(icon).toHaveAttribute('data-vf-avatar-appearance', 'icon');
  await expect(icon.locator('[data-vf-avatar-icon]')).toHaveAttribute('aria-hidden', 'true');
  const glyph = icon.locator('[data-vf-avatar-icon] > svg');
  await expect(glyph).toBeVisible();
  await expect(glyph).toHaveAttribute('aria-hidden', 'true');
  await expect(icon.locator('img')).toHaveCount(0);
  await expect(icon.locator('[data-vf-avatar-initials]')).toHaveCount(0);

  const fallback = page.locator('#icon-fallback');
  await expect(fallback).toHaveAttribute('aria-label', 'Alex Chen');
  await expect(fallback.locator('[data-vf-avatar-icon] > svg')).toBeVisible();
  await expect(fallback.locator('img')).toHaveCount(0);
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations).toEqual([]);
});

test('AvatarGroup is a labeled native list with limited members and an accessible +N total', async ({ page }) => {
  await page.goto(route);
  const group = page.locator('#limited-group');
  await expect(group).toHaveJSProperty('tagName', 'UL');
  await expect(group).toHaveAttribute('role', 'list');
  await expect(group).toHaveAttribute('aria-label', 'Review team');
  await expect(group).toHaveAttribute('data-vf-avatar-group-spacing', 'overlap');
  await expect(group.locator(':scope > li[data-vf-avatar-group-item]')).toHaveCount(3);
  await expect(group.getByRole('img', { name: 'Ada Lovelace' })).toHaveCount(1);
  await expect(group.getByRole('img', { name: 'Alex Chen' })).toHaveCount(1);
  await expect(group.getByRole('img', { name: 'Maria García' })).toHaveCount(0);
  await expect(group.getByRole('img', { name: '5 more reviewers' })).toHaveText('+5');

  const members = group.locator(':scope > li > [data-vf-avatar]');
  await expect(members.nth(0)).toHaveAttribute('data-vf-avatar-size', 'lg');
  await expect(members.nth(1)).toHaveAttribute('data-vf-avatar-size', 'sm');
  await expect(members.nth(2)).toHaveAttribute('data-vf-avatar-size', 'lg');
  for (const avatar of await members.all()) {
    await expect(avatar).toHaveAttribute('data-vf-avatar-shape', 'square');
  }
  const width = await group.locator(':scope > li').first().boundingBox();
  expect(width.width).toBe(48);
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations).toEqual([]);
});

test('AvatarGroup spacing uses logical overlap and progressively positive token gap', async ({ page }) => {
  await page.goto(route);
  async function edgeDistance(id) {
    const items = page.locator('#spacing-' + id + ' > li');
    const first = await items.nth(0).boundingBox();
    const second = await items.nth(1).boundingBox();
    return second.x - (first.x + first.width);
  }
  const overlap = await edgeDistance('overlap');
  const none = await edgeDistance('none');
  const medium = await edgeDistance('md');
  expect(overlap).toBeLessThan(-1);
  expect(Math.abs(none)).toBeLessThanOrEqual(1);
  expect(medium).toBeGreaterThan(0);
  await page.locator('html').evaluate((node) => { node.dir = 'rtl'; });
  const rtl = await page.locator('#spacing-overlap').evaluate((group) => {
    const first = group.children[0].getBoundingClientRect();
    const second = group.children[1].getBoundingClientRect();
    return first.left - second.right;
  });
  expect(rtl).toBeLessThan(-1);
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(page.locator('#limited-group [data-vf-avatar]').first()).toBeVisible();
  await expect(page.locator('#spacing-md')).toHaveCSS('gap', '16px');
});

test('React AvatarGroup ref and changing visible limit keep total count and names coherent', async ({ page }) => {
  test.skip(port !== 'react', 'Dynamic group rendering and ref belong to React AvatarGroup');
  await page.goto(route);
  await expect(page.locator('body')).toHaveAttribute('data-avatar-group-ref-attached', 'true');
  const group = page.locator('#dynamic-group');
  await expect(group.locator('li')).toHaveCount(3);
  await expect(group.getByRole('img', { name: '5 more reviewers' })).toHaveText('+5');
  await page.locator('#increase-group-limit').click();
  await expect(group.locator('li')).toHaveCount(4);
  await expect(group.getByRole('img', { name: 'Maria García' })).toBeVisible();
  await expect(group.getByRole('img', { name: '4 more reviewers' })).toHaveText('+4');
  await expect(group.getByRole('img', { name: '5 more reviewers' })).toHaveCount(0);
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations).toEqual([]);
});
