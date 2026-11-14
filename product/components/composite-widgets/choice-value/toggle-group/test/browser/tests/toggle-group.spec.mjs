import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';

const port = process.env.VF_COMPONENT_PORT || 'react';

test('initial native toggle state is present before activation', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`/components/toggle-group/${port}.html`);
    const root = page.locator('#group');
    await expect(root.getByRole('button', { name: 'Bold', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(root.getByRole('button', { name: 'Italic', exact: true })).toHaveAttribute('aria-pressed', 'false');
  } finally {
    await context.close();
  }
});

test('single ToggleGroup is exclusive, permits empty state, and preserves native button activation', async ({ page }) => {
  test.skip(port === 'web', 'Web supplies static native semantics, not coordinated runtime.');
  await page.goto(`/components/toggle-group/${port}.html`);
  const root = page.locator('#group');
  const bold = root.getByRole('button', { name: 'Bold', exact: true });
  const italic = root.getByRole('button', { name: 'Italic', exact: true });
  await expect(root.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  await italic.focus();
  await italic.press('Space');
  await expect(italic).toHaveAttribute('aria-pressed', 'true');
  await expect(bold).toHaveAttribute('aria-pressed', 'false');
  await expect(root).toHaveAttribute('data-requested', '"italic"');
  await expect(italic).toBeFocused();
  await italic.press('Enter');
  await expect(italic).toHaveAttribute('aria-pressed', 'false');
  await expect(root).toHaveAttribute('data-requested', '""');
  await bold.evaluate((button) => button.addEventListener('click', (event) => event.preventDefault(), { capture: true }));
  await bold.click();
  await expect(bold).toHaveAttribute('aria-pressed', 'false');
  await expect(root).toHaveAttribute('data-requested', '""');
  await page.locator('#nested').getByRole('button', { name: 'Other inner choice' }).click();
  await expect(page.locator('#nested')).toHaveAttribute('data-requested', '"other"');
  await expect(root).toHaveAttribute('data-requested', '""');
  await expectNoAxeViolations(page);
});

test('multiple ToggleGroup retains arbitrary values and controlled rejection preserves committed state', async ({ page }) => {
  test.skip(port === 'web', 'Managed runtime only.');
  await page.goto(`/components/toggle-group/${port}.html`);
  const multiple = page.locator('#multiple');
  const comma = multiple.getByRole('button', { name: 'Comma item' });
  const other = multiple.getByRole('button', { name: 'Other item' });
  await expect(comma).toHaveAttribute('aria-pressed', 'true');
  await other.click();
  await expect(comma).toHaveAttribute('aria-pressed', 'true');
  await expect(other).toHaveAttribute('aria-pressed', 'true');
  await expect(multiple).toHaveAttribute('data-requested', '["a,b","c"]');
  await comma.click();
  await expect(comma).toHaveAttribute('aria-pressed', 'false');
  await expect(multiple).toHaveAttribute('data-requested', '["c"]');
  const controlled = page.locator('#controlled');
  await controlled.getByRole('button', { name: 'Italic' }).click();
  await expect(controlled).toHaveAttribute('data-requested', '"italic"');
  await expect(controlled.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true');
  await expect(controlled.getByRole('button', { name: 'Italic' })).toHaveAttribute('aria-pressed', 'false');
});

test('public ToggleGroup CSS resolves canonical subtle surface and control radii in light, dark, and forced-colors modes', async ({
  page,
}) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/toggle-group/web.html');
  const group = page.locator('#group');
  const item = page.locator('#bold');
  const subtleSurfaceByTheme = {
    light: 'rgb(250, 250, 250)',
    dark: 'rgb(9, 9, 11)',
  };

  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(group).toHaveCSS('background-color', subtleSurfaceByTheme[theme]);
    await expect(group).toHaveCSS('border-radius', '6px');
    await expect(item).toHaveCSS('border-radius', '4px');
  }

  await page.emulateMedia({ forcedColors: 'active' });
  await expect(group).toHaveCSS('border-top-width', '1px');
});
