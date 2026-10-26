import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';

const port = process.env.VF_COMPONENT_PORT || 'react';
const runtimePort = port !== 'web';

async function openFixture(page, { clock = false } = {}) {
  if (clock && runtimePort) await page.clock.install();
  await page.goto(`/next/toast-fixtures/${port}.html`);
  if (runtimePort) await expect(page.locator('body')).toHaveAttribute('data-ready', port);
}

function closeFor(page, id) {
  return page.locator(`#${id} [data-vf-toast-close]`).first();
}

test('uses real polite live-region semantics and authored localized names', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await openFixture(page);

  await expect(page.locator('#viewport')).toHaveAttribute('aria-live', 'polite');
  await expect(page.locator('#viewport')).toHaveAttribute('aria-relevant', 'additions text');
  if (port === 'web') {
    await expect(page.locator('#web-toast')).toBeVisible();
    await expect(closeFor(page, 'web-toast')).toHaveAccessibleName('Tutup notifikasi');
  } else {
    await expect(page.locator('#localized')).toBeVisible();
    await expect(closeFor(page, 'localized')).toHaveAccessibleName('Tutup notifikasi');
    await expect(closeFor(page, 'visible-name')).toHaveAccessibleName('Close notification');
    await expect(page.locator('[data-vf-toast-close][aria-label="Dismiss notification"]')).toHaveCount(0);
  }

  await page.addScriptTag({ content: axeCore.source });
  expect((await page.evaluate(async () => globalThis.axe.run(document))).violations).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('controlled owners accept or reject close requests without fixture deletion', async ({ page }) => {
  test.skip(!runtimePort, 'Web is the static semantic/style baseline.');
  await openFixture(page);

  await closeFor(page, 'controlled-accept').click();
  await expect(page.locator('#controlled-accept-count')).toHaveText('1');
  await expect(page.locator('#controlled-accept')).not.toBeVisible();

  await closeFor(page, 'controlled-reject').click();
  await expect(page.locator('#controlled-reject-count')).toHaveText('1');
  await expect(page.locator('#controlled-reject')).toBeVisible();
  await closeFor(page, 'controlled-reject').click();
  await expect(page.locator('#controlled-reject-count')).toHaveText('2');
  await expect(page.locator('#controlled-reject')).toBeVisible();
});

test('uncontrolled close, click cancellation, native keyboard activation and sibling ownership stay local', async ({ page }) => {
  test.skip(!runtimePort, 'Web is the static semantic/style baseline.');
  await openFixture(page);

  const uncontrolledClose = closeFor(page, 'uncontrolled');
  await uncontrolledClose.focus();
  await uncontrolledClose.press('Enter');
  await expect(page.locator('#uncontrolled-count')).toHaveText('1');
  await expect(page.locator('#uncontrolled')).not.toBeVisible();

  await closeFor(page, 'cancel').click();
  await expect(page.locator('#cancel')).toBeVisible();

  await closeFor(page, 'sibling-a').click();
  await expect(page.locator('#sibling-a')).not.toBeVisible();
  await expect(page.locator('#sibling-b')).toBeVisible();
});

test('opening after mount and close/reopen use fresh timer cycles', async ({ page }) => {
  test.skip(!runtimePort, 'Web has no runtime timer contract.');
  await openFixture(page, { clock: true });

  await page.clock.fastForward(500);
  await expect(page.locator('#initial-count')).toHaveText('0');
  await page.locator('#initial-open').click();
  await expect(page.locator('#initial')).toBeVisible();
  await page.clock.fastForward(99);
  await expect(page.locator('#initial')).toBeVisible();
  await page.clock.fastForward(1);
  await expect(page.locator('#initial-count')).toHaveText('1');
  await expect(page.locator('#initial')).not.toBeVisible();
});

test('closing clears the old timer and reopening starts the full duration', async ({ page }) => {
  test.skip(!runtimePort, 'Web has no runtime timer contract.');
  await openFixture(page, { clock: true });

  await page.clock.fastForward(50);
  await closeFor(page, 'cycle').click();
  await expect(page.locator('#cycle-count')).toHaveText('1');
  await page.locator('#cycle-open').click();
  await expect(page.locator('#cycle')).toBeVisible();
  await page.clock.fastForward(99);
  await expect(page.locator('#cycle')).toBeVisible();
  await page.clock.fastForward(1);
  await expect(page.locator('#cycle-count')).toHaveText('2');
  await expect(page.locator('#cycle')).not.toBeVisible();
});

test('duration changes restart the active cycle while zero and invalid values are persistent', async ({ page }) => {
  test.skip(!runtimePort, 'Web has no runtime timer contract.');
  await openFixture(page, { clock: true });

  await page.clock.fastForward(50);
  await page.locator('#duration-100').click();
  await page.clock.fastForward(99);
  await expect(page.locator('#duration')).toBeVisible();
  await page.clock.fastForward(1);
  await expect(page.locator('#duration-count')).toHaveText('1');
  await expect(page.locator('#duration')).not.toBeVisible();

  await page.locator('#duration-open').click();
  await page.locator('#duration-zero').click();
  await page.clock.fastForward(1000);
  await expect(page.locator('#duration')).toBeVisible();
  await page.locator('#duration-invalid').click();
  await page.clock.fastForward(1000);
  await expect(page.locator('#duration')).toBeVisible();
  await expect(page.locator('#duration-count')).toHaveText('1');
});

test('ordinary rerenders do not move the timer deadline', async ({ page }) => {
  test.skip(!runtimePort, 'Web has no runtime timer contract.');
  await openFixture(page, { clock: true });

  await page.clock.fastForward(50);
  await page.locator('#rerender-button').click();
  await page.clock.fastForward(49);
  await expect(page.locator('#rerender')).toBeVisible();
  await page.clock.fastForward(1);
  await expect(page.locator('#rerender-count')).toHaveText('1');
  await expect(page.locator('#rerender')).not.toBeVisible();
});

test('a rejected timeout requests close once per committed open cycle', async ({ page }) => {
  test.skip(!runtimePort, 'Web has no runtime timer contract.');
  await openFixture(page, { clock: true });

  await page.clock.fastForward(100);
  await expect(page.locator('#timeout-reject-count')).toHaveText('1');
  await expect(page.locator('#timeout-reject')).toBeVisible();
  await page.clock.fastForward(500);
  await expect(page.locator('#timeout-reject-count')).toHaveText('1');

  await page.locator('#timeout-close').click();
  await expect(page.locator('#timeout-reject')).not.toBeVisible();
  await page.locator('#timeout-open').click();
  await page.clock.fastForward(100);
  await expect(page.locator('#timeout-reject-count')).toHaveText('2');
});

test('hover and focus pause reasons overlap without resuming early', async ({ page }) => {
  test.skip(!runtimePort, 'Web has no runtime timer contract.');
  await openFixture(page, { clock: true });

  await page.clock.fastForward(40);
  const pause = page.locator('#pause');
  const close = closeFor(page, 'pause');
  await pause.hover();
  await close.focus();
  await page.clock.fastForward(200);
  await expect(pause).toBeVisible();
  await page.locator('#outside-focus').hover();
  await page.clock.fastForward(200);
  await expect(pause).toBeVisible();
  await page.locator('#outside-focus').focus();
  await page.clock.fastForward(59);
  await expect(pause).toBeVisible();
  await page.clock.fastForward(1);
  await expect(pause).not.toBeVisible();
});

test('showing a status does not move focus and teardown leaves no live timer work', async ({ page }) => {
  test.skip(!runtimePort, 'Web has no runtime activation contract.');
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await openFixture(page, { clock: true });

  const show = page.locator('#dynamic-open');
  await show.focus();
  await show.click();
  await expect(page.locator('#dynamic')).toBeVisible();
  await expect(show).toBeFocused();

  await page.evaluate(() => globalThis.__toastUnmount());
  await page.clock.fastForward(10_000);
  expect(pageErrors).toEqual([]);
});
