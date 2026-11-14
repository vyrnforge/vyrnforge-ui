import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

async function load(page) {
  await page.goto(`/components/preview-card/${port}.html`);
  if (port !== 'web') await page.waitForFunction(() => document.body.dataset.previewReady === 'true');
}

test('PreviewCard retains authored native link and content relationships', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`/components/preview-card/${port}.html`);
    await expect(page.getByRole('link', { name: 'Profile', exact: true })).toHaveAttribute('href', '#profile');
    await expect(page.locator('#t')).toHaveAttribute('aria-controls', 'c');
    await expect(page.locator('#c')).toHaveAttribute('aria-label', 'Profile preview');
    if (port !== 'web') await expect(page.locator('#c')).toBeHidden();
  } finally {
    await context.close();
  }
});

test('PreviewCard uses native anchored top layer and remains available across hover and focus', async ({ page }) => {
  test.skip(port === 'web', 'Runtime behavior is owned by the runtime ports.');
  await load(page);
  const trigger = page.locator('#t');
  const surface = page.locator('#c');
  await trigger.hover();
  await expect(surface).toBeVisible();
  await expect(surface).toHaveAttribute('popover', 'manual');
  expect(await surface.evaluate((element) => element.matches(':popover-open'))).toBe(true);
  await surface.hover();
  await page.waitForTimeout(150);
  await expect(surface).toBeVisible();
  await trigger.focus();
  await page.locator('#outside').hover();
  await page.waitForTimeout(150);
  await expect(surface).toBeVisible();
  await trigger.press('Tab');
  await expect(page.locator('#action')).toBeFocused();
  await expect(surface).toBeVisible();
  await expectNoAxeViolations(page);
  await page.keyboard.press('Escape');
  await expect(surface).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await page.locator('#outside').focus();
  await trigger.focus();
  await expect(surface).toBeVisible();
  await trigger.press('Enter');
  await expect(page).toHaveURL(/#profile$/);
  await page.locator('#outside').focus();
  await expect(surface).toBeHidden();
});

test('Controlled PreviewCard requests open without overriding committed value', async ({ page }) => {
  test.skip(port === 'web' || port === 'elements', 'Controlled framework contract.');
  await load(page);
  const trigger = page.getByRole('link', { name: 'Controlled preview' });
  await trigger.focus();
  await expect(page.locator('body')).toHaveAttribute('data-preview-request', 'true');
  await expect(page.locator('#controlled-content')).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('Web PreviewCard exposes authored content and canonical styles', async ({ page }) => {
  test.skip(port !== 'web', 'Web owns static semantics and CSS, not a simulated runtime.');
  await load(page);
  const surface = page.getByRole('region', { name: 'Profile preview' });
  await expect(surface).toBeVisible();
  await expect(surface).toHaveCSS('padding-top', '14px');
  await expectNoAxeViolations(page);
});
