import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';

const port = process.env.VF_COMPONENT_PORT || 'web';

test.describe('Tabs Web semantic and styling contract', () => {
  test.skip(port !== 'web', 'Web owns canonical Tabs CSS and semantic styling evidence.');

  test('focus, disabled, accessibility, reduced motion, forced colors, and direction remain usable', async ({ page }) => {
    await page.goto('/next/tabs-fixtures/web.html');
    const selected = page.locator('#web-tabs-tab-overview');
    await expect(selected).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#web-tabs-tab-billing')).toBeDisabled();
    await selected.focus();
    expect(await selected.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');

    await page.addScriptTag({ content: axeCore.source });
    const results = await page.evaluate(async () => globalThis.axe.run(document));
    expect(results.violations).toEqual([]);

    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    expect(await selected.evaluate((element) => getComputedStyle(element).direction)).toBe('rtl');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await selected.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
    expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
    await expect(selected).toBeVisible();
  });
});

test.describe('Tabs framework interaction and hydration', () => {
  for (const framework of ['react', 'angular', 'vue']) {
    test(`${framework} supports automatic navigation, wrapping, disabled skipping, and hydration`, async ({ page }) => {
      test.skip(port !== framework, `Running ${port} evidence only`);
      const errors = [];
      page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
      await page.goto(`/next/tabs-fixtures/${framework}.html`);

      const root = page.locator(`#${framework}-tabs`);
      const overview = page.locator(`#${framework}-tabs-tab-overview`);
      const billing = page.locator(`#${framework}-tabs-tab-billing`);
      const security = page.locator(`#${framework}-tabs-tab-security`);
      await expect(root).toHaveAttribute('data-vf-tabs-root', '');
      await expect(overview).toHaveAttribute('aria-selected', 'true');
      await expect(billing).toBeDisabled();
      await overview.focus();
      await page.keyboard.press('ArrowRight');
      await expect(security).toBeFocused();
      await expect(security).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator(`#${framework}-tabs-panel-security`)).toBeVisible();
      await expect(page.locator('body')).toHaveAttribute('data-value', 'security');

      await page.keyboard.press('ArrowRight');
      await expect(overview).toBeFocused();
      await page.keyboard.press('End');
      await expect(security).toBeFocused();
      await page.keyboard.press('Home');
      await expect(overview).toBeFocused();

      expect(errors.filter((error) => /hydration|mismatch/i.test(error))).toEqual([]);
      await page.addScriptTag({ content: axeCore.source });
      const results = await page.evaluate(async (selector) => globalThis.axe.run(document.querySelector(selector)), `#${framework}-tabs`);
      expect(results.violations).toEqual([]);
    });

    test(`${framework} reverses horizontal arrows in RTL`, async ({ page }) => {
      test.skip(port !== framework, `Running ${port} evidence only`);
      await page.goto(`/next/tabs-fixtures/${framework}.html`);
      const root = page.locator(`#${framework}-tabs`);
      await root.evaluate((element) => { element.setAttribute('dir', 'rtl'); });
      const overview = page.locator(`#${framework}-tabs-tab-overview`);
      const security = page.locator(`#${framework}-tabs-tab-security`);
      await overview.focus();
      await page.keyboard.press('ArrowLeft');
      await expect(security).toBeFocused();
    });
  }
});
