import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'react';

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

async function renderedBoundaryEvidence(page) {
  const switchControl = page.getByRole('switch', { name: 'Product updates' });
  if (await switchControl.isChecked()) await switchControl.uncheck();

  return page.evaluate(() => {
    const formElement = document.querySelector('form[aria-label="Foundation settings"]');
    const selectElement = document.querySelector('#foundation-appearance');
    const secondaryElement = Array.from(document.querySelectorAll('[data-vf-button]')).find((element) => element.textContent?.trim() === 'Small action');
    const switchElement = document.querySelector('[data-vf-switch]');
    if (!(formElement instanceof HTMLElement) || !(selectElement instanceof HTMLElement) || !(secondaryElement instanceof HTMLElement) || !(switchElement instanceof HTMLElement)) {
      throw new Error('Foundation boundary fixture is incomplete.');
    }
    const formStyle = getComputedStyle(formElement);
    return {
      token: formStyle.getPropertyValue('--vf-color-border-required').trim(),
      surface: formStyle.backgroundColor,
      surfacePressed: formStyle.getPropertyValue('--vf-color-surface-pressed').trim(),
      surfaceBorder: formStyle.borderTopColor,
      nativeSelectBorder: getComputedStyle(selectElement).borderTopColor,
      secondaryBorder: getComputedStyle(secondaryElement).borderTopColor,
      switchBorder: getComputedStyle(switchElement).borderTopColor,
      switchBackground: getComputedStyle(switchElement).backgroundColor,
    };
  });
}

test.describe('STD-02 required control boundaries', () => {
  test.skip(port !== 'react', 'Representative boundary evidence is intentionally bounded to the React public-entrypoint consumer.');

  test('meets required non-text contrast in light and dark without changing decorative border roles', async ({ page }) => {
    await page.goto('/components/app-shell/foundation-density-react.html');
    const appearance = page.getByLabel('Appearance');

    const light = await renderedBoundaryEvidence(page);
    expect(light.token).toBe('#71717a');
    expect(contrastRatio(light.surfaceBorder, light.surface)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(light.nativeSelectBorder, light.surface)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(light.secondaryBorder, light.surface)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(light.switchBorder, light.switchBackground)).toBeGreaterThanOrEqual(3);

    await appearance.selectOption('dark');
    const dark = await renderedBoundaryEvidence(page);
    expect(dark.token).toBe('#a1a1aa');
    expect(contrastRatio(dark.surfaceBorder, dark.surface)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(dark.nativeSelectBorder, dark.surface)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(dark.secondaryBorder, dark.surface)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(dark.switchBorder, dark.switchBackground)).toBeGreaterThanOrEqual(3);

    const decorativeBorder = await page.getByRole('form', { name: 'Foundation settings' }).evaluate((element) => getComputedStyle(element).getPropertyValue('--vf-color-border').trim());
    expect(decorativeBorder).toBe('#3f3f46');
  });

  test('preserves focus, forced-colors behavior, and consumer overrides', async ({ page }) => {
    await page.goto('/components/app-shell/foundation-density-react.html');

    const form = page.getByRole('form', { name: 'Foundation settings' });
    const nativeSelect = page.getByLabel('Appearance');
    const secondary = page.getByRole('button', { name: 'Small action' });
    const switchControl = page.getByRole('switch', { name: 'Product updates' });

    await nativeSelect.focus();
    await expect(nativeSelect).toHaveCSS('outline-width', '2px');
    await secondary.focus();
    await expect(secondary).toHaveCSS('outline-width', '2px');
    await switchControl.focus();
    await expect(switchControl).toHaveCSS('outline-width', '2px');

    await form.evaluate((element) => element.style.setProperty('--vf-color-border-required', '#3f3f46'));
    await expect(secondary).toHaveCSS('border-color', 'rgb(63, 63, 70)');
    await expect(nativeSelect).toHaveCSS('border-color', 'rgb(63, 63, 70)');

    await page.emulateMedia({ forcedColors: 'active' });
    expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
    await expect(secondary).not.toHaveCSS('border-color', 'rgba(0, 0, 0, 0)');
    await expect(nativeSelect).not.toHaveCSS('border-color', 'rgba(0, 0, 0, 0)');
    await expect(switchControl).not.toHaveCSS('border-color', 'rgba(0, 0, 0, 0)');
  });
});
