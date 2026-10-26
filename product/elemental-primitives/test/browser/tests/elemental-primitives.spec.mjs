import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';

const port = process.env.VF_COMPONENT_PORT || 'web';

test('Elemental primitives preserve native semantics and shared presentation', async ({ page }) => {
  await page.goto(`/next/elemental-primitives-fixtures/${port}.html`);

  await expect(page.locator('#code')).toHaveJSProperty('tagName', 'CODE');
  await expect(page.locator('#kbd')).toHaveJSProperty('tagName', 'KBD');
  await expect(page.locator('#mark')).toHaveJSProperty('tagName', 'MARK');
  await expect(page.locator('#image')).toHaveJSProperty('tagName', 'IMG');
  await expect(page.locator('#skeleton')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#swatch')).toHaveAttribute('aria-label', 'Brand blue');

  expect(await page.locator('#code').evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/mono/i);
  expect(await page.locator('#code').evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  expect(await page.locator('#kbd').evaluate((el) => getComputedStyle(el).display)).toBe('inline-block');
  expect(await page.locator('#image').evaluate((el) => getComputedStyle(el).maxInlineSize)).toBe('100%');
  expect(await page.locator('#skeleton').evaluate((el) => getComputedStyle(el).animationName)).toBe('vf-skeleton-pulse');
  expect(await page.locator('#swatch').evaluate((el) => getComputedStyle(el).width)).toBe('20px');
  expect(await page.locator('#prose h2').evaluate((el) => getComputedStyle(el).fontWeight)).toBe('600');
  expect(await page.locator('#prose blockquote').evaluate((el) => getComputedStyle(el).borderInlineStartWidth)).toBe('3px');
  expect(await page.locator('#checkmark').evaluate((el) => getComputedStyle(el).width)).toBe('8px');
  expect(await page.locator('#radiomark').evaluate((el) => getComputedStyle(el).borderRadius)).not.toBe('0px');
  expect(await page.locator('#selection').evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');

  for (const tag of ['blockquote', 'q', 'figure', 'figcaption', 'ul', 'li', 'strong', 'em', 'small', 'sub', 'sup', 'abbr', 'address', 'cite', 'time']) {
    await expect(page.locator(`#prose ${tag}`).first()).toHaveJSProperty('tagName', tag.toUpperCase());
  }

  await page.addScriptTag({ content: axeCore.source });
  const results = await page.evaluate(async () => globalThis.axe.run(document));
  expect(results.violations).toEqual([]);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('#skeleton').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
});
