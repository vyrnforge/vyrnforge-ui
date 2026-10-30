import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'web';

async function expectAxeClean(page) {
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
}

test('menu exposes menu-button and item semantics', async ({ page }) => {
  await page.goto(`/components/menu/${port}.html`);
  const trigger = page.locator(`#${port}-trigger`);
  await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  if (port === 'web') {
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('menu', { name: 'Actions' })).toBeVisible();
  } else {
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  }
  await expectAxeClean(page);
});

test('public Menu CSS resolves canonical popup surface and item radii in light and dark themes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/menu/web.html');
  const menu = page.locator('#web-menu');
  const item = page.locator('#web-edit');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(menu).toHaveCSS('border-radius', '8px');
    await expect(item).toHaveCSS('border-radius', '6px');
  }
});

test.describe('enhanced menu interaction', () => {
  test.skip(port === 'web', 'Native Web owns semantic/style baseline; framework ports own enhanced menu behavior.');

  test('opens from keyboard, includes disabled items in focus navigation, and suppresses disabled activation', async ({ page }) => {
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/components/menu/${port}.html`);

    const trigger = page.locator(`#${port}-trigger`);
    const menu = page.locator(`#${port}-menu`);
    const edit = page.locator(`#${port}-edit`);
    const locked = page.locator(`#${port}-locked`);
    const duplicate = page.locator(`#${port}-duplicate`);
    const archive = page.locator(`#${port}-archive`);

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(menu).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(edit).toBeFocused();
    for (const item of [edit, locked, duplicate, archive]) await expect(item).toHaveAttribute('tabindex', '-1');
    await expect(locked).toHaveAttribute('aria-disabled', 'true');

    await page.keyboard.press('ArrowDown');
    await expect(locked).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(menu).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('body')).not.toHaveAttribute('data-selected', /.+/);
    if (port === 'react' || port === 'vue') await expect(page.locator('body')).not.toHaveAttribute('data-disabled-clicked', /.+/);

    await page.keyboard.press('ArrowDown');
    await expect(duplicate).toBeFocused();
    await page.keyboard.press('Home');
    await expect(edit).toBeFocused();
    await page.keyboard.press('End');
    await expect(archive).toBeFocused();
    await page.keyboard.press('d');
    await expect(duplicate).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeHidden();

    await page.keyboard.press('ArrowUp');
    await expect(archive).toBeFocused();
    expect(errors.filter((error) => /hydration|mismatch|uncaught|error/i.test(error))).toEqual([]);
  });

  test('activates enabled items, restores focus, and Tab exits instead of traversing menu items', async ({ page }) => {
    await page.goto(`/components/menu/${port}.html`);
    const before = page.locator('#before');
    const after = page.locator('#after');
    const trigger = page.locator(`#${port}-trigger`);
    const menu = page.locator(`#${port}-menu`);
    const edit = page.locator(`#${port}-edit`);

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(edit).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('body')).toHaveAttribute('data-selected', `${port}-edit`);
    await expect(trigger).toBeFocused();
    await expect(menu).toBeHidden();

    await page.keyboard.press('Enter');
    await expect(edit).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(after).toBeFocused();
    await expect(menu).toBeHidden();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(edit).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(before).toBeFocused();
    await expect(menu).toBeHidden();
  });
});
