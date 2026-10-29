import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'web';

async function expectAxeClean(page) {
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
}

test('listbox exposes authored naming and selection semantics', async ({ page }) => {
  await page.goto(`/components/listbox/${port}.html`);
  await expect(page.getByRole('listbox', { name: 'Choose an item' })).toBeVisible();
  await expect(page.locator(`#${port}-one`)).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator(`#${port}-disabled`)).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByRole('listbox', { name: 'Choose several' })).toHaveAttribute('aria-multiselectable', 'true');
  await expectAxeClean(page);
});

test('public Listbox CSS resolves canonical compact spacing, radius, and focus ring', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/listbox/web.html');
  const listbox = page.locator('#web-list');
  const option = page.locator('#web-one');
  const focusRingByTheme = {
    light: 'rgb(47, 111, 237)',
    dark: 'rgb(141, 180, 255)',
  };

  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(listbox).toHaveCSS('gap', '4px');
    await expect(listbox).toHaveCSS('padding-top', '4px');
    await expect(listbox).toHaveCSS('padding-left', '4px');
    await expect(listbox).toHaveCSS('border-radius', '6px');
    await expect(option).toHaveCSS('padding-top', '8px');
    await expect(option).toHaveCSS('padding-bottom', '8px');
    await expect(option).toHaveCSS('border-radius', '6px');

    await page.locator('#before').focus();
    await page.keyboard.press('Tab');
    await expect(option).toBeFocused();
    await expect(option).toHaveCSS('outline-width', '2px');
    await expect(option).toHaveCSS('outline-color', focusRingByTheme[theme]);
  }
});

test.describe('enhanced listbox interaction', () => {
  test.skip(port === 'web', 'Native Web owns semantic/style baseline; framework ports own enhanced composite focus and selection behavior.');

  test('has one Tab stop and moves focus without implicitly changing selection', async ({ page }) => {
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/components/listbox/${port}.html`);

    const before = page.locator('#before');
    const one = page.locator(`#${port}-one`);
    const disabled = page.locator(`#${port}-disabled`);
    const three = page.locator(`#${port}-three`);
    const banana = page.locator(`#${port}-banana`);
    const multiOne = page.locator(`#${port}-multi-one`);

    await expect(one).toHaveAttribute('tabindex', '0');
    await expect(disabled).toHaveAttribute('tabindex', '-1');
    await expect(three).toHaveAttribute('tabindex', '-1');
    await expect(banana).toHaveAttribute('tabindex', '-1');

    await before.focus();
    await page.keyboard.press('Tab');
    await expect(one).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(three).toBeFocused();
    await expect(one).toHaveAttribute('aria-selected', 'true');
    await expect(three).toHaveAttribute('aria-selected', 'false');

    await page.keyboard.press('Space');
    await expect(one).toHaveAttribute('aria-selected', 'false');
    await expect(three).toHaveAttribute('aria-selected', 'true');

    await page.keyboard.press('End');
    await expect(banana).toBeFocused();
    await expect(three).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Home');
    await expect(one).toBeFocused();
    await page.keyboard.press('b');
    await expect(banana).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(multiOne).toBeFocused();
    expect(errors.filter((error) => /hydration|mismatch|uncaught|error/i.test(error))).toEqual([]);
  });

  test('multi-select keeps selection independent from focus and toggles with Space', async ({ page }) => {
    await page.goto(`/components/listbox/${port}.html`);
    const one = page.locator(`#${port}-multi-one`);
    const three = page.locator(`#${port}-multi-three`);

    await one.focus();
    await expect(one).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowDown');
    await expect(three).toBeFocused();
    await expect(one).toHaveAttribute('aria-selected', 'true');
    await expect(three).toHaveAttribute('aria-selected', 'false');
    await page.keyboard.press('Space');
    await expect(one).toHaveAttribute('aria-selected', 'true');
    await expect(three).toHaveAttribute('aria-selected', 'true');
  });
});
