import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';

test('Input preserves native form semantics and shared styling across ports', async ({ page }) => {
  await page.goto(`/components/input/${port}.html`);

  const editable = page.locator('#editable');
  const readonly = page.locator('#readonly');
  const disabled = page.locator('#disabled');
  const required = page.locator('#required');
  const appInvalid = page.locator('#app-invalid');
  const quantity = page.locator('#quantity');
  const startsOn = page.locator('#starts-on');
  const accent = page.locator('#accent');

  for (const input of [editable, readonly, disabled, required, appInvalid, quantity, startsOn, accent]) {
    await expect(input).toHaveJSProperty('tagName', 'INPUT');
    await expect(input).toHaveAttribute('data-vf-input', '');
  }

  await editable.fill('changed');
  await expect(editable).toHaveValue('changed');
  await expect(readonly).toHaveAttribute('readonly', '');
  await expect(readonly).toHaveCSS('background-color', 'rgb(250, 250, 250)');
  await expect(disabled).toBeDisabled();

  const formData = await page.locator('#form').evaluate((form) => Object.fromEntries(new FormData(form).entries()));
  expect(formData.editable).toBe('changed');
  expect(formData.readonly).toBe('kept');
  expect(formData.disabled).toBeUndefined();

  expect(await required.evaluate((input) => input.validity.valueMissing)).toBe(true);
  expect(await required.evaluate((input) => input.matches(':invalid'))).toBe(true);
  expect(await required.evaluate((input) => input.matches(':user-invalid'))).toBe(false);
  const normalBoundary = await readonly.evaluate((input) => getComputedStyle(input).borderColor);
  expect(await required.evaluate((input) => getComputedStyle(input).borderColor)).toBe(normalBoundary);
  await page.locator('#form').evaluate((form) => form.requestSubmit());
  expect(await required.evaluate((input) => input.matches(':user-invalid'))).toBe(true);
  await expect.poll(() => required.evaluate((input) => getComputedStyle(input).borderColor)).not.toBe(normalBoundary);
  await expect(appInvalid).toHaveAttribute('aria-invalid', 'true');

  await expect(quantity).toHaveAttribute('type', 'number');
  await expect(quantity).toHaveValue('2');
  await quantity.evaluate((input) => input.stepUp());
  await expect(quantity).toHaveValue('3');

  await expect(startsOn).toHaveAttribute('type', 'date');
  await expect(startsOn).toHaveValue('2026-10-23');

  await expect(accent).toHaveAttribute('type', 'color');
  await expect(accent).toHaveValue('#245edb');
  await expect(accent).toHaveCSS('height', '40px');
  await expect(accent).toHaveCSS('background-color', 'rgb(255, 255, 255)');

  const modeFormData = await page.locator('#form').evaluate((form) => Object.fromEntries(new FormData(form).entries()));
  expect(modeFormData.quantity).toBe('3');
  expect(modeFormData.startsOn).toBe('2026-10-23');
  expect(modeFormData.accent).toBe('#245edb');

  await editable.blur();
  await expect.poll(() => editable.evaluate((input) => getComputedStyle(input).borderColor)).toBe('rgb(113, 113, 122)');
  const normalBorder = await editable.evaluate((input) => getComputedStyle(input).borderColor);
  const invalidBorder = await appInvalid.evaluate((input) => getComputedStyle(input).borderColor);
  expect(invalidBorder).not.toBe(normalBorder);

  await editable.focus();
  expect(await editable.evaluate((input) => getComputedStyle(input).outlineStyle)).not.toBe('none');

  await page.locator('html').evaluate((html) => html.setAttribute('data-vf-theme', 'dark'));
  await expect
    .poll(() => editable.evaluate((input) => getComputedStyle(input).backgroundColor))
    .toBe('rgb(24, 24, 27)');

  
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
