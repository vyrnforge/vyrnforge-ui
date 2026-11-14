import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';
async function load(page) {
  await page.goto(`/components/segmented-control/${port}.html`);
  if (port !== 'web') await expect(page.locator('body')).toHaveAttribute('data-segmented-ready', 'true');
}
test('SegmentedControl uses native radios, one Tab entry, disabled skip, independent groups and form submission', async ({
  page,
}) => {
  await load(page);
  const group = page.getByRole('radiogroup', { name: 'View', exact: true }),
    other = page.getByRole('radiogroup', { name: 'Other view' }),
    empty = page.getByRole('radiogroup', { name: 'Empty view' });
  const list = group.getByRole('radio', { name: 'List' }),
    grid = group.getByRole('radio', { name: 'Grid' }),
    details = group.getByRole('radio', { name: 'Details' });
  await expect(list).toBeChecked();
  await expect(group.getByRole('radio', { name: 'Disabled' })).toBeDisabled();
  await page.locator('#before').focus();
  await page.keyboard.press('Tab');
  await expect(list).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(grid).toBeFocused();
  await expect(grid).toBeChecked();
  await page.keyboard.press('ArrowRight');
  await expect(details).toBeChecked();
  // Native radio boundary and RTL behavior can differ by engine. Prove parity
  // with an independent, unstyled HTML radio group rather than forcing wrap.
  await page.evaluate(() => {
    const form = document.createElement('form');
    form.id = 'native-reference';
    for (const value of ['list', 'disabled', 'grid', 'details']) {
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'reference';
      input.value = value;
      input.disabled = value === 'disabled';
      input.checked = value === 'details';
      form.append(input);
    }
    document.body.append(form);
  });
  const reference = page.locator('#native-reference');
  await reference.locator('[value="details"]').focus();
  await page.keyboard.press('ArrowRight');
  const boundaryValue = await reference.locator(':checked').inputValue();
  await details.focus();
  await page.keyboard.press('ArrowRight');
  await expect(group.locator('input:checked')).toHaveValue(boundaryValue);

  await reference.evaluate((element) => element.setAttribute('dir', 'rtl'));
  await reference.locator('[value="grid"]').focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowRight');
  const rtlValue = await reference.locator(':checked').inputValue();
  await group.evaluate((element) => element.setAttribute('dir', 'rtl'));
  await grid.focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowRight');
  await expect(group.locator('input:checked')).toHaveValue(rtlValue);
  await expect(group.locator('input:checked')).toBeFocused();
  await reference.evaluate((element) => element.remove());
  await expect(other.getByRole('radio', { name: 'Grid' })).toBeChecked();
  expect(await page.locator('#form').evaluate((form) => new FormData(form).get('view'))).toBe(rtlValue);
  await page.keyboard.press('Tab');
  await expect(other.getByRole('radio', { name: 'Grid' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(empty.getByRole('radio', { name: 'List' })).toBeFocused();
  await page.keyboard.press('Space');
  await expect(empty.getByRole('radio', { name: 'List' })).toBeChecked();
  await expectAxe(page);
});
async function expectAxe(page) {
  await expectNoAxeViolations(page);
}
test('controlled rejection restores committed native checked value', async ({ page }) => {
  test.skip(port === 'web' || port === 'elements', 'Native authored groups do not own controlled state.');
  await load(page);
  const group = page.getByRole('radiogroup', { name: 'Controlled view' });
  await group.getByRole('radio', { name: 'List' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('body')).toHaveAttribute('data-requested', 'grid');
  await expect(group.getByRole('radio', { name: 'List' })).toBeChecked();
  await expect(group.getByRole('radio', { name: 'Grid' })).not.toBeChecked();
});
test('native input names and authored labels exist before activation', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`/components/segmented-control/${port}.html`);
    const group = page.getByRole('radiogroup', { name: 'View', exact: true });
    await expect(group.getByRole('radio', { name: 'List' })).toHaveAttribute('type', 'radio');
    await expect(group.getByRole('radio', { name: 'List' })).toHaveAttribute('name', 'view');
  } finally {
    await context.close();
  }
});
test('Web CSS reflects native checked and focus state', async ({ page }) => {
  test.skip(port !== 'web', 'Web owns standalone CSS evidence.');
  await load(page);
  const group = page.getByRole('radiogroup', { name: 'View', exact: true });
  await expect(group).toHaveCSS('max-inline-size', '100%');
  const label = group.locator('label').first();
  await expect(label).toHaveCSS('font-weight', '600');
  await group.getByRole('radio', { name: 'List' }).focus();
  await expect(label).toHaveCSS('outline-style', 'solid');
});
