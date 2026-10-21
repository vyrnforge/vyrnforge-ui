import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';

const port = process.env.VF_COMPONENT_PORT || 'web';

test('Input preserves native form semantics and shared styling across ports', async ({ page }) => {
  await page.goto(`/next/input-fixtures/${port}.html`);

  const editable = page.locator('#editable');
  const readonly = page.locator('#readonly');
  const disabled = page.locator('#disabled');
  const required = page.locator('#required');
  const appInvalid = page.locator('#app-invalid');

  for (const input of [editable, readonly, disabled, required, appInvalid]) {
    await expect(input).toHaveJSProperty('tagName', 'INPUT');
    await expect(input).toHaveAttribute('data-vf-input', '');
  }

  await editable.fill('changed');
  await expect(editable).toHaveValue('changed');
  await expect(readonly).toHaveAttribute('readonly', '');
  await expect(disabled).toBeDisabled();

  const formData = await page.locator('#form').evaluate((form) => Object.fromEntries(new FormData(form).entries()));
  expect(formData.editable).toBe('changed');
  expect(formData.readonly).toBe('kept');
  expect(formData.disabled).toBeUndefined();

  expect(await required.evaluate((input) => input.validity.valueMissing)).toBe(true);
  expect(await required.evaluate((input) => input.matches(':invalid'))).toBe(true);
  await expect(appInvalid).toHaveAttribute('aria-invalid', 'true');

  const normalBorder = await editable.evaluate((input) => getComputedStyle(input).borderColor);
  const invalidBorder = await appInvalid.evaluate((input) => getComputedStyle(input).borderColor);
  expect(invalidBorder).not.toBe(normalBorder);

  await editable.focus();
  expect(await editable.evaluate((input) => getComputedStyle(input).outlineStyle)).not.toBe('none');

  await page.locator('html').evaluate((html) => html.setAttribute('data-vf-theme', 'dark'));
  await expect
    .poll(() => editable.evaluate((input) => getComputedStyle(input).backgroundColor))
    .toBe('rgb(23, 27, 36)');

  await page.addScriptTag({ content: axeCore.source });
  const results = await page.evaluate(async () => globalThis.axe.run(document));
  expect(results.violations).toEqual([]);
});
