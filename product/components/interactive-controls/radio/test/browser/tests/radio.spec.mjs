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
    const ring = getComputedStyle(element, '::before');
    const dot = getComputedStyle(element, '::after');
    const matrix = new DOMMatrixReadOnly(dot.transform);
    return { width: box.width, height: box.height, left: ring.borderLeftWidth,
      right: ring.borderRightWidth, top: ring.borderTopWidth, bottom: ring.borderBottomWidth,
      indicator: parseFloat(ring.width), gapColor: ring.backgroundColor, ringColor: ring.borderTopColor, dotColor: dot.backgroundColor,
      dotWidth: parseFloat(dot.width), dotHeight: parseFloat(dot.height),
      radius: dot.borderRadius, gridArea: dot.gridArea, tx: matrix.e, ty: matrix.f,
      sx: matrix.a, sy: matrix.d };
  });
  expect(geometry.width).toBeGreaterThanOrEqual(24);
  expect(geometry.height).toBe(geometry.width);
  expect(geometry.left).toBe(geometry.right);
  expect(geometry.top).toBe(geometry.bottom);
  expect(geometry.indicator).toBe(20);
  expect(geometry.left).toBe('2px');
  expect(geometry.dotWidth).toBeCloseTo(geometry.indicator / 2, 1);
  expect(geometry.ringColor).toBe(geometry.dotColor);
  expect(geometry.gapColor).not.toBe(geometry.dotColor);
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


test('radio sizes separate visual indicator from native target', async ({ page }, testInfo) => {
  const port = process.env.VF_COMPONENT_PORT || 'web';
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/radio/' + port + '.html');
  const measurements = await page.evaluate(() => {
    const field = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = 'Radio sizes';
    field.append(legend);
    field.style.display = 'grid';
    field.style.gap = '12px';
    for (const size of ['sm', 'md', 'lg']) {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '12px';
      for (const state of ['unchecked', 'checked', 'disabled']) {
        const label = document.createElement('label');
        label.style.display = 'inline-flex';
        label.style.alignItems = 'center';
        label.style.gap = '8px';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.dataset.vfRadio = '';
        radio.dataset.vfSize = size;
        radio.id = size + '-' + state;
        radio.name = state === 'disabled' ? size + '-disabled' : size;
        radio.checked = state !== 'unchecked';
        radio.disabled = state === 'disabled';
        label.append(radio, document.createTextNode(size + ' ' + state));
        row.append(label);
      }
      field.append(row);
    }
    document.querySelector('main').append(field);
    return ['sm', 'md', 'lg'].map(size => {
      const element = document.getElementById(size + '-checked');
      const box = element.getBoundingClientRect();
      const ring = getComputedStyle(element, '::before');
      const dot = getComputedStyle(element, '::after');
      return { target: box.width, height: box.height, indicator: parseFloat(ring.width),
        indicatorHeight: parseFloat(ring.height), dot: parseFloat(dot.width), dotHeight: parseFloat(dot.height),
        gap: (parseFloat(ring.width) - parseFloat(dot.width)) / 2 - parseFloat(ring.borderTopWidth),
        ringColor: ring.borderTopColor, dotColor: dot.backgroundColor, gapColor: ring.backgroundColor };
    });
  });
  expect(measurements.map(m => m.indicator)).toEqual([20, 24, 28]);
  expect(measurements.map(m => m.target)).toEqual([24, 24, 28]);
  expect(measurements.map(m => m.gap)).toEqual([3, 4, 5]);
  for (const m of measurements) {
    expect(m.height).toBe(m.target);
    expect(m.indicatorHeight).toBe(m.indicator);
    expect(m.dot).toBe(m.indicator / 2);
    expect(m.dotHeight).toBe(m.dot);
    expect(m.ringColor).toBe(m.dotColor);
    expect(m.gapColor).not.toBe(m.dotColor);
  }
  const small = page.locator('#sm-unchecked');
  const bounds = await small.boundingBox();
  await page.mouse.click(bounds.x + 1, bounds.y + bounds.height / 2);
  await expect(small).toBeChecked();
  await expect(page.locator('#sm-checked')).not.toBeChecked();
  const group = page.getByRole('group', { name: 'Radio sizes' });
  for (const theme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await page.locator('html').evaluate((element, theme) => { element.dataset.vfTheme = theme; }, theme);
    await group.screenshot({ path: testInfo.outputPath('radio-sizes-' + theme + '.png') });
  }
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(small).toHaveCSS('appearance', 'auto');
  await expect(small).toHaveCSS('width', '24px');
  await group.screenshot({ path: testInfo.outputPath('radio-sizes-forced-colors.png') });
});
