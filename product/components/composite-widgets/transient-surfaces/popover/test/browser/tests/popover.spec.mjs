import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

async function load(page) {
  await page.goto(`/components/popover/${port}.html`);
  if (port !== 'web') await page.waitForFunction(() => document.body.dataset.popoverReady === 'true');
}

test('Popover relationship is present in server markup and the native surface starts closed', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`/components/popover/${port}.html`);
    await expect(page.locator('#t')).toHaveAttribute('aria-controls', 'c');
    await expect(page.locator('#c')).toBeHidden();
    await expect(page.locator('#c')).toHaveAttribute('aria-labelledby', 'popover-title');
  } finally {
    await context.close();
  }
});

test('Popover opens accessibly using native top layer and preserves authored naming', async ({ page }) => {
  await load(page);
  const trigger = page.locator('#t');
  await trigger.focus();
  await trigger.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Popover details' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-labelledby', 'popover-title');
  expect(await dialog.evaluate((element) => element.matches(':popover-open'))).toBe(true);
  if (port !== 'web') await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await trigger.press('Tab');
  await expect(page.locator('#action')).toBeFocused();
  await expectNoAxeViolations(page);
  await page.locator('#outside').click();
  await expect(dialog).toBeHidden();
  if (port !== 'web') await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('Nested native Popover closes only the innermost surface and restores source focus', async ({ page }) => {
  await load(page);
  const trigger = page.locator('#t');
  await trigger.focus();
  await trigger.press('Enter');
  const outer = page.locator('#c');
  await expect(outer).toBeVisible();
  const nestedTrigger = page.locator('#nested-trigger');
  await nestedTrigger.focus();
  await nestedTrigger.press('Enter');
  const inner = page.locator('#nested-content');
  await expect(inner).toBeVisible();
  await expect(outer).toBeVisible();
  await page.locator('#nested-action').focus();
  await page.keyboard.press('Escape');
  await expect(inner).toBeHidden();
  await expect(outer).toBeVisible();
  // Native Web demonstrates platform dismissal; the runtime ports own the additional nested focus policy.
  if (port !== 'web') await expect(nestedTrigger).toBeFocused();
  else await nestedTrigger.focus();
  await page.keyboard.press('Escape');
  await expect(outer).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('Controlled Popover reconciles a rejected native close request', async ({ page }) => {
  test.skip(port === 'web' || port === 'elements', 'Controlled framework contract.');
  await load(page);
  const trigger = page.locator('#controlled-trigger');
  await trigger.focus();
  await trigger.press('Enter');
  const surface = page.locator('#controlled-content');
  await expect(surface).toBeVisible();
  await page.locator('#controlled-action').focus();
  await page.keyboard.press('Escape');
  await expect(page.locator('body')).toHaveAttribute('data-popover-request', 'false');
  await expect(surface).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(await surface.evaluate((element) => element.matches(':popover-open'))).toBe(true);
});
