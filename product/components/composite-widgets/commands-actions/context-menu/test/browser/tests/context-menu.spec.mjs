import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';

const port = process.env.VF_COMPONENT_PORT || 'react';
const item = (name) => `#${port}-${name}`;

async function openContextMenu(page) {
  await page.locator('#target').click({ button: 'right' });
  await expect(page.locator('#menu')).toBeVisible();
  if (port === 'react') await expect(page.locator('#menu')).toHaveCSS('animation-name', 'vf-motion-enter-reveal');
  await expect(page.locator(item('open'))).toBeFocused();
}

test.beforeEach(async ({ page }) => {
  await page.goto(`/components/context-menu/${port}.html`);
  if (port !== 'web') await page.waitForFunction(() => document.body.dataset.contextReady === 'true');
});

test('native Web authored surface uses browser top layer and light dismissal', async ({ page }) => {
  test.skip(port !== 'web', 'Web native markup baseline; no simulated managed menu.');
  const menu = page.locator('#menu');
  await expect(menu).toBeHidden();
  await menu.evaluate((node) => node.showPopover({ source: document.querySelector('#target') }));
  await expect(menu).toBeVisible();
  expect(await menu.evaluate((node) => node.matches(':popover-open'))).toBe(true);
  await expectNoAxeViolations(page);
  await page.locator('#after').click();
  await expect(menu).toBeHidden();
});

test('context invocation navigates focusable disabled commands without activation', async ({ page }) => {
  test.skip(port === 'web', 'Managed runtime evidence.');
  await openContextMenu(page);
  await expect(page.locator(item('disabled'))).toHaveAttribute('aria-disabled', 'true');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator(item('disabled'))).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#menu')).toBeVisible();
  await expect(page.locator('body')).not.toHaveAttribute('data-selected', /.+/);
  await page.keyboard.press('ArrowDown');
  await expect(page.locator(item('rename'))).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.locator(item('banana'))).toBeFocused();
  await page.keyboard.press('Home');
  await expect(page.locator(item('open'))).toBeFocused();
  await page.keyboard.press('b');
  await expect(page.locator(item('disabled'))).toBeFocused();
  expect(await page.locator('#menu').evaluate((node) => node.matches(':popover-open') && !!node.closest('main'))).toBe(
    true,
  );
  await expectNoAxeViolations(page);
});

test('Escape and keyboard invocation restore the invoking context', async ({ page }) => {
  test.skip(port === 'web', 'Managed runtime evidence.');
  await page.locator('#target').press('Shift+F10');
  await expect(page.locator(item('open'))).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#menu')).toBeHidden();
  await expect(page.locator('#target')).toBeFocused();
  await page.locator('#target').press('ContextMenu');
  await expect(page.locator(item('open'))).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#menu')).toBeHidden();
  await expect(page.locator('#after')).toBeFocused();
});

test('enabled selection dismisses and restores focus', async ({ page }) => {
  test.skip(port === 'web', 'Managed runtime evidence.');
  await openContextMenu(page);
  await page.locator(item('rename')).click();
  await expect(page.locator('#menu')).toBeHidden();
  await expect(page.locator('#target')).toBeFocused();
  await expect(page.locator('body')).toHaveAttribute('data-selected', `${port}-rename`);
});

test('native light dismissal preserves outside focus', async ({ page }) => {
  test.skip(port === 'web', 'Managed runtime evidence.');
  await openContextMenu(page);
  await page.locator('#after').click();
  await expect(page.locator('#menu')).toBeHidden();
  await expect(page.locator('#after')).toBeFocused();
});

test('controlled framework ContextMenu reconciles rejected light dismissal', async ({ page }) => {
  test.skip(port === 'web' || port === 'elements', 'Controlled framework contract.');
  await page.locator('#controlled-target').press('Shift+F10');
  await expect(page.locator('#controlled-item')).toBeFocused();
  await page.locator('#after').click();
  await expect(page.locator('body')).toHaveAttribute('data-context-request', 'false');
  await expect(page.locator('#controlled-menu')).toBeVisible();
  expect(await page.locator('#controlled-menu').evaluate((node) => node.matches(':popover-open'))).toBe(true);
});

test('secondary-button gesture opens after release without self-dismissal', async ({ page }) => {
  test.skip(port === 'web', 'Managed runtime evidence.');
  const target = page.locator('#target');
  const box = await target.boundingBox();
  if (!box) throw new Error('Missing context target.');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down({ button: 'right' });
  await expect(page.locator('#menu')).toBeHidden();
  await page.mouse.up({ button: 'right' });
  await expect(page.locator('#menu')).toBeVisible();
  await expect(page.locator(item('open'))).toBeFocused();
});
