import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';

test('Text preserves native semantics and shared typography across ports', async ({ page }) => {
  await page.goto(`/components/text/${port}.html`);

  const heading = page.locator('#heading');
  const body = page.locator('#body');
  const label = page.locator('#label');
  const poster = page.locator('#poster');

  await expect(heading).toHaveJSProperty('tagName', 'H2');
  await expect(body).toHaveJSProperty('tagName', 'P');
  await expect(label).toHaveJSProperty('tagName', 'SPAN');
  await expect(poster).toHaveJSProperty('tagName', 'P');

  await expect(heading).toHaveAttribute('data-vf-text-variant', 'heading-md');
  await expect(body).toHaveAttribute('data-vf-text-variant', 'body-md');
  await expect(label).toHaveAttribute('data-vf-text-variant', 'label-md');
  await expect(poster).toHaveAttribute('data-vf-text-variant', 'poster');

  expect(await heading.evaluate((element) => getComputedStyle(element).fontSize)).toBe('30px');
  expect(await body.evaluate((element) => getComputedStyle(element).fontSize)).toBe('16px');
  expect(await label.evaluate((element) => getComputedStyle(element).fontSize)).toBe('14px');
  expect(await label.evaluate((element) => getComputedStyle(element).fontWeight)).toBe('600');
  expect(await poster.evaluate((element) => getComputedStyle(element).fontSize)).toBe('42px');
  expect(await poster.evaluate((element) => getComputedStyle(element).fontWeight)).toBe('700');

  await page.addScriptTag({ content: axeCore.source });
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
