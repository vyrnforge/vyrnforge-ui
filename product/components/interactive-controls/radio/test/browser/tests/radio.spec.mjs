import { defineNativeControlBrowserTests } from '../../../../../../_test-support/native-controls/native-control-browser-tests.mjs';
await defineNativeControlBrowserTests('radio');

import { test, expect } from '@playwright/test';

test('radio dot is centered and proportional with native selection, focus and forced colors', async ({ page }, testInfo) => {
  const port = process.env.VF_COMPONENT_PORT || 'web';
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/radio/' + port + '.html');
  const checked = page.locator('#control');
  await expect(checked).toBeChecked();
  await expect(checked).toHaveCSS('display', 'inline-grid');
  await expect(checked).toHaveCSS('align-items', 'center');
  await expect(checked).toHaveCSS('justify-items', 'center');
  await expect(checked).toHaveCSS('padding', '0px');
  const geometry = await checked.evaluate(element => {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const dot = getComputedStyle(element, '::before');
    const matrix = new DOMMatrixReadOnly(dot.transform);
    return { width: box.width, height: box.height, left: style.borderLeftWidth,
      right: style.borderRightWidth, top: style.borderTopWidth, bottom: style.borderBottomWidth,
      dotWidth: parseFloat(dot.width), dotHeight: parseFloat(dot.height),
      radius: dot.borderRadius, gridArea: dot.gridArea, tx: matrix.e, ty: matrix.f,
      sx: matrix.a, sy: matrix.d };
  });
  expect(geometry.width).toBeGreaterThanOrEqual(24);
  expect(geometry.height).toBe(geometry.width);
  expect(geometry.left).toBe(geometry.right);
  expect(geometry.top).toBe(geometry.bottom);
  expect(geometry.dotWidth).toBeCloseTo(geometry.width / 2, 1);
  expect(geometry.dotHeight).toBe(geometry.dotWidth);
  expect(geometry.radius).toBe('50%');
  expect(geometry.gridArea).toBe('1 / 1');
  expect([geometry.tx, geometry.ty, geometry.sx, geometry.sy]).toEqual([0, 0, 1, 1]);
  await page.evaluate(() => {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = 'Radio states';
    fieldset.append(legend);
    fieldset.style.display = 'grid';
    fieldset.style.gap = '8px';
    for (const state of ['unchecked', 'checked', 'disabled unchecked', 'disabled checked', 'invalid']) {
      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.gap = '8px';
      const input = document.createElement('input');
      input.type = 'radio';
      input.dataset.vfRadio = '';
      input.name = state.startsWith('disabled') ? 'disabled-demo' : state === 'invalid' ? 'invalid-demo' : 'demo';
      input.checked = state === 'checked' || state === 'disabled checked';
      input.disabled = state.startsWith('disabled');
      if (state === 'invalid') input.setAttribute('aria-invalid', 'true');
      label.append(input, document.createTextNode(state));
      fieldset.append(label);
    }
    document.querySelector('main').append(fieldset);
  });
  const group = page.getByRole('group', { name: 'Radio states' });
  const first = group.getByRole('radio', { name: 'unchecked', exact: true });
  const second = group.getByRole('radio', { name: 'checked', exact: true });
  await first.click();
  await expect(first).toBeChecked();
  await expect(second).not.toBeChecked();
  await first.press('ArrowDown');
  await expect(second).toBeChecked();
  await expect(second).toBeFocused();
  await expect(group.getByRole('radio', { name: 'disabled checked', exact: true })).toBeDisabled();
  for (const theme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await page.locator('html').evaluate((element, theme) => { element.dataset.vfTheme = theme; }, theme);
    await group.screenshot({ path: testInfo.outputPath('radio-states-' + theme + '.png') });
  }
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(second).toHaveCSS('appearance', 'auto');
  await expect(second).toBeChecked();
  await group.screenshot({ path: testInfo.outputPath('radio-states-forced-colors.png') });
});
