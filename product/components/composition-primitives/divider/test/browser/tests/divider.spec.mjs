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

test('labeled horizontal Divider renders readable text and three logical alignments', async ({ page }) => {
  await page.goto('/components/divider/' + port + '.html');
  const boxes = {};
  for (const align of ['start', 'center', 'end']) {
    const host = page.locator('#horizontal-label-' + align);
    const label = host.locator('[data-vf-divider-label]');
    await expect(host).toHaveAttribute('data-vf-divider-orientation', 'horizontal');
    await expect(host).toHaveAttribute('data-vf-divider-labeled', '');
    await expect(host).toHaveAttribute('data-vf-divider-align', align);
    await expect(host).not.toHaveAttribute('aria-hidden');
    await expect(host).not.toHaveAttribute('role');
    await expect(host).not.toHaveAttribute('tabindex');
    await expect(label).toHaveText(align === 'center' ? 'OR' : align === 'start' ? 'Start' : 'End');
    await expect(label).toBeVisible();
    const before = await host.evaluate(node => getComputedStyle(node, '::before').display);
    const after = await host.evaluate(node => getComputedStyle(node, '::after').display);
    expect(before === 'none').toBe(align === 'start');
    expect(after === 'none').toBe(align === 'end');
    boxes[align] = { host: await host.boundingBox(), label: await label.boundingBox() };
  }
  const start = boxes.start;
  const center = boxes.center;
  const end = boxes.end;
  expect(Math.abs(start.host.x - start.label.x)).toBeLessThan(2);
  expect(Math.abs(center.label.x + center.label.width / 2 -
    (center.host.x + center.host.width / 2))).toBeLessThan(2);
  expect(Math.abs(end.label.x + end.label.width - (end.host.x + end.host.width))).toBeLessThan(2);
  await expect(page.getByRole('separator')).toHaveCount(0);

  // Logical start/end reverse with document direction; no source order changes.
  await page.locator('html').evaluate(node => node.dir = 'rtl');
  const rtlStart = await page.locator('#horizontal-label-start').boundingBox();
  const rtlStartText = await page.locator('#horizontal-label-start [data-vf-divider-label]').boundingBox();
  const rtlEnd = await page.locator('#horizontal-label-end').boundingBox();
  const rtlEndText = await page.locator('#horizontal-label-end [data-vf-divider-label]').boundingBox();
  expect(Math.abs(rtlStartText.x + rtlStartText.width - (rtlStart.x + rtlStart.width))).toBeLessThan(2);
  expect(Math.abs(rtlEndText.x - rtlEnd.x)).toBeLessThan(2);
});

test('labeled vertical Divider aligns readable vertical text at top, middle and bottom', async ({ page }) => {
  await page.goto('/components/divider/' + port + '.html');
  const positions = {};
  for (const align of ['start', 'center', 'end']) {
    const host = page.locator('#vertical-label-' + align);
    const label = host.locator('[data-vf-divider-label]');
    await expect(host).toHaveAttribute('data-vf-divider-orientation', 'vertical');
    await expect(host).toHaveAttribute('data-vf-divider-align', align);
    await expect(host).not.toHaveAttribute('aria-hidden');
    await expect(label).toHaveCSS('writing-mode', 'vertical-rl');
    await expect(label).toBeVisible();
    const before = await host.evaluate(node => getComputedStyle(node, '::before').display);
    const after = await host.evaluate(node => getComputedStyle(node, '::after').display);
    expect(before === 'none').toBe(align === 'start');
    expect(after === 'none').toBe(align === 'end');
    positions[align] = { host: await host.boundingBox(), label: await label.boundingBox() };
    expect(positions[align].host.height).toBeGreaterThan(100);
  }
  expect(Math.abs(positions.start.host.y - positions.start.label.y)).toBeLessThan(2);
  expect(Math.abs(positions.center.label.y + positions.center.label.height / 2 -
    (positions.center.host.y + positions.center.host.height / 2))).toBeLessThan(2);
  expect(Math.abs(positions.end.label.y + positions.end.label.height -
    (positions.end.host.y + positions.end.host.height))).toBeLessThan(2);
  await expect(page.getByRole('separator')).toHaveCount(0);
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations).toEqual([]);
});

test('labeled Divider keeps contrast, layout and readable text at zoom and in forced colors', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/components/divider/' + port + '.html');
  await page.locator('html').evaluate(el => { el.style.fontSize = '200%'; el.dataset.vfTheme = 'dark'; });
  await page.emulateMedia({ forcedColors: 'active' });
  for (const selector of ['#horizontal-label-center', '#vertical-label-center']) {
    const host = page.locator(selector);
    const color = await host.evaluate(node => getComputedStyle(node, '::before').backgroundColor);
    expect(color).not.toBe('rgba(0, 0, 0, 0)');
    await expect(host.locator('[data-vf-divider-label]')).toBeVisible();
    await expect(host).toHaveCSS('pointer-events', 'auto');
  }
  const overflow = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);
});

test('vertical Divider label directions preserve native readable text and CSS geometry', async ({ page }) => {
  await page.goto('/components/divider/' + port + '.html');
  const directions = [
    ['horizontal', 'horizontal-tb', 'none', 'OR'],
    ['top-to-bottom', 'vertical-rl', 'none', 'Next'],
    ['bottom-to-top', 'vertical-rl', 'matrix(-1, 0, 0, -1, 0, 0)', 'Previous'],
  ];
  for (const [direction, writingMode, transform, expectedLabel] of directions) {
    const line = page.locator('#text-direction-' + direction);
    const label = line.locator('[data-vf-divider-label]');
    await expect(line).toHaveAttribute('data-vf-divider-orientation', 'vertical');
    await expect(line).not.toHaveAttribute('role');
    await expect(line).not.toHaveAttribute('aria-hidden');
    await expect(line).not.toHaveAttribute('tabindex');
    if (direction === 'top-to-bottom') {
      await expect(line).not.toHaveAttribute('data-vf-divider-text-direction');
    } else {
      await expect(line).toHaveAttribute('data-vf-divider-text-direction', direction);
    }
    await expect(label).toHaveText(expectedLabel);
    await expect(label).toHaveCSS('writing-mode', writingMode);
    await expect(label).toHaveCSS('transform', transform);
    const rect = await line.boundingBox();
    expect(rect.height).toBeGreaterThan(130);
    expect(rect.width).toBeGreaterThanOrEqual(16);
    expect(rect.width).toBeLessThan(100);
    // The line segments remain CSS pseudo-elements instead of extra accessible children.
    await expect(line).toHaveCSS('display', 'flex');
  }
  await expect(page.getByRole('separator')).toHaveCount(0);
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations).toEqual([]);
});

test('vertical text direction keeps labels visible with RTL, zoom and forced-colors settings', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/components/divider/' + port + '.html');
  await page.locator('html').evaluate(el => {
    el.dir = 'rtl';
    el.style.fontSize = '200%';
    el.dataset.vfTheme = 'dark';
  });
  await page.emulateMedia({ forcedColors: 'active' });
  for (const direction of ['horizontal', 'top-to-bottom', 'bottom-to-top']) {
    const line = page.locator('#text-direction-' + direction);
    const label = line.locator('[data-vf-divider-label]');
    await expect(label).toBeVisible();
    await expect(line).not.toHaveAttribute('aria-hidden');
    const segmentColor = await line.evaluate(node => getComputedStyle(node, '::before').backgroundColor);
    expect(segmentColor).not.toBe('rgba(0, 0, 0, 0)');
  }
  const width = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.client);
});
