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

test('Slider tooltip stays anchored at native thumb positions, including endpoints', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 900, height: 620 });
  await page.goto('/components/slider/' + port + '.html');
  const control = page.locator('#control');
  const host = control.locator('..');
  const bubble = host.locator('[data-vf-slider-value]');
  await expect(bubble).toBeVisible();
  await host.evaluate(element => {
    element.style.margin = '80px';
    element.style.inlineSize = '240px';
  });
  for (const orientation of ['horizontal', 'vertical']) {
    for (const direction of ['ltr', 'rtl']) {
      await control.evaluate((element, config) => {
        document.documentElement.dir = config.direction;
        element.setAttribute('data-vf-orientation', config.orientation);
        element.parentElement.style.inlineSize = config.orientation === 'vertical' ? 'max-content' : '240px';
      }, { orientation, direction });
      for (const value of [0, 25, 50, 75, 100]) {
        await control.evaluate((element, value) => {
          element.value = String(value);
          element.dispatchEvent(new Event('input', { bubbles: true }));
        }, value);
        await expect(bubble).toHaveText(String(value));
        await expect(bubble).toHaveAttribute('data-vf-tooltip-side', orientation === 'vertical' ? 'left' : 'top');
        await expect.poll(() => control.evaluate((element, config) => {
          const host = element.parentElement;
          const anchor = host.querySelector('[data-vf-slider-thumb-anchor]').getBoundingClientRect();
          const surface = host.querySelector('[data-vf-slider-value]');
          const rect = surface.getBoundingClientRect();
          const input = element.getBoundingClientRect();
          const vertical = config.orientation === 'vertical';
          const extent = vertical ? input.height : input.width;
          const thumb = vertical ? anchor.height : anchor.width;
          const ratio = config.value / 100;
          const expected = vertical ? input.bottom - thumb / 2 - (extent - thumb) * ratio :
            input.left + thumb / 2 + (extent - thumb) * (config.direction === 'rtl' ? 1 - ratio : ratio);
          const center = vertical ? anchor.top + anchor.height / 2 : anchor.left + anchor.width / 2;
          const surfaceCenter = vertical ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
          const pointer = parseFloat(surface.style.getPropertyValue('--_vf-tooltip-arrow-position'));
          const tip = (vertical ? rect.top : rect.left) + pointer;
          return Math.max(Math.abs(center - expected), Math.abs(surfaceCenter - expected), Math.abs(tip - expected));
        }, { orientation, direction, value })).toBeLessThanOrEqual(2);
      }
      await page.screenshot({ path: testInfo.outputPath('slider-tooltip-' + orientation + '-' + direction + '-' + port + '.png') });
    }
  }
});
