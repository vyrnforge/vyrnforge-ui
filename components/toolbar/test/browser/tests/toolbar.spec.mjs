import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';

const port = process.env.VF_COMPONENT_PORT || 'react';

async function openFixture(page) {
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/next/toolbar-fixtures/${port}.html`);
  await expect.poll(() => page.locator('#bold').getAttribute('tabindex')).toBe('0');
  return errors;
}

test('toolbar exposes one roving tab stop and preserves the last focused item', async ({ page }) => {
  const errors = await openFixture(page);
  await expect(page.locator('#toolbar')).toHaveAttribute('role', 'toolbar');
  await expect(page.locator('#toolbar')).toHaveAttribute('aria-orientation', 'horizontal');
  await expect(page.locator('#italic')).toHaveAttribute('tabindex', '-1');
  await expect(page.locator('#link')).toHaveAttribute('tabindex', '-1');
  await expect(page.locator('#disabled')).toHaveAttribute('tabindex', '-1');

  await page.locator('#before').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#bold')).toBeFocused();

  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#italic')).toBeFocused();
  await expect(page.locator('#bold')).toHaveAttribute('tabindex', '-1');
  await expect(page.locator('#italic')).toHaveAttribute('tabindex', '0');

  await page.keyboard.press('End');
  await expect(page.locator('#link')).toBeFocused();
  await expect(page.locator('#link')).toHaveAttribute('tabindex', '0');
  await page.keyboard.press('Tab');
  await expect(page.locator('#after')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#link')).toBeFocused();
  expect(errors).toEqual([]);
});

test('vertical toolbar uses Up/Down and skips disabled controls', async ({ page }) => {
  await openFixture(page);
  await expect(page.locator('#vertical-toolbar')).toHaveAttribute('aria-orientation', 'vertical');
  await page.locator('#vertical-one').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#vertical-three')).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('#vertical-one')).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.locator('#vertical-three')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(page.locator('#vertical-one')).toBeFocused();
});

test('toolbar updates the roving stop when availability changes', async ({ page }) => {
  await openFixture(page);
  await page.locator('#italic').focus();
  await expect(page.locator('#italic')).toHaveAttribute('tabindex', '0');
  await page.locator('#italic').evaluate((element) => element.setAttribute('disabled', ''));
  await expect.poll(() => page.locator('#bold').getAttribute('tabindex')).toBe('0');
  await expect(page.locator('#italic')).toHaveAttribute('tabindex', '-1');
});

test('toolbar has no automated accessibility violations after activation', async ({ page }) => {
  await openFixture(page);
  await page.addScriptTag({ content: axeCore.source });
  expect((await page.evaluate(async () => globalThis.axe.run(document))).violations).toEqual([]);
});
