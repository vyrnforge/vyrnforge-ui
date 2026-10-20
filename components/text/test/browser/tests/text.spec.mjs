import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';

const port = process.env.VF_COMPONENT_PORT || 'web';

test('Text preserves native semantics and shared typography across ports', async ({ page }) => {
  await page.goto(`/next/text-fixtures/${port}.html`);

  const heading = page.locator('#heading');
  const body = page.locator('#body');
  const label = page.locator('#label');

  await expect(heading).toHaveJSProperty('tagName', 'H2');
  await expect(body).toHaveJSProperty('tagName', 'P');
  await expect(label).toHaveJSProperty('tagName', 'SPAN');

  await expect(heading).toHaveAttribute('data-vf-text-variant', 'heading');
  await expect(body).toHaveAttribute('data-vf-text-variant', 'body');
  await expect(label).toHaveAttribute('data-vf-text-variant', 'label');

  expect(await heading.evaluate((element) => getComputedStyle(element).fontSize)).toBe('24px');
  expect(await body.evaluate((element) => getComputedStyle(element).fontSize)).toBe('16px');
  expect(await label.evaluate((element) => getComputedStyle(element).fontSize)).toBe('14px');
  expect(await label.evaluate((element) => getComputedStyle(element).fontWeight)).toBe('600');

  await page.addScriptTag({ content: axeCore.source });
  const results = await page.evaluate(async () => globalThis.axe.run(document));
  expect(results.violations).toEqual([]);
});
