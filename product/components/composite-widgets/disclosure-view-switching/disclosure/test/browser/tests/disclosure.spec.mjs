import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';

const port = process.env.VF_COMPONENT_PORT || 'react';

test('disclosure initial markup exposes the correct state and relationship before activation', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`/components/disclosure/${port}.html`);
    await expect(page.locator(port === 'web' ? '#root-panel' : '#authored-panel')).toBeHidden();
    await expect(page.locator('#initial-panel')).toBeVisible();
    if (port !== 'web') {
      const trigger = page.locator('#trigger');
      const panelId = 'authored-panel';
      await expect(trigger).toHaveAttribute('aria-controls', panelId);
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator(`#${panelId}`)).toBeHidden();
      await expect(page.locator('#initial-trigger')).toHaveAttribute('aria-expanded', 'true');
    }
  } finally {
    await context.close();
  }
});

test('disclosure opens and closes using native keyboard activation without leaking nested intent', async ({ page }) => {
  await page.goto(`/components/disclosure/${port}.html`);
  const trigger = page.locator('#trigger');
  const panel = page.locator(port === 'web' ? '#root-panel' : '#authored-panel');
  const inner = page.locator('#inner-trigger');
  await trigger.focus();
  await trigger.press('Enter');
  await expect(panel).toBeVisible();
  await expect(trigger).toBeFocused();
  await inner.focus();
  await inner.press('Space');
  await expect(page.locator('#inner-panel')).toBeVisible();
  await expect(panel).toBeVisible();
  await expect(inner).toBeFocused();
  if (port !== 'web') {
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(inner).toHaveAttribute('aria-expanded', 'true');
  }
  await trigger.focus();
  await trigger.press('Space');
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('initially open disclosure closes on its first uncontrolled toggle', async ({ page }) => {
  await page.goto(`/components/disclosure/${port}.html`);
  await expect(page.locator('#initial-panel')).toBeVisible();
  await page.locator('#initial-trigger').click();
  await expect(page.locator('#initial-panel')).toBeHidden();
});

test('authored disabled state is not cleared and prevents activation', async ({ page }) => {
  test.skip(port === 'web', 'Native details has no disabled contract.');
  await page.goto(`/components/disclosure/${port}.html`);
  const trigger = page.locator('#disabled-trigger');
  if (port === 'elements') {
    await page.evaluate(() => customElements.whenDefined('vf-disclosure'));
    await page.locator('#disabled').evaluate((element) => (element.disabled = false));
  }
  await expect(trigger).toBeDisabled();
  await trigger.evaluate((element) => element.click());
  await expect(page.locator('#disabled-panel')).toBeHidden();
});

test('controlled disclosure requests a change without committing rejected state', async ({ page }) => {
  test.skip(port === 'web' || port === 'elements', 'This controlled-state contract applies to framework components.');
  await page.goto(`/components/disclosure/${port}.html`);
  await page.locator('#controlled-trigger').click();
  await expect(page.locator('#controlled')).toHaveAttribute('data-requested-open', 'true');
  await expect(page.locator('#controlled-trigger')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#controlled-panel')).toBeHidden();
});

test('Elements preserves authored panel IDs and uses a non-submitting trigger by default', async ({ page }) => {
  test.skip(port !== 'elements', 'Elements-specific authored DOM and upgrade behavior.');
  await page.goto('/components/disclosure/elements.html');
  const trigger = page.locator('#trigger');
  await expect(trigger).toHaveAttribute('type', 'button');
  await expect(trigger).toHaveAttribute('aria-controls', 'authored-panel');
  await page.locator('#authored-panel').evaluate((element) => (element.id = 'updated-panel'));
  await expect(trigger).toHaveAttribute('aria-controls', 'updated-panel');
});
