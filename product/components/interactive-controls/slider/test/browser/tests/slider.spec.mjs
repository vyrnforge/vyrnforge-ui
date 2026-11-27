import { defineNativeControlBrowserTests } from '../../../../../../_test-support/native-controls/native-control-browser-tests.mjs';
await defineNativeControlBrowserTests('slider');

import { test, expect } from '@playwright/test';
const port = process.env.VF_COMPONENT_PORT || 'web';
test('Slider preserves geometry and environment states', async ({ page }, testInfo) => {
  await page.goto('/components/slider/' + port + '.html');
  const control = page.locator('#control');
  await expect(control).toHaveAttribute('data-vf-slider-enhanced', '');
  const parent = control.locator('..');
  await expect(parent.locator('[data-vf-slider-value]')).toBeVisible();
  for (const [size, height] of [['sm', 32], ['md', 40], ['lg', 48]]) {
    await control.evaluate((element, size) => element.setAttribute('data-vf-size', size), size);
    await expect(control).toHaveCSS('height', height + 'px');
  }
  await page.screenshot({ path: testInfo.outputPath('slider-horizontal-' + port + '.png') });
  await control.evaluate(element => { element.setAttribute('data-vf-orientation', 'vertical'); element.setAttribute('aria-orientation', 'vertical'); });
  await expect(control).toHaveCSS('writing-mode', 'vertical-lr');
  await expect(control).toHaveCSS('height', '192px');
  await control.focus();
  await control.press('ArrowUp');
  await expect(control).toHaveJSProperty('value', '55');
  await page.screenshot({ path: testInfo.outputPath('slider-vertical-' + port + '.png') });
  await control.evaluate(element => { element.setAttribute('data-vf-orientation', 'horizontal'); element.removeAttribute('aria-orientation'); document.documentElement.dir = 'rtl'; });
  await expect(control).toHaveCSS('direction', 'rtl');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await expect(control).toHaveCSS('appearance', 'auto');
});

test('Slider labels fit a narrow native presentation without changing ticks', async ({ page }) => {
  await page.goto('/components/slider/' + port + '.html');
  const control = page.locator('#control');
  await expect(control).toHaveAttribute('data-vf-slider-enhanced', '');
  const host = control.locator('..');
  await host.evaluate(element => { element.style.inlineSize = '90px'; });
  await expect.poll(() => host.evaluate(element => {
    const bounds = element.getBoundingClientRect();
    const rects = Array.from(element.querySelectorAll('[data-vf-slider-mark-label]'))
      .filter(label => getComputedStyle(label).visibility !== 'hidden')
      .map(label => label.getBoundingClientRect()).sort((a, b) => a.left - b.left);
    return rects.every((rect, index) => rect.left >= bounds.left - 0.5 && rect.right <= bounds.right + 0.5 &&
      (!index || rect.left >= rects[index - 1].right));
  })).toBe(true);
  await expect(host.locator('[data-vf-slider-mark]')).toHaveCount(3);
});
