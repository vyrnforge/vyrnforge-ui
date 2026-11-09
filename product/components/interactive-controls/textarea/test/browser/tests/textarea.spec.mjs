import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';

test('Textarea preserves native multiline form semantics and shared styling across ports', async ({ page }) => {
  await page.goto(`/components/textarea/${port}.html`);

  const editable = page.locator('#editable');
  const readonly = page.locator('#readonly');
  const disabled = page.locator('#disabled');
  const required = page.locator('#required');
  const constrained = page.locator('#constrained');
  const appInvalid = page.locator('#app-invalid');

  for (const textarea of [editable, readonly, disabled, required, constrained, appInvalid]) {
    await expect(textarea).toHaveJSProperty('tagName', 'TEXTAREA');
    await expect(textarea).toHaveAttribute('data-vf-textarea', '');
  }

  await expect(editable).toHaveAttribute('rows', '4');
  await expect(editable).toHaveAttribute('cols', '30');
  await expect(editable).toHaveAttribute('wrap', 'soft');
  expect(await editable.evaluate((textarea) => getComputedStyle(textarea).resize)).not.toBe('none');

  await editable.fill('changed\nline');
  await expect(editable).toHaveValue('changed\nline');
  await expect(readonly).toHaveAttribute('readonly', '');
  await expect(disabled).toBeDisabled();

  const formData = await page.locator('#form').evaluate((form) => Object.fromEntries(new FormData(form).entries()));
  expect(formData.editable).toBe('changed\nline');
  expect(formData.readonly).toBe('kept');
  expect(formData.disabled).toBeUndefined();

  await page.locator('#form').evaluate((form) => form.reset());
  await expect(editable).toHaveValue('alpha\nbeta');

  expect(await required.evaluate((textarea) => textarea.validity.valueMissing)).toBe(true);
  await constrained.fill('x');
  expect(await constrained.evaluate((textarea) => textarea.validity.tooShort)).toBe(true);
  await expect(constrained).toHaveAttribute('minlength', '3');
  await expect(constrained).toHaveAttribute('maxlength', '8');
  await expect(appInvalid).toHaveAttribute('aria-invalid', 'true');

  const normalBorder = await editable.evaluate((textarea) => getComputedStyle(textarea).borderColor);
  const invalidBorder = await appInvalid.evaluate((textarea) => getComputedStyle(textarea).borderColor);
  expect(invalidBorder).not.toBe(normalBorder);

  await editable.focus();
  expect(await editable.evaluate((textarea) => getComputedStyle(textarea).outlineStyle)).not.toBe('none');

  await page.locator('html').evaluate((html) => html.setAttribute('data-vf-theme', 'dark'));
  await expect
    .poll(() => editable.evaluate((textarea) => getComputedStyle(textarea).backgroundColor))
    .toBe('rgb(24, 24, 27)');

  
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
