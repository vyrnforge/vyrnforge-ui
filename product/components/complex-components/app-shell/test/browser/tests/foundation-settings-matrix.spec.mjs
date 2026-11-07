import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'react';

async function fixtureDimensions(page) {
  return page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
}

function parseRgb(value) {
  const match = value.match(/rgba?\((\d+(?:\.\d+)?)[, ]+(\d+(?:\.\d+)?)[, ]+(\d+(?:\.\d+)?)/);
  if (!match) throw new Error(`Unsupported RGB value: ${value}`);
  return match.slice(1, 4).map(Number);
}

function relativeLuminance(value) {
  const channels = parseRgb(value).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(first, second) {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

async function requiredBoundaryPairs(page) {
  const updates = page.getByRole('switch', { name: 'Product updates' });
  if (await updates.isChecked()) await updates.uncheck();

  return page.evaluate(() => {
    const form = document.querySelector('form[aria-label="Foundation settings"]');
    const appearance = document.querySelector('#foundation-appearance');
    const secondary = Array.from(document.querySelectorAll('[data-vf-button]')).find((element) => element.textContent?.trim() === 'Cancel');
    const switchControl = document.querySelector('[data-vf-switch]');
    if (!(form instanceof HTMLElement) || !(appearance instanceof HTMLElement) || !(secondary instanceof HTMLElement) || !(switchControl instanceof HTMLElement)) {
      throw new Error('Foundation settings fixture is incomplete.');
    }

    const formStyle = getComputedStyle(form);
    const switchStyle = getComputedStyle(switchControl);
    return {
      surface: [formStyle.borderTopColor, formStyle.backgroundColor],
      nativeSelect: [getComputedStyle(appearance).borderTopColor, formStyle.backgroundColor],
      secondaryButton: [getComputedStyle(secondary).borderTopColor, getComputedStyle(secondary).backgroundColor],
      switchBoundary: [switchStyle.borderTopColor, formStyle.backgroundColor],
    };
  });
}

test.describe('STD-02 public-entrypoint settings foundation matrix', () => {
  test.skip(port !== 'react', 'Representative STD-02 evidence is intentionally bounded to the React public-entrypoint consumer.');

  test('captures light and dark comfortable presentation with token-bound computed styles', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 900, height: 800 });
    await page.goto('/components/app-shell/foundation-density-react.html');

    const form = page.getByRole('form', { name: 'Foundation settings' });
    const stack = form.locator('[data-vf-stack]');
    const heading = page.getByRole('heading', { name: 'Interface settings' });
    const appearance = page.getByLabel('Appearance');
    const save = page.getByRole('button', { name: 'Save settings' });
    const cancel = page.getByRole('button', { name: 'Cancel' });

    await expect(form).toHaveAttribute('data-vf-density', 'comfortable');
    await expect(heading).toHaveCSS('font-size', '24px');
    await expect(heading).toHaveCSS('font-weight', '600');
    await expect(stack).toHaveCSS('gap', '16px');
    await expect(appearance).toHaveCSS('min-height', '40px');
    await expect(appearance).toHaveCSS('border-radius', '6px');
    await expect(save).toHaveCSS('min-height', '40px');
    await expect(save).toHaveCSS('border-radius', '6px');
    await expect(save).toHaveCSS('background-color', 'rgb(36, 94, 219)');
    await expect(cancel).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    expect(await form.evaluate((element) => getComputedStyle(element).getPropertyValue('--vf-control-motion-duration').trim())).toBe('120ms');

    const lightImage = await form.screenshot({ path: testInfo.outputPath('settings-light-comfortable-wide.png'), animations: 'disabled' });
    expect(lightImage.byteLength).toBeGreaterThan(8_000);

    await appearance.selectOption('dark');
    await expect(form).toHaveAttribute('data-vf-theme', 'dark');
    await expect(heading).toHaveCSS('font-size', '24px');
    await expect(stack).toHaveCSS('gap', '16px');
    await expect(appearance).toHaveCSS('min-height', '40px');
    await expect(save).toHaveCSS('background-color', 'rgb(141, 180, 255)');
    await expect(cancel).toHaveCSS('background-color', 'rgb(24, 24, 27)');

    const darkImage = await form.screenshot({ path: testInfo.outputPath('settings-dark-comfortable-wide.png'), animations: 'disabled' });
    expect(darkImage.byteLength).toBeGreaterThan(8_000);
  });

  test('renders all light/dark and comfortable/compact combinations with density independent from theme', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 900, height: 800 });
    await page.goto('/components/app-shell/foundation-density-react.html');

    const form = page.getByRole('form', { name: 'Foundation settings' });
    const appearance = page.getByLabel('Appearance');
    const density = page.getByLabel('Density');
    const save = page.getByRole('button', { name: 'Save settings' });
    const large = page.getByRole('button', { name: 'Large action' });
    const nested = page.getByRole('button', { name: 'Nested comfortable action' });
    const updates = page.getByRole('switch', { name: 'Product updates' });

    for (const theme of ['light', 'dark']) {
      await appearance.selectOption(theme);
      for (const densityValue of ['comfortable', 'compact']) {
        await density.selectOption(densityValue);
        await expect(form).toHaveAttribute('data-vf-theme', theme);
        await expect(form).toHaveAttribute('data-vf-density', densityValue);
        await expect(save).toHaveCSS('min-height', densityValue === 'comfortable' ? '40px' : '32px');
        await expect(large).toHaveCSS('min-height', densityValue === 'comfortable' ? '48px' : '40px');
        await expect(nested).toHaveCSS('min-height', '40px');
        await expect(updates).toHaveCSS('height', '22px');

        const image = await form.screenshot({ path: testInfo.outputPath(`settings-${theme}-${densityValue}-wide.png`), animations: 'disabled' });
        expect(image.byteLength).toBeGreaterThan(8_000);
      }
    }
  });

  test('keeps every rendered required boundary pair at or above 3:1 in both themes', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/app-shell/foundation-density-react.html');
    const appearance = page.getByLabel('Appearance');

    for (const theme of ['light', 'dark']) {
      await appearance.selectOption(theme);
      const pairs = await requiredBoundaryPairs(page);
      for (const [name, [boundary, adjacent]] of Object.entries(pairs)) {
        expect(contrastRatio(boundary, adjacent), `${theme} ${name}: ${boundary} against ${adjacent}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  test('keeps the same settings task accessible at 320 CSS pixels in light and dark', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/components/app-shell/foundation-density-react.html');

    const form = page.getByRole('form', { name: 'Foundation settings' });
    const appearance = page.getByLabel('Appearance');
    const density = page.getByLabel('Density');
    const updates = page.getByRole('switch', { name: 'Product updates' });
    const save = page.getByRole('button', { name: 'Save settings' });
    const cancel = page.getByRole('button', { name: 'Cancel' });

    for (const theme of ['light', 'dark']) {
      await appearance.selectOption(theme);
      for (const densityValue of ['comfortable', 'compact']) {
        await density.selectOption(densityValue);
        const dimensions = await fixtureDimensions(page);
        expect(dimensions.viewportWidth).toBe(320);
        expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
        await expect(appearance).toBeVisible();
        await expect(density).toBeVisible();
        await expect(updates).toBeVisible();
        await expect(save).toBeVisible();
        await expect(cancel).toBeVisible();
        const image = await form.screenshot({ path: testInfo.outputPath(`settings-${theme}-${densityValue}-320.png`), animations: 'disabled' });
        expect(image.byteLength).toBeGreaterThan(8_000);
      }
    }
  });

  test('preserves keyboard focus order and visible focus treatment', async ({ page }) => {
    await page.goto('/components/app-shell/foundation-density-react.html');

    const appearance = page.getByLabel('Appearance');
    const density = page.getByLabel('Density');
    const updates = page.getByRole('switch', { name: 'Product updates' });
    const save = page.getByRole('button', { name: 'Save settings' });
    const cancel = page.getByRole('button', { name: 'Cancel' });

    await page.keyboard.press('Tab');
    await expect(appearance).toBeFocused();
    await expect(appearance).toHaveCSS('outline-width', '2px');
    await page.keyboard.press('Tab');
    await expect(density).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(updates).toBeFocused();
    await expect(updates).toHaveCSS('outline-width', '2px');
    await page.keyboard.press('Tab');
    await expect(save).toBeFocused();
    await expect(save).toHaveCSS('outline-width', '2px');
    await page.keyboard.press('Tab');
    await expect(cancel).toBeFocused();
  });

  test('keeps required boundaries and focus perceivable in forced colors', async ({ page }, testInfo) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await page.goto('/components/app-shell/foundation-density-react.html');
    expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);

    const form = page.getByRole('form', { name: 'Foundation settings' });
    const appearance = page.getByLabel('Appearance');
    const updates = page.getByRole('switch', { name: 'Product updates' });
    const cancel = page.getByRole('button', { name: 'Cancel' });

    await expect(form).not.toHaveCSS('border-color', 'rgba(0, 0, 0, 0)');
    await expect(appearance).not.toHaveCSS('border-color', 'rgba(0, 0, 0, 0)');
    await expect(updates).not.toHaveCSS('border-color', 'rgba(0, 0, 0, 0)');
    await expect(cancel).not.toHaveCSS('border-color', 'rgba(0, 0, 0, 0)');
    await cancel.focus();
    await expect(cancel).not.toHaveCSS('outline-style', 'none');

    const image = await form.screenshot({ path: testInfo.outputPath('settings-forced-colors.png'), animations: 'disabled' });
    expect(image.byteLength).toBeGreaterThan(4_000);
  });

  test('honors reduced motion without changing settings functionality', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/components/app-shell/foundation-density-react.html');
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);

    const form = page.getByRole('form', { name: 'Foundation settings' });
    const appearance = page.getByLabel('Appearance');
    const density = page.getByLabel('Density');
    const updates = page.getByRole('switch', { name: 'Product updates' });
    const save = page.getByRole('button', { name: 'Save settings' });

    await expect(appearance).toHaveCSS('transition-duration', '0s');
    await expect(updates).toHaveCSS('transition-duration', '0s');
    await expect(save).toHaveCSS('transition-duration', '0s');

    await appearance.selectOption('dark');
    await density.selectOption('compact');
    await updates.uncheck();
    await expect(form).toHaveAttribute('data-vf-theme', 'dark');
    await expect(form).toHaveAttribute('data-vf-density', 'compact');
    await expect(updates).not.toBeChecked();
  });
});
