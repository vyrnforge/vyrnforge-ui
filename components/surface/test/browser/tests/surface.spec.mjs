import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';

const port = process.env.VF_COMPONENT_PORT || 'web';

test('Surface provides the same visual boundary without implicit layout across ports', async ({ page }) => {
  await page.goto(`/next/surface-fixtures/${port}.html`);

  const surface = page.locator('#surface');
  await expect(surface).toHaveAttribute('data-vf-surface', '');
  if (port === 'elements') await expect(surface).toHaveJSProperty('tagName', 'VF-SURFACE');
  else await expect(surface).toHaveJSProperty('tagName', 'ARTICLE');

  expect(await surface.evaluate((element) => getComputedStyle(element).display)).toBe('block');
  expect(await surface.evaluate((element) => getComputedStyle(element).paddingTop)).toBe('0px');
  expect(await surface.evaluate((element) => getComputedStyle(element).paddingRight)).toBe('0px');
  expect(await surface.evaluate((element) => getComputedStyle(element).borderTopWidth)).toBe('1px');
  expect(await surface.evaluate((element) => getComputedStyle(element).borderTopStyle)).toBe('solid');
  expect(await surface.evaluate((element) => getComputedStyle(element).borderRadius)).toBe('12px');
  expect(await surface.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgb(255, 255, 255)');
  expect(await surface.evaluate((element) => getComputedStyle(element).color)).toBe('rgb(23, 32, 51)');

  await page.evaluate(() => document.documentElement.setAttribute('data-vf-theme', 'dark'));
  expect(await surface.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgb(23, 27, 36)');
  expect(await surface.evaluate((element) => getComputedStyle(element).color)).toBe('rgb(242, 245, 251)');

  await page.addScriptTag({ content: axeCore.source });
  const results = await page.evaluate(async () => globalThis.axe.run(document));
  expect(results.violations).toEqual([]);
});
