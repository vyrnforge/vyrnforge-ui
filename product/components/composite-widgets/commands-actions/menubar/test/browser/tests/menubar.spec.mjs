import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('menubar exposes authored name and menuitem roles', async ({ page }) => {
  await page.goto(`/components/menubar/${port}.html`);
  await expect(page.getByRole('menubar', { name: 'Application commands' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'File' })).toHaveAttribute('aria-haspopup', 'menu');
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('runtime menubar manages one tab stop, logical arrows, edges and disabled triggers', async ({ page }) => {
  test.skip(port === 'web', 'Web owns the authored semantic and styling baseline.');
  await page.goto(`/components/menubar/${port}.html`);
  const bar = page.locator('#bar');
  const file = page.locator('#file');
  const edit = page.locator('#edit');
  const view = page.locator('#view');
  await expect(edit).toHaveAttribute('tabindex', '-1');
  await expect(file).toHaveAttribute('tabindex', '0');
  await expect(page.locator('#unavailable')).toHaveAttribute('tabindex', '-1');
  await page.locator('#before').focus();
  await page.keyboard.press('Tab');
  await expect(file).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(edit).toBeFocused();
  await expect(file).toHaveAttribute('tabindex', '-1');
  await expect(edit).toHaveAttribute('tabindex', '0');
  await page.keyboard.press('End');
  await expect(view).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(file).toBeFocused();
  await bar.evaluate((element) => element.setAttribute('dir', 'rtl'));
  await page.keyboard.press('ArrowRight');
  await expect(view).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(file).toBeFocused();
  await page.keyboard.press('End');
  await expect(view).toBeFocused();
  await page.keyboard.press('Home');
  await expect(file).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(edit).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#after')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(edit).toBeFocused();
  await edit.evaluate((element) => element.setAttribute('disabled', ''));
  await expect(edit).toHaveAttribute('tabindex', '-1');
  await expect(file).toHaveAttribute('tabindex', '0');
  await file.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(view).toBeFocused();
});

test('public Menubar CSS resolves canonical surface, border, spacing, and geometry in light, dark, and forced-colors modes', async ({
  page,
}) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/menubar/web.html');
  const bar = page.locator('#bar');
  const file = page.locator('#file');
  const colorsByTheme = {
    light: { surface: 'rgb(255, 255, 255)', border: 'rgb(212, 212, 216)' },
    dark: { surface: 'rgb(24, 24, 27)', border: 'rgb(63, 63, 70)' },
  };

  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(bar).toHaveCSS('background-color', colorsByTheme[theme].surface);
    await expect(bar).toHaveCSS('border-top-color', colorsByTheme[theme].border);
    await expect(bar).toHaveCSS('gap', '4px');
    await expect(bar).toHaveCSS('padding-top', '4px');
    await expect(bar).toHaveCSS('padding-left', '4px');
    await expect(bar).toHaveCSS('border-radius', '8px');
    await expect(file).toHaveCSS('padding-left', '8px');
    await expect(file).toHaveCSS('padding-right', '8px');
    await expect(file).toHaveCSS('border-radius', '6px');
  }

  await page.emulateMedia({ forcedColors: 'active' });
  await expect(bar).toHaveCSS('border-top-width', '1px');
});

test('open menubar switches to adjacent menu in logical direction and restores its trigger on Escape', async ({
  page,
}) => {
  test.skip(port === 'web', 'Managed Menu composition evidence.');
  await page.goto(`/components/menubar/${port}.html`);
  const file = page.locator('#file');
  const edit = page.locator('#edit');
  const view = page.locator('#view');
  await expect(file).toHaveAttribute('tabindex', '0');
  await file.press('ArrowDown');
  await expect(page.locator('#file-command')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#file-menu')).toBeHidden();
  await expect(page.locator('#edit-menu')).toBeVisible();
  await expect(page.locator('#edit-command')).toBeFocused();
  await expect(edit).toHaveAttribute('tabindex', '0');
  await page.locator('#bar').evaluate((element) => element.setAttribute('dir', 'rtl'));
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#edit-menu')).toBeHidden();
  await expect(page.locator('#view-command')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#view-menu')).toBeHidden();
  await expect(view).toBeFocused();
  await expect(view).toHaveAttribute('tabindex', '0');
  await page.keyboard.press('Tab');
  await expect(page.locator('#after')).toBeFocused();
});
