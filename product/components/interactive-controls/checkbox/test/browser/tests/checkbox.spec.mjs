import { defineNativeControlBrowserTests } from '../../../../../../_test-support/native-controls/native-control-browser-tests.mjs';
await defineNativeControlBrowserTests('checkbox');

import { test, expect } from '@playwright/test';

test('checkbox sizes preserve distinct indicators, native target, state and focus', async ({ page }, testInfo) => {
  const port = process.env.VF_COMPONENT_PORT || 'web';
  await page.setViewportSize({ width: 1050, height: 650 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/checkbox/' + port + '.html');
  const control = page.locator('#control');
  await expect(control).toHaveAttribute('data-vf-size', 'sm');
  const values = await page.evaluate(() => {
    const field = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = 'Checkbox sizes';
    field.append(legend);
    field.style.display = 'grid';
    field.style.gap = '12px';
    for (const size of ['sm', 'md', 'lg']) {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '12px';
      for (const state of ['unchecked', 'checked', 'mixed', 'disabled', 'invalid']) {
        const label = document.createElement('label');
        label.style.display = 'inline-flex';
        label.style.alignItems = 'center';
        label.style.gap = '4px';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.dataset.vfCheckbox = '';
        input.dataset.vfSize = size;
        input.id = size + '-' + state;
        input.checked = state === 'checked' || state === 'disabled';
        input.indeterminate = state === 'mixed';
        input.disabled = state === 'disabled';
        if (state === 'invalid') input.setAttribute('aria-invalid', 'true');
        label.append(input, document.createTextNode(size + ' ' + state));
        row.append(label);
      }
      field.append(row);
    }
    document.querySelector('main').append(field);
    return ['sm','md','lg'].map(size => {
      const input = document.getElementById(size + '-checked');
      const rect = input.getBoundingClientRect();
      const indicator = getComputedStyle(input, '::before');
      const mark = getComputedStyle(input, '::after');
      return { size, target: rect.width, height: rect.height, indicator: parseFloat(indicator.width),
        indicatorHeight: parseFloat(indicator.height), mark: parseFloat(mark.height), radius: parseFloat(indicator.borderRadius) };
    });
  });
  expect(values.map(value => value.indicator)).toEqual([20, 24, 28]);
  expect(values.map(value => value.target)).toEqual([24, 24, 28]);
  for (const value of values) {
    expect(value.target).toBe(value.height);
    expect(value.indicator).toBe(value.indicatorHeight);
    expect(value.mark).toBeCloseTo(value.indicator / 3, 1);
    expect(value.radius).toBeCloseTo(value.indicator / 6, 1);
  }
  const small = page.locator('#sm-unchecked');
  const bounds = await small.boundingBox();
  // The 2px gutter outside the visible 20px indicator still activates the native input.
  await page.mouse.click(bounds.x + 1, bounds.y + bounds.height / 2);
  await expect(small).toBeChecked();
  await small.press('Space');
  await expect(small).not.toBeChecked();
  await expect(small).toBeFocused();
  await expect(page.locator('#lg-disabled')).toBeDisabled();
  for (const theme of ['light','dark']) {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await page.locator('html').evaluate((el, theme) => { el.dataset.vfTheme = theme; }, theme);
    await page.screenshot({ path: testInfo.outputPath('checkbox-sizes-' + theme + '.png'), fullPage: true });
  }
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(small).toHaveCSS('appearance', 'auto');
  await expect(small).toHaveCSS('width', '24px');
  await expect(page.locator('#lg-checked')).toBeChecked();
  await expect(page.locator('#md-mixed')).toHaveJSProperty('indeterminate', true);
  await page.screenshot({ path: testInfo.outputPath('checkbox-sizes-forced-colors.png'), fullPage: true });
});
