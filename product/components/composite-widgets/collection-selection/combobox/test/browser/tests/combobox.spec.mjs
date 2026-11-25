import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'web';

async function load(page) {
  await page.goto(`/components/combobox/${port}.html`);
  if (port !== 'web') await page.waitForFunction(() => document.body.dataset.comboReady === 'true');
}

async function expectAxeClean(page) {
  const results = await expectNoAxeViolations(page);
  expect(results.violations).toEqual([]);
}

test('combobox exposes the editable input/listbox relationship', async ({ page }) => {
  await load(page);
  const input = page.getByRole('combobox', { name: 'Framework', exact: true });
  await expect(input).toBeVisible();
  await expect(input).toHaveAttribute('aria-autocomplete', 'list');
  await input.focus();
  if (port === 'web')
    await page
      .locator('#web-listbox')
      .evaluate((node) => node.showPopover({ source: document.querySelector('#web-input') }));
  const controls = await input.getAttribute('aria-controls');
  expect(controls).toBeTruthy();
  await expect(page.locator(`#${controls}`)).toHaveAttribute('role', 'listbox');
  await expect(page.locator(`#${controls}`)).toBeVisible();
  if (port === 'react') await expect(page.locator(`#${controls}`)).toHaveCSS('animation-name', 'vf-motion-enter-reveal');
  expect(
    await page.locator(`#${controls}`).evaluate((node) => node.matches(':popover-open') && !!node.closest('main')),
  ).toBe(true);
  await expect(page.locator(`#${port}-angular`)).toHaveAttribute('aria-disabled', 'true');
  await expectAxeClean(page);
});

test('public Combobox CSS resolves the canonical control radius in light and dark themes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/combobox/web.html');
  const input = page.getByRole('combobox', { name: 'Framework', exact: true });
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(input).toHaveCSS('border-radius', '6px');
  }
});

test.describe('enhanced combobox interaction', () => {
  test.skip(
    port === 'web',
    'Native Web owns semantic/style baseline; framework ports own enhanced combobox interaction.',
  );

  test('keeps DOM focus on the input and navigates options with aria-activedescendant', async ({ page }) => {
    const errors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await load(page);

    const input = page.getByRole('combobox', { name: 'Framework', exact: true });
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

  test('filters authored options, starts Up Arrow at the last enabled match, and dismisses with Escape', async ({
    page,
  }) => {
    await load(page);
    const input = page.getByRole('combobox', { name: 'Framework', exact: true });
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
    await load(page);
    const input = page.getByRole('combobox', { name: 'Turkish city' });
    const istanbul = page.locator(`#${port}-locale-istanbul`);
    const isparta = page.locator(`#${port}-locale-isparta`);

    await input.fill('i');
    await expect(istanbul).toBeVisible();
    await expect(isparta).toBeHidden();
  });

  test('does not run navigation, selection, or dismissal commands during composition', async ({ page }) => {
    await load(page);
    const input = page.getByRole('combobox', { name: 'Framework', exact: true });
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
        node.dispatchEvent(
          new KeyboardEvent('keydown', { bubbles: true, composed: true, isComposing: true, key: value, code: value }),
        );
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
    await load(page);
    const before = page.locator('#before');
    const input = page.getByRole('combobox', { name: 'Framework', exact: true });
    const localeInput = page.getByRole('combobox', { name: 'Turkish city' });
    const after = page.locator('#after');

    await before.focus();
    await page.keyboard.press('Tab');
    await expect(input).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(localeInput).toBeFocused();
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Tab');
    await expect(after).toBeFocused();
    await expect(localeInput).toHaveAttribute('aria-expanded', 'false');
  });
});

test('native light dismissal clears active descendant without committing the query or stealing outside focus', async ({
  page,
}) => {
  test.skip(port === 'web', 'Managed runtime evidence.');
  await load(page);
  const input = page.getByRole('combobox', { name: 'Framework', exact: true });
  await input.fill('re');
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', `${port}-react`);
  const controls = await input.getAttribute('aria-controls');
  const popup = page.locator(`#${controls}`);
  await expect(popup).toBeVisible();
  await page.locator('#after').click();
  await expect(popup).toBeHidden();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).not.toHaveAttribute('aria-activedescendant', /.+/);
  await expect(input).toHaveValue('re');
  await expect(page.locator('#after')).toBeFocused();
  await expect(page.locator('body')).not.toHaveAttribute('data-combo-value', /.+/);
});

test('pointer selection keeps the editable input focused and commits once without reopening', async ({ page }) => {
  test.skip(port === 'web', 'Managed runtime evidence.');
  await load(page);
  const input = page.getByRole('combobox', { name: 'Framework', exact: true });
  await input.focus();
  const option = page.locator(`#${port}-vue`);
  await expect(option).toBeVisible();
  const box = await option.boundingBox();
  if (!box) throw new Error('Missing option.');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(input).toBeFocused();
  await page.mouse.up();
  await expect(input).toHaveValue('Vue');
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  if (port === 'elements') await expect(page.locator('vf-combobox').first()).toHaveAttribute('value', 'Vue');
  else await expect(page.locator('body')).toHaveAttribute('data-combo-value', 'Vue');
});

test('root-owned Combobox relationships stay coherent with an explicit identity', async ({ page }) => {
  test.skip(port === 'web', 'Web authors the input and popup relationships directly.');
  await load(page);
  const prefix = `${port}-locale-root`;
  const input = page.getByRole('combobox', { name: 'Turkish city' });
  const content = page.locator(`#${prefix}-listbox`);
  await expect(input).toHaveAttribute('id', `${prefix}-input`);
  await expect(input).toHaveAttribute('aria-controls', `${prefix}-listbox`);
  await expect(content).toHaveAttribute('aria-labelledby', `${prefix}-input`);
  await expect(page.locator(`#${port}-locale-obsolete-input, #${port}-locale-obsolete-listbox`)).toHaveCount(0);
  await input.focus();
  await expect(content).toBeVisible();
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', `${port}-locale-istanbul`);
  await expect(content.locator(`#${port}-locale-istanbul`)).toHaveAttribute('aria-selected', 'true');
  await expect(input).toBeFocused();
});

test('native read-only and disabled fieldset prevent Combobox requests and preserve native keys', async ({ page }) => {
  test.skip(port === 'web', 'Managed runtime evidence.');
  await load(page);
  const input = page.getByRole('combobox', { name: 'Framework', exact: true });
  const controls = await input.getAttribute('aria-controls');
  const popup = page.locator(`#${controls}`);
  const fieldset = page.locator('#combo-fieldset');
  await input.evaluate((node) => (node.readOnly = true));
  await input.focus();
  await expect(input).toBeFocused();
  await input.press('ArrowDown');
  await expect(popup).toBeHidden();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).not.toHaveAttribute('aria-activedescendant', /.+/);
  await input.evaluate((node) => (node.readOnly = false));
  await input.fill('re');
  await expect(popup).toBeVisible();
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', `${port}-react`);
  await input.evaluate((node) => (node.readOnly = true));
  await input.press('Enter');
  await expect(popup).toBeHidden();
  await expect(input).toHaveValue('re');
  await expect(input).not.toHaveAttribute('aria-activedescendant', /.+/);
  await expect(page.locator('body')).not.toHaveAttribute('data-combo-value', /.+/);
  await input.evaluate((node) => (node.readOnly = false));
  await input.fill('');
  await input.press('Escape');
  await fieldset.evaluate((node) => (node.disabled = true));
  await expect(input).toBeDisabled();
  const prevented = await input.evaluate((node) => {
    node.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    const key = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    node.dispatchEvent(key);
    return key.defaultPrevented;
  });
  expect(prevented).toBe(false);
  await expect(popup).toBeHidden();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await fieldset.evaluate((node) => (node.disabled = false));
  await input.focus();
  await input.press('ArrowDown');
  await expect(popup).toBeVisible();
  await expect(input).toHaveAttribute('aria-activedescendant', `${port}-react`);
});

test('Combobox commits authored text while retaining the distinct semantic option key', async ({ page }) => {
  test.skip(port === 'web', 'Managed runtime evidence.');
  await load(page);
  const input = page.getByRole('combobox', { name: 'Turkish city' });
  await input.fill('i');
  await input.press('ArrowDown');
  await input.press('Enter');
  await expect(input).toHaveValue('İstanbul');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  if (port === 'elements') await expect(page.locator('vf-combobox').nth(1)).toHaveAttribute('value', 'city-istanbul');
  else await expect(page.locator('body')).toHaveAttribute('data-combo-value', 'city-istanbul');
});

test('Combobox controlled selection and query preserve owner rejection and distinct display text', async ({ page }) => {
  test.skip(port === 'web' || port === 'elements', 'Framework-controlled state evidence.');
  await load(page);
  const input = page.getByRole('combobox', { name: 'Controlled framework' });
  const body = page.locator('body');
  const react = page.locator('#controlled-react');
  const vue = page.locator('#controlled-vue');
  await expect(input).toHaveValue('React');
  await expect(react).toHaveAttribute('aria-selected', 'true');
  await expect(body).not.toHaveAttribute('data-controlled-value', /.+/);
  await expect(body).not.toHaveAttribute('data-controlled-query', /.+/);
  await input.fill('');
  // Navigation must observe the owner-committed query, not speculative native input.
  await expect(input).toHaveValue('');
  await expect(vue).toBeVisible();
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', 'controlled-react');
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', 'controlled-vue');
  await input.press('Enter');
  await expect(body).toHaveAttribute('data-controlled-value', 'vue-key');
  await expect(input).toHaveValue('');
  await expect(react).toHaveAttribute('aria-selected', 'true');
  await expect(vue).toHaveAttribute('aria-selected', 'false');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await page.locator('#accept-selection').click();
  await input.fill('v');
  await expect(input).toHaveValue('v');
  await expect(react).toBeHidden();
  await expect(vue).toBeVisible();
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', 'controlled-vue');
  await input.press('Enter');
  await expect(input).toHaveValue('Vue');
  await expect(body).toHaveAttribute('data-controlled-query', 'Vue');
  await expect(vue).toHaveAttribute('aria-selected', 'true');
  await expect(input).toBeFocused();
  await page.locator('#external-selection').click();
  await expect(react).toHaveAttribute('aria-selected', 'true');
  await expect(input).toHaveValue('Vue');
  await expect(body).toHaveAttribute('data-controlled-query', 'Vue');
  await input.fill('blocked');
  await expect(body).toHaveAttribute('data-controlled-query', 'blocked');
  await expect(input).toHaveValue('Vue');
  await expect(vue).toBeVisible();
  await expect(react).toBeHidden();
});
