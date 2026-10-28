import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';
import { loadNativeControlContract } from './native-control-contract.mjs';

export async function defineNativeControlBrowserTests(componentId) {
  const contract = await loadNativeControlContract(componentId);
  const port = process.env.VF_COMPONENT_PORT || 'web';

  test(`${componentId}/${port} preserves native semantics, focus, styling, and accessibility`, async ({ page }) => {
    await page.goto(`/components/${componentId}/${port}.html`);
    const control = page.locator('#control');
    await expect(control).toHaveJSProperty('tagName', contract.semantics.tag);
    if (contract.semantics.type) await expect(control).toHaveAttribute('type', contract.semantics.type);
    if (contract.semantics.role) await expect(control).toHaveAttribute('role', contract.semantics.role);
    await control.focus();
    await expect(control).toBeFocused();
    expect(await control.evaluate((element) => getComputedStyle(element).outlineStyle)).toBeTruthy();
    if (contract.assertBrowser) await contract.assertBrowser({ page, control, expect });
    await page.addScriptTag({ content: axeCore.source });
    const results = await page.evaluate(async () => globalThis.axe.run(document));
    expect(results.violations).toEqual([]);
  });

  if (contract.reducedMotion) {
    test(`${componentId}/${port} honors reduced motion`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/components/${componentId}/${port}.html`);
      expect(await page.locator('#control').evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
    });
  }
}
