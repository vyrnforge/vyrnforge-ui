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

test('Input and native color subtype inherit comfortable/compact control rhythm without per-instance sizing', async ({ page }, testInfo) => {
  await page.goto(`/components/input/${port}.html`);
  const editable = page.locator('#editable');
  const color = page.locator('#accent');
  await expect(editable).toHaveCSS('min-height', '40px');
  await expect(editable).toHaveCSS('padding-top', '7px');
  await expect(color).toHaveCSS('height', '40px');

  await page.locator('html').evaluate((node) => node.setAttribute('data-vf-density', 'compact'));
  await expect(editable).toHaveCSS('min-height', '32px');
  await expect(editable).toHaveCSS('padding-top', '2px');
  await expect(color).toHaveCSS('height', '32px');
  expect((await editable.boundingBox())?.height).toBeGreaterThanOrEqual(32);

  await page.locator('#form').evaluate((node) => node.setAttribute('data-vf-density', 'comfortable'));
  await expect(editable).toHaveCSS('min-height', '40px');
  await expect(color).toHaveCSS('height', '40px');
  await page.locator('#form').evaluate((node) => node.removeAttribute('data-vf-density'));
  await expect(editable).toHaveCSS('min-height', '32px');

  await editable.focus();
  await expect(editable).toBeFocused();
  expect(await editable.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
  await page.locator('html').evaluate((node) => node.setAttribute('data-vf-theme', 'dark'));
  await expect(editable).toHaveCSS('min-height', '32px');
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(editable).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath(`input-density-${port}.png`), fullPage: true });
});

test('compact Input preserves width and access at 320px with 200% text', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto(`/components/input/${port}.html`);
  await page.locator('html').evaluate((el) => {
    el.setAttribute('data-vf-density', 'compact');
    el.style.fontSize = '200%';
    el.dir = 'rtl';
  });
  const input = page.locator('#editable');
  await input.focus();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('alpha');
  const bounds = await input.boundingBox();
  expect(bounds.height).toBeGreaterThanOrEqual(32);
  const width = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.client);
  await page.keyboard.press('Tab');
  await expect(page.locator('#readonly')).toBeFocused();
});


test('Input keeps disabled presentation authoritative when application invalid state remains', async ({ page }) => {
  await page.goto(`/components/input/${port}.html`);
  const disabled = page.locator('#disabled');
  for (const forcedColors of ['none', 'active']) {
    await page.emulateMedia({ forcedColors });
    const before = await disabled.evaluate((node) => getComputedStyle(node).borderColor);
    await disabled.evaluate((node) => node.setAttribute('aria-invalid', 'true'));
    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveAttribute('aria-invalid', 'true');
    await expect.poll(() => disabled.evaluate((node) => getComputedStyle(node).borderColor)).toBe(before);
    await disabled.evaluate((node) => node.removeAttribute('aria-invalid'));
  }
});

test('Input native reset restores the authored default value', async ({ page }) => {
  await page.goto(`/components/input/${port}.html`);
  const editable = page.locator('#editable');
  await editable.fill('changed');
  await page.locator('#form').evaluate((form) => form.reset());
  await expect(editable).toHaveValue('alpha');
});


test('typed React editor tokens reach every native Input mode and specialized editor', async ({ page }) => {
  test.skip(port !== 'react', 'React token authoring contract');
  await page.goto('/components/input/react-token-audit.html');
  const modes = ['text', 'email', 'password', 'search', 'tel', 'url', 'number', 'date', 'time', 'datetime-local', 'month', 'week', 'color'];
  for (const scope of ['central', 'local']) {
    const root = page.locator('#' + scope);
    const names = [...modes, 'textarea', 'special-number', 'special-password', 'special-search', 'special-color', 'special-otp', 'special-combo', 'select', 'file'];
    for (const name of names) {
      const input = root.locator('[data-token-audit="' + name + '"]');
      await expect(input, name).toHaveCSS('border-top-left-radius', '11px');
      await expect(input, name).toHaveCSS('background-color', 'rgb(242, 243, 244)');
      await expect(input, name).toHaveCSS('border-top-color', 'rgb(35, 69, 103)');
      await expect(input, name).toHaveCSS('font-size', '18px');
    }
    for (const name of [...modes.map(type => 'field-' + type), 'auto']) {
      const input = root.locator('[data-token-audit="' + name + '"]');
      const shell = root.locator('[data-vf-text-field-control]').filter({ has: input });
      await expect(shell, name).toHaveCSS('border-top-left-radius', '11px');
      await expect(shell, name).toHaveCSS('background-color', 'rgb(242, 243, 244)');
      await expect(input, name).toHaveCSS('font-size', '18px');
    }
    await expect(root.locator('[data-token-audit="instance"]')).toHaveCSS('font-size', '20px');
    const placeholder = await root.locator('[data-token-audit="text"]').evaluate(el => getComputedStyle(el, '::placeholder').fontSize);
    expect(placeholder).toBe('14px');
  }
  await expect(page.locator('[data-token-audit="outside"]')).not.toHaveCSS('border-top-left-radius', '11px');
});
