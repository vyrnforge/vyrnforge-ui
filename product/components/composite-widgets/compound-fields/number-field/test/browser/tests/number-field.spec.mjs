import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('number field steps a native numeric value', async ({ page }) => {
  await page.goto(`/components/number-field/${port}.html`);
  if (port !== 'web') await expect(page.locator('body')).toHaveAttribute('data-number-field-ready', 'true');
  await expect(page.locator('#input')).toHaveValue('2');
  await page.locator('#inc').click();
  await expect(page.locator('#input')).toHaveValue('3');
  await page.locator('#dec').click();
  await expect(page.locator('#input')).toHaveValue('2');
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('public NumberField CSS resolves the canonical control radius in light and dark themes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/number-field/web.html');
  const input = page.locator('#input');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(input).toHaveCSS('border-radius', '6px');
  }
});

test('Elements NumberField isolates nested ownership and ignores cancelled or unavailable steps', async ({ page }) => {
  test.skip(port !== 'elements', 'Elements owns authored native number input stepping.');
  await page.goto('/components/number-field/elements.html');
  await expect(page.locator('body')).toHaveAttribute('data-number-field-ready', 'true');
  const input = page.locator('#input');
  const increment = page.locator('#inc');
  await page.locator('#input-root').evaluate((root) => {
    root.addEventListener('input', () => {
      document.body.dataset.inputEvents = String(Number(document.body.dataset.inputEvents ?? 0) + 1);
    });
  });
  await page.locator('#nested-inc').click();
  await expect(page.locator('#nested')).toHaveValue('5');
  await expect(input).toHaveValue('2');
  await expect(page.locator('body')).toHaveAttribute('data-input-events', '1');
  await increment.evaluate((button) =>
    button.addEventListener('click', (event) => event.preventDefault(), { once: true }),
  );
  await increment.click();
  await expect(input).toHaveValue('2');
  await input.evaluate((element) => {
    element.readOnly = true;
  });
  await increment.click();
  await expect(input).toHaveValue('2');
  await input.evaluate((element) => {
    element.readOnly = false;
    element.disabled = true;
  });
  await increment.click();
  await expect(input).toHaveValue('2');
  await input.evaluate((element) => {
    element.disabled = false;
    element.step = 'any';
  });
  await increment.click();
  await expect(input).toHaveValue('2');
  await input.evaluate((element) => {
    element.step = '1';
    element.value = '10';
  });
  await increment.click();
  await expect(input).toHaveValue('10');
  await expect(page.locator('body')).toHaveAttribute('data-input-events', '1');
  await page.locator('#input-root').dispatchEvent('click');
  await expect(input).toHaveValue('10');
  await expect(page.locator('body')).toHaveAttribute('data-input-events', '1');
  await page.locator('#dec').click();
  await expect(input).toHaveValue('9');
  await expect(page.locator('body')).toHaveAttribute('data-input-events', '2');
});

const frameworkPorts = new Set(['react', 'angular', 'vue']);
test('NumberField keeps native empty and constraint validity separate from committed numeric requests', async ({
  page,
}) => {
  test.skip(!frameworkPorts.has(port), 'Framework roots own committed numeric values.');
  await page.goto(`/components/number-field/${port}.html`);
  const body = page.locator('body');
  await expect(body).toHaveAttribute('data-number-field-ready', 'true');
  const input = page.locator('#input');
  await expect(input).toHaveAttribute('min', '0');
  await expect(input).toHaveAttribute('max', '10');
  await expect(input).toHaveAttribute('step', '1');
  await expect(body).not.toHaveAttribute('data-quantity-count', /.+/);
  await input.fill('11');
  await expect(input).toHaveValue('11');
  await expect(body).toHaveAttribute('data-quantity', '11');
  expect(await input.evaluate((element) => element.validity.rangeOverflow)).toBe(true);
  await input.fill('1.5');
  await expect(input).toHaveValue('1.5');
  await expect(body).toHaveAttribute('data-quantity', '1.5');
  expect(await input.evaluate((element) => element.validity.stepMismatch)).toBe(true);
  await page.locator('#inc').click();
  await expect(input).toHaveValue('2');
  await expect(body).toHaveAttribute('data-quantity', '2');
  await input.fill('');
  await expect(input).toHaveValue('');
  await expect(body).toHaveAttribute('data-quantity', 'null');
  expect(await input.evaluate((element) => element.validity.valueMissing)).toBe(true);
  expect(await page.locator('#number-form').evaluate((form) => new FormData(form).get('input'))).toBe('');
  const count = await body.getAttribute('data-quantity-count');
  await input.pressSequentially('-');
  await expect(body).toHaveAttribute('data-quantity-count', count);
  await input.fill('3');
  await expect(body).toHaveAttribute('data-quantity', '3');
  await expect(input).toHaveValue('3');
});

test('NumberField reconciles controlled rejection and programmatic changes without phantom intents', async ({
  page,
}) => {
  test.skip(!frameworkPorts.has(port), 'Framework roots own controlled values.');
  await page.goto(`/components/number-field/${port}.html`);
  const body = page.locator('body');
  await expect(body).toHaveAttribute('data-number-field-ready', 'true');
  const input = page.locator('#controlled');
  await expect(input).toHaveValue('2');
  await page.locator('#controlled-inc').click();
  await expect(body).toHaveAttribute('data-controlled-request', '3');
  await expect(input).toHaveValue('2');
  await input.fill('');
  await expect(body).toHaveAttribute('data-controlled-request', 'null');
  await expect(input).toHaveValue('2');
  await expect(body).toHaveAttribute('data-controlled-request-count', '2');
  await page.locator('#set-controlled').click();
  await expect(input).toHaveValue('7');
  await page.locator('#clear-controlled').click();
  await expect(input).toHaveValue('');
  await expect(body).toHaveAttribute('data-controlled-request-count', '2');
});

test('NumberField delegates fractional stepping and unavailable actions to native controls', async ({ page }) => {
  test.skip(!frameworkPorts.has(port), 'Framework root constraints are exercised here.');
  await page.goto(`/components/number-field/${port}.html`);
  const body = page.locator('body');
  await expect(body).toHaveAttribute('data-number-field-ready', 'true');
  const fractional = page.locator('#fractional');
  const increment = page.locator('#fractional-inc');
  for (const value of ['0.3', '0.5', '0.7']) {
    await increment.click();
    await expect(fractional).toHaveValue(value);
    await expect(body).toHaveAttribute('data-fractional', value);
  }
  await increment.click();
  await expect(fractional).toHaveValue('0.7');
  await expect(body).toHaveAttribute('data-fractional-count', '3');
  await expect(page.locator('#readonly')).toHaveJSProperty('readOnly', true);
  await expect(page.locator('#readonly-inc')).toBeDisabled();
  await expect(page.locator('#disabled')).toBeDisabled();
  await expect(page.locator('#disabled-inc')).toBeDisabled();
  await expect(page.locator('#any')).toHaveValue('');
  await expect(page.locator('#any')).toHaveAttribute('step', 'any');
  await expect(page.locator('#any-inc')).toBeDisabled();
  await page.locator('#any').fill('0.125');
  await expect(body).toHaveAttribute('data-any-value', '0.125');
});

test('native NumberField reset restores defaults without fabricating input events', async ({ page }) => {
  await page.goto(`/components/number-field/${port}.html`);
  if (port !== 'web') await expect(page.locator('body')).toHaveAttribute('data-number-field-ready', 'true');
  const input = page.locator('#input');
  const form = page.locator('#number-form');
  await input.fill('5');
  await form.evaluate(async (element) => {
    element.addEventListener('reset', (event) => event.preventDefault(), { once: true });
    element.reset();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
  await expect(input).toHaveValue('5');
  await form.evaluate((element) => {
    element.addEventListener('input', () => {
      document.body.dataset.resetInput = 'unexpected';
    });
    const button = document.createElement('button');
    button.type = 'reset';
    button.textContent = 'Reset numbers';
    element.append(button);
  });
  await page.getByRole('button', { name: 'Reset numbers' }).click();
  await expect(input).toHaveValue('2');
  expect(await form.evaluate((element) => new FormData(element).get('input'))).toBe('2');
  await expect(page.locator('body')).not.toHaveAttribute('data-reset-input', 'unexpected');
  if (frameworkPorts.has(port)) {
    await expect(page.locator('body')).toHaveAttribute('data-quantity', '5');
    await expect(page.locator('body')).toHaveAttribute('data-quantity-count', '1');
  }
  await page.locator('#inc').click();
  await expect(input).toHaveValue('3');
  if (frameworkPorts.has(port)) await expect(page.locator('body')).toHaveAttribute('data-quantity', '3');
});

test('NumberField reset preserves controlled values and restores a nullable initial value', async ({ page }) => {
  test.skip(!frameworkPorts.has(port), 'Framework roots own committed numeric values.');
  await page.goto(`/components/number-field/${port}.html`);
  const body = page.locator('body');
  await expect(body).toHaveAttribute('data-number-field-ready', 'true');
  const controlled = page.locator('#controlled');
  const any = page.locator('#any');
  await page.locator('#set-controlled').click();
  await expect(controlled).toHaveValue('7');
  await any.fill('0.125');
  await expect(body).toHaveAttribute('data-any-value', '0.125');
  const form = page.locator('#number-form');
  await form.evaluate(async (element) => {
    element.reset();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
  await expect(controlled).toHaveValue('7');
  await expect(any).toHaveValue('');
  await expect(body).toHaveAttribute('data-any-value-count', '1');
  await expect(body).not.toHaveAttribute('data-controlled-request-count', /.+/);
  expect(await form.evaluate((element) => new FormData(element).get('controlled'))).toBe('7');
  expect(await form.evaluate((element) => new FormData(element).get('any'))).toBe('');
  await any.fill('0.125');
  await expect(body).toHaveAttribute('data-any-value-count', '2');
  await page.locator('#clear-controlled').click();
  await expect(controlled).toHaveValue('');
  await form.evaluate(async (element) => {
    element.reset();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
  await expect(controlled).toHaveValue('');
  await expect(body).not.toHaveAttribute('data-controlled-request-count', /.+/);
});

test('React composed NumberField preserves native behavior and shared relationships', async ({ page }) => {
  test.skip(port !== 'react', 'High-level composition is React-first.');
  await page.goto('/components/number-field/react.html');
  await expect(page.locator('body')).toHaveAttribute('data-number-field-ready', 'true');
  const input = page.getByRole('spinbutton', { name: 'Order quantity' });
  await expect(input).toHaveAccessibleDescription('Number of items');
  await expect(input).toHaveAttribute('type', 'number');
  await expect(input).toHaveAttribute('data-vf-input', '');
  await page.getByRole('button', { name: 'Add order item' }).click();
  await expect(input).toHaveValue('2');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('3');
  await input.fill('101');
  expect(await input.evaluate((el) => el.validity.rangeOverflow)).toBe(true);
  await input.fill('');
  await expect(page.locator('body')).toHaveAttribute('data-order', 'null');
  await input.fill('7');
  expect(await page.locator('#number-form').evaluate((form) => new FormData(form).get('order'))).toBe('7');
  const accepted = page.getByRole('spinbutton', { name: 'Adjustment' });
  await page.getByRole('button', { name: 'Increase adjustment' }).click();
  await expect(accepted).toHaveValue('-2.4');
  await accepted.fill('3.25');
  await expect(accepted).toHaveValue('3.25');
  await page.locator('#number-form').evaluate((form) => form.reset());
  await expect(input).toHaveValue('1');
  await expect(accepted).toHaveValue('3.25');
  const empty = page.getByRole('spinbutton', { name: 'Empty amount' });
  await expect(empty).toHaveValue('');
  await expect(empty).toHaveAttribute('aria-invalid', 'true');
  await expect(empty).toHaveAccessibleDescription('Enter amount');
});

test('React composed NumberField renders responsive native, stacked and horizontal fields', async ({
  page,
}, testInfo) => {
  test.skip(port !== 'react', 'High-level composition is React-first.');
  await page.goto('/components/number-field/react.html');
  await expect(page.locator('body')).toHaveAttribute('data-number-field-ready', 'true');
  for (const mode of [
    { name: 'desktop-light', width: 1280, theme: 'light', dir: 'ltr' },
    { name: 'mobile-dark-rtl', width: 375, theme: 'dark', dir: 'rtl' },
    { name: 'mobile-forced-colors', width: 375, theme: 'light', dir: 'ltr', forcedColors: 'active' },
  ]) {
    await page.setViewportSize({ width: mode.width, height: 900 });
    await page.emulateMedia({ forcedColors: mode.forcedColors || 'none', reducedMotion: 'reduce' });
    await page.locator('html').evaluate((el, settings) => {
      el.setAttribute('data-vf-theme', settings.theme);
      el.dir = settings.dir;
    }, mode);
    const button = page.getByRole('button', { name: 'Increase adjustment' });
    const bounds = await button.boundingBox();
    expect(bounds.width).toBeGreaterThanOrEqual(24);
    expect(bounds.height).toBeGreaterThanOrEqual(24);
    const custom = page.getByRole('spinbutton', { name: 'Custom typography' });
    await expect(custom).toHaveCSS('font-size', '20px');
    await expect(custom).toHaveCSS('font-weight', '600');
    await page.screenshot({ path: testInfo.outputPath(mode.name + '.png'), fullPage: true });
  }
});
