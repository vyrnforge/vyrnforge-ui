import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';

const port = process.env.VF_COMPONENT_PORT || 'react';
const item = (name) => `#${port}-${name}`;

async function openContextMenu(page) {
  await page.locator('#target').click({ button: 'right' });
  await expect(page.locator('#menu')).toBeVisible();
  await expect(page.locator(item('open'))).toBeFocused();
}

test.beforeEach(async ({ page }) => {
  await page.goto(`/components/context-menu/${port}.html`);
});

test('context invocation and keyboard navigation skip disabled items', async ({ page }) => {
  await openContextMenu(page);
  await expect(page.locator(item('disabled'))).toHaveAttribute('aria-disabled', 'true');

  await page.keyboard.press('ArrowDown');
  await expect(page.locator(item('rename'))).toBeFocused();

  await page.keyboard.press('ArrowUp');
  await expect(page.locator(item('open'))).toBeFocused();

  await page.keyboard.press('End');
  await expect(page.locator(item('banana'))).toBeFocused();

  await page.keyboard.press('Home');
  await expect(page.locator(item('open'))).toBeFocused();

  await page.keyboard.press('b');
  await expect(page.locator(item('banana'))).toBeFocused();

  expect((await expectNoAxeViolations(page, port === 'react'
    ? { disableRules: ['region'] }
    : undefined)).violations).toEqual([]);
});

test('Escape dismisses and restores the invoking context', async ({ page }) => {
  await openContextMenu(page);
  await page.keyboard.press('Escape');
  await expect(page.locator('#menu')).toBeHidden();
  await expect(page.locator('#target')).toBeFocused();
});

test('enabled selection dismisses and restores focus', async ({ page }) => {
  await openContextMenu(page);
  await page.locator(item('rename')).click();
  await expect(page.locator('#menu')).toBeHidden();
  await expect(page.locator('#target')).toBeFocused();
  await expect(page.locator('body')).toHaveAttribute('data-selected', `${port}-rename`);
});
