import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';
const frameworkPorts = new Set(['react', 'angular', 'vue']);
async function openFixture(page) {
  await page.goto(`/components/otp-field/${port}.html`);
  if (port !== 'web') await expect(page.locator('body')).toHaveAttribute('data-otp-ready', 'true');
  return page.getByRole('textbox', { name: 'Code de vérification', exact: true });
}
test('one native labelled input preserves full-code editing and form value', async ({ page }) => {
  const input = await openFixture(page);
  await expect(input).toHaveCount(1);
  await expect(input).toHaveAttribute('type', 'text');
  await expect(input).toHaveAttribute('autocomplete', 'one-time-code');
  await expect(input).toHaveAttribute('inputmode', 'numeric');
  await expect(input).toHaveAttribute('maxlength', '4');
  await expect(input).toHaveAttribute('aria-describedby', 'otp-guide');
  await expect(page.locator('body')).not.toHaveAttribute('data-otp-value-count', /.+/);
  await input.fill('0472');
  await expect(input).toHaveValue('0472');
  await expect(input).toBeFocused();
  expect(await page.locator('#otp-form').evaluate((form) => new FormData(form).get('code'))).toBe('0472');
  await input.press('End');
  await input.press('Backspace');
  await expect(input).toHaveValue('047');
  await expect(input).toBeFocused();
  await input.fill('5931');
  await expect(input).toHaveValue('5931');
  if (port !== 'web') await expect(page.locator('body')).toHaveAttribute('data-otp-value', '5931');
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});
test('native clipboard paste enters the whole code without focus redistribution', async ({
  page,
  context,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Clipboard permissions are exercised in Chromium.');
  const input = await openFixture(page);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.evaluate(() => navigator.clipboard.writeText('5931'));
  await input.focus();
  await page.keyboard.press('Control+V');
  await expect(input).toHaveValue('5931');
  await expect(input).toBeFocused();
});
test('controlled owner rejects requests, external updates are silent, and native states are preserved', async ({
  page,
}) => {
  test.skip(!frameworkPorts.has(port), 'Framework controlled value contract.');
  await openFixture(page);
  const input = page.locator('#controlled');
  await expect(input).toHaveValue('1234');
  await expect(page.locator('body')).not.toHaveAttribute('data-otp-request-count', /.+/);
  await input.fill('9876');
  await expect(page.locator('body')).toHaveAttribute('data-otp-request', '9876');
  await expect(input).toHaveValue('1234');
  await expect(page.locator('body')).toHaveAttribute('data-otp-request-count', '1');
  await page.locator('#set-code').click();
  await expect(input).toHaveValue('7654');
  await expect(page.locator('body')).toHaveAttribute('data-otp-request-count', '1');
  await expect(page.locator('#disabled')).toBeDisabled();
  await expect(page.locator('#readonly')).toHaveAttribute('readonly', '');
  await expect(page.locator('#readonly')).toHaveValue('5678');
  await expect(page.locator('#alpha')).toHaveAttribute('inputmode', 'text');
  await page.locator('#alpha').fill('A2b4');
  await expect(page.locator('#alpha')).toHaveValue('A2b4');
});
test('Elements property updates and nested roots are isolated', async ({ page }) => {
  test.skip(port !== 'elements', 'Elements ownership contract.');
  const input = await openFixture(page);
  await page.locator('#code-root').evaluate((root) => {
    root.value = '1234';
  });
  await expect(input).toHaveValue('1234');
  await expect(page.locator('body')).not.toHaveAttribute('data-otp-value-count', /.+/);
  await page.locator('#nested').fill('5678');
  await expect(input).toHaveValue('1234');
  await expect(page.locator('body')).not.toHaveAttribute('data-otp-value-count', /.+/);
  await input.fill('9012');
  await expect(page.locator('body')).toHaveAttribute('data-otp-value-count', '1');
  await expect(page.locator('#nested')).toHaveValue('5678');
});
test('public CSS uses canonical gap and input radius in both themes', async ({ page }) => {
  const input = await openFixture(page);
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((el, value) => el.setAttribute('data-vf-theme', value), theme);
    await expect(page.locator('#code-root')).toHaveCSS('gap', '8px');
    await expect(input).toHaveCSS('border-top-left-radius', '6px');
  }
});
