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
