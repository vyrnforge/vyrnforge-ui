import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';

const port = process.env.VF_COMPONENT_PORT || 'react';

test('initial SplitPanel semantics are valid before client activation', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`/components/split-panel/${port}.html`);
    const handle = page.locator('#handle');
    await expect(handle).toHaveAttribute('aria-valuenow', '40');
    await expect(handle).toHaveAttribute('aria-valuemin', '20');
    await expect(handle).toHaveAttribute('aria-valuemax', '80');
    await expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    await expect(handle).toHaveAccessibleName('Primary');
    await expect(page.locator('#root')).toHaveCSS('--vf-split-size', '40%');
    expect((await expectNoAxeViolations(page)).violations).toEqual([]);
  } finally {
    await context.close();
  }
});

test('public SplitPanel ports share bounded keyboard resizing, direction and focus', async ({ page }) => {
  test.skip(port === 'web', 'Web owns static CSS/semantics, not a SplitPanel runtime.');
  await page.goto(`/components/split-panel/${port}.html`);
  const handle = page.locator('#handle');
  const root = page.locator('#root');
  await handle.focus();
  await handle.press('ArrowRight');
  await expect(handle).toHaveAttribute('aria-valuenow', '41');
  await expect(root).toHaveCSS('--vf-split-size', '41%');
  await handle.press('Shift+ArrowRight');
  await expect(handle).toHaveAttribute('aria-valuenow', '51');
  await handle.press('Home');
  await expect(handle).toHaveAttribute('aria-valuenow', '20');
  await handle.press('End');
  await expect(handle).toHaveAttribute('aria-valuenow', '80');
  await root.evaluate((element) => element.removeAttribute('data-requested-size'));
  await handle.press('ArrowRight');
  await expect(root).not.toHaveAttribute('data-requested-size');
  await expect(handle).toHaveAttribute('aria-valuenow', '80');
  await root.evaluate((element) => element.setAttribute('dir', 'rtl'));
  await handle.press('ArrowRight');
  await expect(handle).toHaveAttribute('aria-valuenow', '79');
  await handle.press('Shift+ArrowRight');
  await expect(handle).toHaveAttribute('aria-valuenow', '69');
  await expect(handle).toBeFocused();
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('framework controlled SplitPanel requests changes without committing rejected values', async ({ page }) => {
  test.skip(port === 'web' || port === 'elements', 'Controlled requests apply to framework ports.');
  await page.goto(`/components/split-panel/${port}.html`);
  const root = page.locator('#controlled');
  const handle = page.locator('#controlled-handle');
  await handle.focus();
  await handle.press('ArrowRight');
  await expect(root).toHaveAttribute('data-requested-size', '61');
  await expect(handle).toHaveAttribute('aria-valuenow', '60');
  await expect(root).toHaveCSS('--vf-split-size', '60%');
  await expect(handle).toBeFocused();
});

test('Elements synchronizes authored bounds and size on live attributes', async ({ page }) => {
  test.skip(port !== 'elements', 'Elements-specific attribute contract.');
  await page.goto('/components/split-panel/elements.html');
  await page.evaluate(() => customElements.whenDefined('vf-split-panel'));
  const root = page.locator('#root');
  const handle = page.locator('#handle');
  await root.evaluate((element) => {
    element.setAttribute('min', '30');
    element.setAttribute('max', '70');
    element.setAttribute('size', '100');
  });
  await expect(handle).toHaveAttribute('aria-valuenow', '70');
  await expect(handle).toHaveAttribute('aria-valuemin', '30');
  await expect(handle).toHaveAttribute('aria-valuemax', '70');
  await expect(root).toHaveCSS('--vf-split-size', '70%');
});

test('public SplitPanel CSS resolves the canonical boundary and focus ring in light, dark, and forced-colors modes', async ({
  page,
}) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/split-panel/web.html');
  const handle = page.locator('#handle');
  const themeTokens = {
    light: { border: 'rgb(212, 212, 216)', focusRing: 'rgb(47, 111, 237)' },
    dark: { border: 'rgb(63, 63, 70)', focusRing: 'rgb(141, 180, 255)' },
  };

  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(handle).toHaveCSS('background-color', themeTokens[theme].border);
    await handle.focus();
    await expect(handle).toHaveCSS('outline-width', '2px');
    await expect(handle).toHaveCSS('outline-color', themeTokens[theme].focusRing);
  }

  await page.emulateMedia({ forcedColors: 'active' });
  await expect(handle).toBeVisible();
  await expect(handle).toHaveCSS('width', '6px');
});
