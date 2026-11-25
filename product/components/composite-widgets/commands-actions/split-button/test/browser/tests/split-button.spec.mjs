import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

const expectedThemeColors = {
  light: {
    background: 'rgb(36, 94, 219)',
    foreground: 'rgb(255, 255, 255)',
    border: 'rgb(212, 212, 216)',
  },
  dark: {
    background: 'rgb(141, 180, 255)',
    foreground: 'rgb(11, 31, 77)',
    border: 'rgb(63, 63, 70)',
  },
};

test('split button has independently authored primary and menu-trigger names', async ({ page }) => {
  await page.goto(`/components/split-button/${port}.html`);
  if (port === 'elements') await expect(page.locator('body')).toHaveAttribute('data-split-ready', 'true');
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'More save options' })).toHaveAttribute('aria-haspopup', 'menu');
  await expect(page.locator('#trigger')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#menu')).toBeHidden();
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('runtime split button keeps primary activation independent and inherits keyboard menu behavior', async ({
  page,
}) => {
  test.skip(port === 'web', 'Web owns authored native button and CSS semantics.');
  await page.goto(`/components/split-button/${port}.html`);
  if (port === 'elements') await expect(page.locator('body')).toHaveAttribute('data-split-ready', 'true');
  const body = page.locator('body');
  const action = page.locator('#action');
  const trigger = page.locator('#trigger');
  const menu = page.locator('#menu');
  const copy = page.locator('#copy');
  const archive = page.locator('#archive');
  await action.click();
  await expect(body).toHaveAttribute('data-primary-count', '1');
  await expect(menu).toBeHidden();
  await action.focus();
  await page.keyboard.press('Space');
  await expect(body).toHaveAttribute('data-primary-count', '2');
  await expect(menu).toBeHidden();
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  await expect(menu).toBeVisible();
  if (port === 'react') await expect(menu).toHaveCSS('animation-name', 'vf-motion-enter-reveal');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(copy).toBeFocused();
  await expect(body).toHaveAttribute('data-primary-count', '2');
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
  await page.keyboard.press('ArrowDown');
  await expect(archive).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(body).not.toHaveAttribute('data-selected-count', /.+/);
  await page.keyboard.press('Enter');
  await expect(copy).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(body).toHaveAttribute('data-selected-count', '1');
  await expect(body).toHaveAttribute('data-primary-count', '2');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(archive).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(menu).toBeHidden();
  await expect(page.locator('#after')).toBeFocused();
});

test('public SplitButton CSS resolves canonical accent, border, and control radius in light and dark themes', async ({
  page,
}) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/split-button/web.html');
  const action = page.locator('#action');
  const trigger = page.locator('#trigger');

  for (const [theme, expected] of Object.entries(expectedThemeColors)) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    for (const control of [action, trigger]) {
      await expect(control).toHaveCSS('background-color', expected.background);
      await expect(control).toHaveCSS('color', expected.foreground);
      await expect(control).toHaveCSS('border-top-color', expected.border);
    }
    await expect(action).toHaveCSS('border-top-left-radius', '6px');
    await expect(action).toHaveCSS('border-top-right-radius', '0px');
    await expect(trigger).toHaveCSS('border-top-left-radius', '0px');
    await expect(trigger).toHaveCSS('border-top-right-radius', '6px');
  }
});

test('SplitButton joined corners follow the document direction', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/split-button/web.html');
  await page.locator('html').evaluate((element) => element.setAttribute('dir', 'rtl'));
  const action = page.locator('#action');
  const trigger = page.locator('#trigger');
  await expect(action).toHaveCSS('border-top-left-radius', '0px');
  await expect(action).toHaveCSS('border-top-right-radius', '6px');
  await expect(trigger).toHaveCSS('border-top-left-radius', '6px');
  await expect(trigger).toHaveCSS('border-top-right-radius', '0px');
});
