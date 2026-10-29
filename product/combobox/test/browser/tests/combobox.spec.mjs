import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'web';

async function expectAxeClean(page) {
  const results = await expectNoAxeViolations(page, { disableRules: ['region'] });
  expect(results.violations).toEqual([]);
}

test('combobox exposes the editable input/listbox relationship', async ({ page }) => {
  await page.goto(`/components/combobox/${port}.html`);
  const input = page.getByRole('combobox', { name: 'Framework' });
  await expect(input).toBeVisible();
  await expect(input).toHaveAttribute('aria-autocomplete', 'list');
  await input.focus();
  const controls = await input.getAttribute('aria-controls');
  expect(controls).toBeTruthy();
  await expect(page.locator(`#${controls}`)).toHaveAttribute('role', 'listbox');
  await expect(page.locator(`#${port}-angular`)).toHaveAttribute('aria-disabled', 'true');
  await expectAxeClean(page);
});

test('public Combobox CSS resolves the canonical control radius in light and dark themes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/combobox/web.html');
  const input = page.getByRole('combobox', { name: 'Framework' });
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(input).toHaveCSS('border-radius', '6px');
  }
});

test.describe('enhanced combobox interaction', () => {
  test.skip(port === 'web', 'Native Web owns semantic/style baseline; framework ports own enhanced combobox interaction.');

  test('keeps DOM focus on the input and navigates options with aria-activedescendant', async ({ page }) => {
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/components/combobox/${port}.html`);

    const input = page.getByRole('combobox', { name: 'Framework' });
    const first = page.locator(`#${port}-react`);
    const disabled = page.locator(`#${port}-angular`);
    const next = page.locator(`#${port}-vue`);

    await input.focus();
    await expect(first).toHaveAttribute('tabindex', '-1');
    await expect(disabled).toHaveAttribute('tabindex', '-1');
    await expect(next).toHaveAttribute('tabindex', '-1');

    await page.keyboard.press('ArrowDown');
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute('aria-activedescendant', `${port}-react`);
    await expect(first).toHaveAttribute('aria-selected', 'true');

    await page.keyboard.press('ArrowDown');
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute('aria-activedescendant', `${port}-vue`);
    await expect(disabled).toHaveAttribute('aria-selected', 'false');
    await expect(next).toHaveAttribute('aria-selected', 'true');

    await page.keyboard.press('Enter');
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('Vue');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).not.toHaveAttribute('aria-activedescendant', /.+/);
    expect(errors.filter((error) => /hydration|mismatch|uncaught|error/i.test(error))).toEqual([]);
  });

  test('filters authored options, starts Up Arrow at the last enabled match, and dismisses with Escape', async ({ page }) => {
    await page.goto(`/components/combobox/${port}.html`);
    const input = page.getByRole('combobox', { name: 'Framework' });
    const react = page.locator(`#${port}-react`);
    const vue = page.locator(`#${port}-vue`);

    await input.fill('rea');
    await expect(react).toBeVisible();
    await expect(vue).toBeHidden();
    await expect(input).not.toHaveAttribute('aria-activedescendant', /.+/);
    await page.keyboard.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-activedescendant', `${port}-react`);

    await input.fill('');
    await page.keyboard.press('ArrowUp');
    await expect(input).toHaveAttribute('aria-activedescendant', `${port}-svelte`);
    await expect(input).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).not.toHaveAttribute('aria-activedescendant', /.+/);
    await expect(input).toBeFocused();
  });

  test('uses the declared locale for case-sensitive language rules', async ({ page }) => {
    await page.goto(`/components/combobox/${port}.html`);
    const input = page.getByRole('combobox', { name: 'Turkish city' });
    const istanbul = page.locator(`#${port}-locale-istanbul`);
    const isparta = page.locator(`#${port}-locale-isparta`);

    await input.fill('i');
    await expect(istanbul).toBeVisible();
    await expect(isparta).toBeHidden();
  });

  test('does not run navigation, selection, or dismissal commands during composition', async ({ page }) => {
    await page.goto(`/components/combobox/${port}.html`);
    const input = page.getByRole('combobox', { name: 'Framework' });
    const vue = page.locator(`#${port}-vue`);

    await input.focus();
    await input.evaluate((node) => {
      node.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true, composed: true, data: 'V' }));
    });
    await input.fill('Vue');
    await expect(vue).toBeVisible();
    await expect(input).not.toHaveAttribute('aria-activedescendant', /.+/);

    for (const key of ['ArrowDown', 'Enter', 'Escape']) {
      await input.evaluate((node, value) => {
        node.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, composed: true, isComposing: true, key: value, code: value }));
      }, key);
    }

    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(input).not.toHaveAttribute('aria-activedescendant', /.+/);
    await expect(input).toHaveValue('Vue');

    await input.evaluate((node) => {
      node.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, composed: true, data: 'Vue' }));
    });
    await page.keyboard.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-activedescendant', `${port}-vue`);
    await page.keyboard.press('Enter');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toHaveValue('Vue');
  });

  test('keeps popup options out of the page Tab sequence', async ({ page }) => {
    await page.goto(`/components/combobox/${port}.html`);
    const before = page.locator('#before');
    const input = page.getByRole('combobox', { name: 'Framework' });
    const localeInput = page.getByRole('combobox', { name: 'Turkish city' });
    const after = page.locator('#after');

    await before.focus();
    await page.keyboard.press('Tab');
    await expect(input).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(localeInput).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(after).toBeFocused();
  });
});
