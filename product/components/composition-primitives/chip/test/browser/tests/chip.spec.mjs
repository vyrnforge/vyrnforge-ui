import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT === 'react' ? 'react' : 'web';
const url = '/components/chip/' + port + '.html';

test('Chip has independent native actions, readable labels and sequential focus', async ({ page }) => {
  await page.goto(url);
  await expect(page.locator('#static')).toHaveText('Engineering');
  await expect(page.locator('#static button')).toHaveCount(0);
  const action = page.getByRole('button', { name: 'Open' });
  const filter = page.getByRole('button', { name: 'React', exact: true });
  const remove = page.getByRole('button', { name: 'Remove React' });
  await expect(filter).toHaveAttribute('aria-pressed', 'true');
  await expect(remove).toHaveAttribute('data-vf-icon-only', '');
  await expect(page.locator('#filter button button')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
  for (const control of [action, filter, remove]) {
    await page.keyboard.press('Tab');
    await expect(control).toBeFocused();
    const bounds = await control.boundingBox();
    expect(bounds.width).toBeGreaterThanOrEqual(24);
    expect(bounds.height).toBeGreaterThanOrEqual(24);
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('Chip preserves logical order, wrapping, themes and motion preference', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(url);
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((node, value) => {
      node.dataset.vfTheme = value;
      node.dir = 'rtl';
      node.style.fontSize = '200%';
    }, theme);
    const action = await page.getByRole('button', { name: 'React', exact: true }).boundingBox();
    const remove = await page.getByRole('button', { name: 'Remove React' }).boundingBox();
    // The primary now covers the whole Chip; removal overlays its logical end.
    expect(remove.x + remove.width / 2).toBeLessThan(action.x + action.width / 2);
    await expect(page.locator('#long')).toContainText('available to assistive technology');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(321);
  }
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await expect(page.locator('#filter [data-vf-chip-selection]')).toBeVisible();
  await expect(page.locator('#filter')).toHaveCSS('transition-duration', '0s');
  await expect(page.locator('#filter [data-vf-chip-label]')).toHaveCSS('forced-color-adjust', 'none');
  await expect(page.locator('#filter [data-vf-chip-selection]')).toHaveCSS('forced-color-adjust', 'none');
  await expect(page.locator('#filter [data-vf-chip-remove]')).toHaveCSS('forced-color-adjust', 'none');
  const radius = await page.locator('#long').evaluate(el => ({
    actual: getComputedStyle(el).borderTopLeftRadius,
    control: getComputedStyle(el).getPropertyValue('--vf-control-radius').trim(),
    height: el.getBoundingClientRect().height,
  }));
  expect(parseFloat(radius.actual)).toBeLessThan(radius.height / 4);
  await page.screenshot({ path: test.info().outputPath('chip-rtl-forced-colors.png'), fullPage: true });
});

test('navigation retains native link keyboard semantics and disabled links cannot navigate', async ({ page }) => {
  await page.goto(url);
  const link = page.getByRole('link', { name: 'Documentation' });
  const disabled = page.getByRole('link', { name: 'Disabled link' });
  await expect(link).toHaveAttribute('href', '#long');
  await expect(disabled).toHaveAttribute('aria-disabled', 'true');
  await expect(disabled).not.toHaveAttribute('href', /.+/);
  await link.focus();
  await page.keyboard.press('Space');
  expect(new URL(page.url()).hash).toBe('');
  await page.keyboard.press('Enter');
  expect(new URL(page.url()).hash).toBe('#long');
  await page.keyboard.press('Tab');
  await expect(disabled).not.toBeFocused();
});


test('default removal mark has independent geometry and contrast across tones and themes', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 900, height: 600 });
  // Measure the settled theme colors, not an intermediate transition frame.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url);
  for (const theme of ['light', 'dark']) {
    await page.mouse.move(0, 0);
    await page.emulateMedia({ colorScheme: theme });
    await page.locator('html').evaluate((el, value) => { el.dataset.vfTheme = value; }, theme);
    const mark = page.locator('[id^="remove-"]:not(#remove-disabled) [data-vf-chip-default-remove]');
    await expect(mark).toHaveCount(8);
    const specimens = await mark.evaluateAll(nodes => {
      const luminance = color => {
        const rgb = color.match(/[\d.]+/g).slice(0, 3).map(value => Number(value) / 255)
          .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
        return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
      };
      const ratio = (first, second) => {
        const a = luminance(first), b = luminance(second);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      };
      return nodes.map(node => {
        const style = getComputedStyle(node);
        const target = node.closest('button').getBoundingClientRect();
        const root = node.closest('[data-vf-chip]');
        const rootColor = getComputedStyle(root).backgroundColor;
        const surface = rootColor === 'rgba(0, 0, 0, 0)' ? getComputedStyle(document.body).backgroundColor : rootColor;
        const rect = node.getBoundingClientRect();
        return { id: root.id, width: rect.width, height: rect.height, targetWidth: target.width, targetHeight: target.height,
          radius: style.borderRadius, colors: [style.backgroundColor, surface, style.color], circleContrast: ratio(style.backgroundColor, surface),
          inkContrast: ratio(style.color, style.backgroundColor) };
      });
    });
    for (const item of specimens) {
      expect(item.width).toBe(item.height);
      expect(item.radius).toBe('50%');
      expect(item.width).toBeLessThan(item.targetWidth);
      expect(item.targetWidth).toBeGreaterThanOrEqual(24);
      expect(item.targetHeight).toBeGreaterThanOrEqual(24);
      expect(item.targetWidth).toBe(item.targetHeight);
      expect(item.circleContrast, item.id + ' circle contrast: ' + item.colors.join(' / ')).toBeGreaterThanOrEqual(3);
      expect(item.inkContrast, item.id + ' mark contrast: ' + item.colors.join(' / ')).toBeGreaterThanOrEqual(3);
    }
    await expect(page.locator('#remove-custom [data-vf-chip-default-remove]')).toHaveCount(0);
    await expect(page.locator('#remove-custom [data-vf-chip-remove]')).toHaveAttribute('data-vf-icon-only', '');
    await expect(page.getByRole('button', { name: 'Remove remove-disabled' })).toBeDisabled();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    const button = page.getByRole('button', { name: 'Remove remove-neutral-filled' });
    const circle = button.locator('[data-vf-chip-default-remove]');
    await button.hover();
    await expect(circle).toHaveCSS('outline-offset', '1px');
    await page.mouse.down();
    await expect(circle).toHaveCSS('outline-offset', '0px');
    await page.mouse.up();
    await button.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS('outline-style', 'solid');
    await page.screenshot({ path: testInfo.outputPath('chip-removal-circle-' + theme + '.png'), fullPage: true });
  }
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await expect(page.locator('#filter [data-vf-chip-default-remove]')).toHaveCSS('forced-color-adjust', 'none');
  await expect(page.locator('#filter [data-vf-chip-default-remove]')).toHaveCSS('transition-duration', '0s');
  await page.screenshot({ path: testInfo.outputPath('chip-removal-circle-forced-colors.png'), fullPage: true });
});


test('Chip removal is a localized target; all remaining primary surface is actionable in LTR and RTL', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 720 });
  await page.goto(url);
  const chip = page.locator('#filter');
  await chip.evaluate(el => {
    el.setAttribute('data-vf-chip-size', 'lg');
    el.setAttribute('data-vf-chip-wrap', '');
    el.style.inlineSize = '12rem';
    el.querySelector('[data-vf-chip-label]').textContent = 'Long selected category with enough text to wrap across several lines';
    el.dataset.primaryClicks = '0';
    el.dataset.removeClicks = '0';
    el.querySelector('[data-vf-chip-primary]').addEventListener('click', () => { el.dataset.primaryClicks = String(Number(el.dataset.primaryClicks) + 1); });
    el.querySelector('[data-vf-chip-remove]').addEventListener('click', () => { el.dataset.removeClicks = String(Number(el.dataset.removeClicks) + 1); });
  });
  for (const direction of ['ltr', 'rtl']) {
    await page.locator('html').evaluate((el, value) => { el.dir = value; }, direction);
    const primary = await chip.locator('[data-vf-chip-primary]').boundingBox();
    const remove = await chip.locator('[data-vf-chip-remove]').boundingBox();
    const mark = await chip.locator('[data-vf-chip-default-remove]').boundingBox();
    expect(primary.height).toBeGreaterThan(remove.height + 4);
    expect(primary.x).toBeLessThanOrEqual(remove.x);
    expect(primary.x + primary.width).toBeGreaterThanOrEqual(remove.x + remove.width);
    expect(remove.width).toBe(remove.height);
    expect(remove.width).toBeGreaterThanOrEqual(24);
    expect(remove.width).toBeLessThan(primary.width);
    await chip.evaluate(el => { el.dataset.primaryClicks = '0'; el.dataset.removeClicks = '0'; });
    const x = remove.x + remove.width / 2;
    // Trailing space above and below the close target belongs to the primary.
    await page.mouse.click(x, primary.y + 2);
    await page.mouse.click(x, primary.y + primary.height - 2);
    await page.mouse.click(primary.x + primary.width / 2, primary.y + primary.height / 2);
    await expect(chip).toHaveAttribute('data-primary-clicks', '3');
    await expect(chip).toHaveAttribute('data-remove-clicks', '0');
    await page.mouse.click(mark.x + mark.width / 2, mark.y + mark.height / 2);
    await expect(chip).toHaveAttribute('data-remove-clicks', '1');
    await expect(chip).toHaveAttribute('data-primary-clicks', '3');
  }
});
