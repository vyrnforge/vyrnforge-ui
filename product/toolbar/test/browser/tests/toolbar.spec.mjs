import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';
const runtimePort = port !== 'web';

async function openFixture(page) {
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/components/toolbar/${port}.html`);
  if (runtimePort) await expect.poll(() => page.locator('#bold').getAttribute('tabindex')).toBe('0');
  return errors;
}

test('Web surface preserves static toolbar semantics and shared styling', async ({ page }) => {
  test.skip(runtimePort, 'The Web package owns shared Toolbar CSS; framework ports own roving-focus runtime behavior.');
  const errors = await openFixture(page);
  await expect(page.locator('#toolbar')).toHaveAttribute('role', 'toolbar');
  await expect(page.locator('#toolbar')).toHaveAttribute('aria-label', 'Formatting');
  await expect(page.locator('#toolbar')).toHaveAttribute('aria-orientation', 'horizontal');
  await expect(page.locator('#vertical-toolbar')).toHaveAttribute('aria-orientation', 'vertical');
  await expect(page.locator('#toolbar')).toHaveCSS('display', 'flex');
  await page.locator('#bold').focus();
  await expect(page.locator('#bold')).toBeFocused();
  expect(errors).toEqual([]);
});

test('public Toolbar CSS resolves canonical spacing, control radius, and separator boundary in light and dark themes', async ({ page }) => {
  test.skip(runtimePort, 'Public CSS resolution evidence is owned by the Web lane.');
  await openFixture(page);
  const toolbar = page.locator('#toolbar');
  const item = page.locator('#bold');
  const separator = page.locator('[data-vf-toolbar-separator]').first();
  const borderByTheme = {
    light: 'rgb(212, 212, 216)',
    dark: 'rgb(63, 63, 70)',
  };
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(toolbar).toHaveCSS('gap', '4px');
    await expect(item).toHaveCSS('padding-left', '8px');
    await expect(item).toHaveCSS('padding-right', '8px');
    await expect(item).toHaveCSS('border-radius', '6px');
    await expect(separator).toHaveCSS('background-color', borderByTheme[theme]);
  }
});

test('toolbar exposes one roving tab stop and preserves the last focused item', async ({ page }) => {
  test.skip(!runtimePort, 'Roving focus is owned by framework/Elements runtime surfaces, not @vyrnforge/web CSS.');
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
  test.skip(!runtimePort, 'Directional runtime behavior is not owned by @vyrnforge/web CSS.');
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
  test.skip(!runtimePort, 'Dynamic roving state is not owned by @vyrnforge/web CSS.');
  await openFixture(page);
  await page.locator('#italic').focus();
  await expect(page.locator('#italic')).toHaveAttribute('tabindex', '0');
  await page.locator('#italic').evaluate((element) => element.setAttribute('disabled', ''));
  await expect.poll(() => page.locator('#bold').getAttribute('tabindex')).toBe('0');
  await expect(page.locator('#italic')).toHaveAttribute('tabindex', '-1');
});

test('toolbar has no automated accessibility violations', async ({ page }) => {
  await openFixture(page);
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});
