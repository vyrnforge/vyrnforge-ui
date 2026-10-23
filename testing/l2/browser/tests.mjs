import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';

const semantics = {
  link: { tag: 'A' },
  'toggle-button': { tag: 'BUTTON' },
  'number-input': { tag: 'INPUT', type: 'number' },
  checkbox: { tag: 'INPUT', type: 'checkbox' },
  radio: { tag: 'INPUT', type: 'radio' },
  switch: { tag: 'INPUT', type: 'checkbox', role: 'switch' },
  'native-select': { tag: 'SELECT' },
  slider: { tag: 'INPUT', type: 'range' },
  'file-input': { tag: 'INPUT', type: 'file' },
  'color-input': { tag: 'INPUT', type: 'color' },
  'temporal-input': { tag: 'INPUT', type: 'date' },
};

export function defineL2BrowserTests(componentId) {
  const port = process.env.VF_COMPONENT_PORT || 'web';
  const expected = semantics[componentId];
  if (!expected) throw new Error(`Unknown Layer 2 component: ${componentId}`);

  test(`${componentId}/${port} preserves native semantics, focus, styling, and accessibility`, async ({ page }) => {
    await page.goto(`/next/${componentId}-fixtures/${port}.html`);
    const control = page.locator('#control');
    await expect(control).toHaveJSProperty('tagName', expected.tag);
    if (expected.type) await expect(control).toHaveAttribute('type', expected.type);
    if (expected.role) await expect(control).toHaveAttribute('role', expected.role);
    await control.focus();
    await expect(control).toBeFocused();
    expect(await control.evaluate((element) => getComputedStyle(element).outlineStyle)).toBeTruthy();

    if (componentId === 'toggle-button') {
      await expect(control).toHaveAttribute('aria-pressed', 'false');
      await control.click();
      await expect(control).toHaveAttribute('aria-pressed', 'true');
    } else if (componentId === 'checkbox') {
      expect(await control.evaluate((element) => element.indeterminate)).toBe(true);
      await control.click();
      expect(await control.evaluate((element) => element.checked)).toBe(true);
    } else if (componentId === 'number-input') {
      await control.fill('7');
      expect(await page.locator('#form').evaluate((form) => new FormData(form).get('control'))).toBe('7');
    } else if (componentId === 'radio') {
      expect(await control.isChecked()).toBe(true);
      expect(await page.locator('#form').evaluate((form) => new FormData(form).get('choice'))).toBe('one');
    } else if (componentId === 'switch') {
      await control.click();
      expect(await control.isChecked()).toBe(true);
      expect(await page.locator('#form').evaluate((form) => new FormData(form).get('enabled'))).not.toBeNull();
    } else if (componentId === 'native-select') {
      await expect(control).toHaveValue('two');
      await control.selectOption('one');
      expect(await page.locator('#form').evaluate((form) => new FormData(form).get('control'))).toBe('one');
    } else if (componentId === 'slider') {
      const before = Number(await control.inputValue());
      await control.press('ArrowRight');
      expect(Number(await control.inputValue())).toBeGreaterThan(before);
    } else if (componentId === 'file-input') {
      await control.setInputFiles({ name: 'sample.txt', mimeType: 'text/plain', buffer: Buffer.from('sample') });
      expect(await control.evaluate((element) => element.files?.[0]?.name)).toBe('sample.txt');
    } else if (componentId === 'color-input') {
      await expect(control).toHaveValue('#2563eb');
    } else if (componentId === 'temporal-input') {
      await expect(control).toHaveValue('2026-01-21');
    } else if (componentId === 'link') {
      await expect(control).toHaveAttribute('href', '#target');
    }

    await page.addScriptTag({ content: axeCore.source });
    const results = await page.evaluate(async () => globalThis.axe.run(document));
    expect(results.violations).toEqual([]);
  });

  if (componentId === 'switch' || componentId === 'toggle-button') {
    test(`${componentId}/${port} honors reduced motion`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/next/${componentId}-fixtures/${port}.html`);
      expect(await page.locator('#control').evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
    });
  }
}
