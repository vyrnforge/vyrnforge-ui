import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';
const frameworkPorts = new Set(['react', 'angular', 'vue', 'elements']);

async function openFixture(page) {
  await page.goto(`/components/otp-field/${port}.html`);
  const group = page.getByRole('group', { name: 'Code de vérification', exact: true });
  const cells = group.locator('input');
  await expect(cells).toHaveCount(4);
  return { group, cells };
}

test.beforeEach(() => {
  test.skip(!frameworkPorts.has(port), 'Interactive OTPField behavior is implemented by framework/Elements ports; Web owns CSS only.');
});

test('otp field keeps accessible names consumer-authored and exposes one-time-code assistance', async ({ page }) => {
  const { cells } = await openFixture(page);

  await expect(page.getByLabel('Chiffre 1 sur 4 du code', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Chiffre 4 sur 4 du code', { exact: true })).toBeVisible();
  await expect(page.getByRole('group', { name: 'One-time code', exact: true })).toHaveCount(0);
  await expect(cells.nth(0)).toHaveAttribute('autocomplete', 'one-time-code');
  await expect(cells.nth(0)).toHaveAttribute('maxlength', '4');
  await expect(cells.nth(1)).toHaveAttribute('autocomplete', 'off');
  await expect(cells.nth(1)).toHaveAttribute('maxlength', '1');

  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('public OTPField CSS resolves canonical spacing and control radius in light and dark themes', async ({ page }) => {
  test.skip(port !== 'react', 'Representative public CSS resolution evidence uses the React public entrypoint.');
  const { group, cells } = await openFixture(page);

  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(group).toHaveCSS('gap', '8px');
    await expect(cells.nth(0)).toHaveCSS('border-top-left-radius', '6px');
    await expect(cells.nth(0)).toHaveCSS('border-top-right-radius', '6px');
  }
});

test('otp field advances on entry and empty backspace returns focus', async ({ page }) => {
  const { cells } = await openFixture(page);

  await cells.nth(0).fill('4');
  await expect(cells.nth(0)).toHaveValue('4');
  await expect(cells.nth(1)).toBeFocused();

  await page.keyboard.press('Backspace');
  await expect(cells.nth(0)).toBeFocused();
});

test('otp field distributes paste across cells', async ({ page }) => {
  const { cells } = await openFixture(page);

  await cells.nth(0).evaluate((element) => {
    const data = new DataTransfer();
    data.setData('text', '5931');
    element.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data }));
  });

  await expect(cells.nth(0)).toHaveValue('5');
  await expect(cells.nth(1)).toHaveValue('9');
  await expect(cells.nth(2)).toHaveValue('3');
  await expect(cells.nth(3)).toHaveValue('1');
  await expect(cells.nth(3)).toBeFocused();
});

test('otp field distributes multi-character platform input from the one-time-code cell', async ({ page }) => {
  const { cells } = await openFixture(page);

  // Use the browser/framework input path rather than mutating the DOM value behind
  // React's value tracker; this represents the multi-character replacement the
  // component must accept from one-time-code assistance.
  await cells.nth(0).fill('8472');

  await expect(cells.nth(0)).toHaveValue('8');
  await expect(cells.nth(1)).toHaveValue('4');
  await expect(cells.nth(2)).toHaveValue('7');
  await expect(cells.nth(3)).toHaveValue('2');
  await expect(cells.nth(3)).toBeFocused();
});
