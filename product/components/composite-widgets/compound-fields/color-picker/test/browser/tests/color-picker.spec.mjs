import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('color picker synchronizes accessible inputs', async ({ page }) => {
  await page.goto(`/components/color-picker/${port}.html`);
  if (port !== 'web') await expect(page.locator('body')).toHaveAttribute('data-color-ready', 'true');
  await page.locator('#text').fill('#ff0000');
  await expect(page.locator('#color')).toHaveValue('#ff0000');
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('public ColorPicker CSS resolves canonical spacing and control radius in light and dark themes', async ({
  page,
}) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/color-picker/web.html');
  const root = page.locator('#root');
  const swatch = page.locator('#swatch');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(root).toHaveCSS('gap', '8px');
    await expect(swatch).toHaveCSS('border-top-left-radius', '6px');
    await expect(swatch).toHaveCSS('border-top-right-radius', '6px');
  }
});

test('ColorPicker preserves invalid drafts and synchronizes complete hex and native acquisition', async ({ page }) => {
  await page.goto(`/components/color-picker/${port}.html`);
  const body = page.locator('body');
  if (port !== 'web') await expect(body).toHaveAttribute('data-color-ready', 'true');
  const text = page.locator('#text');
  const color = page.locator('#color');
  const swatch = page.locator('#swatch');
  await expect(color).toHaveValue('#3366ff');
  await text.fill('#ab');
  await text.blur();
  await expect(text).toHaveValue('#ab');
  expect(await text.evaluate((input) => input.validity.patternMismatch)).toBe(true);
  await expect(color).toHaveValue('#3366ff');
  await expect(swatch).toHaveCSS('background-color', 'rgb(51, 102, 255)');
  await expect(body).not.toHaveAttribute('data-color-value-count', /.+/);
  await text.fill('#ABCDEF');
  await expect(text).toHaveValue('#abcdef');
  await expect(color).toHaveValue('#abcdef');
  await expect(swatch).toHaveCSS('background-color', 'rgb(171, 205, 239)');
  await color.fill('#112233');
  await expect(text).toHaveValue('#112233');
  await expect(swatch).toHaveCSS('background-color', 'rgb(17, 34, 51)');
  expect(await page.locator('#color-form').evaluate((form) => new FormData(form).get('color'))).toBe('#112233');
  if (['react', 'angular', 'vue'].includes(port)) {
    await expect(body).toHaveAttribute('data-color-value', '#112233');
    await expect(body).toHaveAttribute('data-color-value-count', '2');
  }
});

test('ColorPicker controlled owner rejects requests and synchronizes externally committed color', async ({ page }) => {
  test.skip(!['react', 'angular', 'vue'].includes(port), 'Framework root owns controlled color.');
  await page.goto(`/components/color-picker/${port}.html`);
  const body = page.locator('body');
  await expect(body).toHaveAttribute('data-color-ready', 'true');
  const color = page.locator('#controlled-color');
  const text = page.locator('#controlled-text');
  const swatch = page.locator('#controlled-swatch');
  await text.fill('#ff');
  await expect(text).toHaveValue('#ff');
  await expect(color).toHaveValue('#112233');
  await text.fill('#ff0000');
  await expect(body).toHaveAttribute('data-color-request', '#ff0000');
  await expect(color).toHaveValue('#112233');
  await expect(text).toHaveValue('#112233');
  await color.fill('#00ff00');
  await expect(body).toHaveAttribute('data-color-request', '#00ff00');
  await expect(color).toHaveValue('#112233');
  await expect(swatch).toHaveCSS('background-color', 'rgb(17, 34, 51)');
  await expect(body).toHaveAttribute('data-color-request-count', '2');
  await page.locator('#set-color').click();
  await expect(color).toHaveValue('#abcdef');
  await expect(text).toHaveValue('#abcdef');
  await expect(swatch).toHaveCSS('background-color', 'rgb(171, 205, 239)');
  await expect(body).toHaveAttribute('data-color-request-count', '2');
  await expect(page.locator('#disabled-color')).toBeDisabled();
  await expect(page.locator('#disabled-text')).toBeDisabled();
  await expect(page.locator('#readonly-text')).toHaveJSProperty('readOnly', true);
  await expect(page.locator('#readonly-color')).toBeEnabled();
});

test('Elements ColorPicker isolates nested native acquisition and text synchronization', async ({ page }) => {
  test.skip(port !== 'elements', 'Native custom element ownership.');
  await page.goto('/components/color-picker/elements.html');
  await expect(page.locator('body')).toHaveAttribute('data-color-ready', 'true');
  await page.locator('#nested-text').fill('#abcdef');
  await expect(page.locator('#nested-color')).toHaveValue('#abcdef');
  await expect(page.locator('#color')).toHaveValue('#3366ff');
  await page.locator('#text').fill('#ff0000');
  await expect(page.locator('#color')).toHaveValue('#ff0000');
  await expect(page.locator('#nested-color')).toHaveValue('#abcdef');
});

test('ColorPicker reset restores native color, clears invalid draft, and reconciles controlled state', async ({ page }) => {
  await page.goto(`/components/color-picker/${port}.html`);
  const body = page.locator('body');
  if (port !== 'web') await expect(body).toHaveAttribute('data-color-ready', 'true');
  const managed = ['react', 'angular', 'vue'].includes(port);
  const form = page.locator('#color-form');
  const color = page.locator('#color');
  const text = page.locator('#text');
  await text.fill('#aabbcc');
  await expect(color).toHaveValue('#aabbcc');
  await text.fill('#ab');
  await expect(text).toHaveValue('#ab');
  if (managed) {
    await page.locator('#set-color').click();
    await page.locator('#controlled-text').fill('#ab');
    await expect(page.locator('#controlled-color')).toHaveValue('#abcdef');
  }
  if (port === 'elements') await page.locator('#nested-text').fill('#abcdef');
  await form.evaluate(async (element) => {
    element.addEventListener('reset', (event) => event.preventDefault(), { once: true });
    element.reset();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
  await expect(text).toHaveValue('#ab');
  await expect(color).toHaveValue('#aabbcc');
  await form.evaluate((element) => {
    const button = document.createElement('button');
    button.type = 'reset';
    button.textContent = 'Reset colors';
    element.append(button);
  });
  await page.getByRole('button', { name: 'Reset colors' }).click();
  await expect(color).toHaveValue('#3366ff');
  await expect(text).toHaveValue('#3366ff');
  if (port !== 'web') await expect(page.locator('#swatch')).toHaveCSS('background-color', 'rgb(51, 102, 255)');
  if (managed) {
    await expect(page.locator('#controlled-color')).toHaveValue('#abcdef');
    await expect(page.locator('#controlled-text')).toHaveValue('#abcdef');
    await expect(page.locator('#controlled-swatch')).toHaveCSS('background-color', 'rgb(171, 205, 239)');
    await expect(body).toHaveAttribute('data-color-value-count', '1');
    await expect(body).not.toHaveAttribute('data-color-request-count', /.+/);
  }
  if (port === 'elements') {
    await expect(page.locator('#nested-color')).toHaveValue('#112233');
    await expect(page.locator('#nested-text')).toHaveValue('#112233');
    await expect(page.locator('#nested-swatch')).toHaveCSS('background-color', 'rgb(17, 34, 51)');
  }
  expect(await form.evaluate((element) => new FormData(element).get('color'))).toBe('#3366ff');
  await text.fill('#aabbcc');
  await expect(color).toHaveValue('#aabbcc');
  if (managed) await expect(body).toHaveAttribute('data-color-value-count', '2');
});
