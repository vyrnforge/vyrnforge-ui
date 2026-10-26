import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';

const port = process.env.VF_COMPONENT_PORT || 'react';
const fixture = `/next/toast-fixtures/${port}.html`;

async function requests(page, name) {
  return page.evaluate((key) => Number(document.body.dataset[key] || 0), name);
}

async function waitForClient(page) {
  if (port === 'web') return;
  await expect(page.locator('body')).toHaveAttribute('data-controlled-requests', '0');
}

test('uses polite real output with authored English and localized naming', async ({ page }) => {
  await page.goto(fixture);
  const viewport = page.locator('#viewport');
  await expect(viewport).toHaveAttribute('aria-live', 'polite');
  await expect(page.locator('#controlled-toast')).toHaveAttribute('role', 'status');
  await expect(page.locator('#controlled-close')).toHaveAccessibleName('Tutup notifikasi');
  if (port !== 'web') await expect(page.locator('#sibling-b-close')).toHaveAccessibleName('Close notification');
  await expect(page.locator('body')).not.toContainText('Dismiss notification');
  await page.addScriptTag({ content: axeCore.source });
  expect((await page.evaluate(async () => globalThis.axe.run(document))).violations).toEqual([]);
});

test('controlled close is intent until the owner commits it', async ({ page }) => {
  test.skip(port === 'web', 'Web fixture is static CSS/semantic evidence only.');
  await page.goto(fixture);
  await waitForClient(page);
  const toast = page.locator('#controlled-toast');
  await page.locator('#controlled-close').click();
  await expect.poll(() => requests(page, 'controlledRequests')).toBe(1);
  await expect(toast).toBeVisible();
  await page.locator('#controlled-accept').click();
  await page.locator('#controlled-close').click();
  await expect.poll(() => requests(page, 'controlledRequests')).toBe(2);
  await expect(toast).toBeHidden();
});

test('uncontrolled close commits locally exactly once', async ({ page }) => {
  test.skip(port === 'web', 'Web fixture is static CSS/semantic evidence only.');
  await page.goto(fixture);
  await waitForClient(page);
  await page.locator('#uncontrolled-close').click();
  await expect.poll(() => requests(page, 'uncontrolledRequests')).toBe(1);
  await expect(page.locator('#uncontrolled-toast')).toBeHidden();
});

test('consumer cancellation, native keyboard activation, and sibling ownership are preserved', async ({ page }) => {
  test.skip(port === 'web', 'Web fixture is static CSS/semantic evidence only.');
  await page.goto(fixture);
  await waitForClient(page);
  await page.locator('#cancel-close').click();
  await expect(page.locator('#cancel-toast')).toBeVisible();
  await page.locator('#sibling-a-close').press('Enter');
  await expect(page.locator('#sibling-a')).toBeHidden();
  await expect(page.locator('#sibling-b')).toBeVisible();
  await page.locator('#sibling-b-close').press('Space');
  await expect(page.locator('#sibling-b')).toBeHidden();
});

test('nested close is owned by the nearest toast root only', async ({ page }) => {
  test.skip(port === 'web', 'Web fixture is static CSS/semantic evidence only.');
  await page.goto(fixture);
  await waitForClient(page);
  await expect(page.locator('#nested-outer')).toBeVisible();
  await expect(page.locator('#nested-inner')).toBeVisible();
  await page.locator('#nested-inner-close').click();
  await expect(page.locator('#nested-inner')).toBeHidden();
  await expect(page.locator('#nested-outer')).toBeVisible();
});

test('showing a dynamic status does not move focus', async ({ page }) => {
  test.skip(port === 'web', 'Web fixture is static CSS/semantic evidence only.');
  await page.goto(fixture);
  await waitForClient(page);
  const show = page.locator('#show-dynamic');
  await show.focus();
  await show.press('Enter');
  await expect(page.locator('#dynamic-toast')).toBeVisible();
  await expect(show).toBeFocused();
});

test('timer starts only after committed open and rejected timeout fires once per cycle', async ({ page }) => {
  test.skip(port === 'web', 'Web fixture is static CSS/semantic evidence only.');
  await page.clock.install();
  await page.goto(fixture);
  await waitForClient(page);
  await expect(page.locator('#timer-toast')).toBeHidden();
  await page.locator('#timer-open').click();
  await expect(page.locator('#timer-toast')).toBeVisible();
  await page.clock.fastForward(800);
  expect(await requests(page, 'timerRequests')).toBe(0);
  await page.clock.fastForward(250);
  await expect.poll(() => requests(page, 'timerRequests')).toBe(1);
  await expect(page.locator('#timer-toast')).toBeVisible();
  await page.clock.fastForward(5000);
  expect(await requests(page, 'timerRequests')).toBe(1);
  await page.locator('#timer-force-close').click();
  await expect(page.locator('#timer-toast')).toBeHidden();
  await page.locator('#timer-force-open').click();
  await expect(page.locator('#timer-toast')).toBeVisible();
  await page.clock.fastForward(1050);
  await expect.poll(() => requests(page, 'timerRequests')).toBe(2);
});

test('duration changes restart the active cycle and persistent or invalid values cancel timing', async ({ page }) => {
  test.skip(port === 'web', 'Web fixture is static CSS/semantic evidence only.');
  await page.clock.install();
  await page.goto(fixture);
  await waitForClient(page);
  const toast = page.locator('#timer-toast');
  await page.locator('#timer-open').click();
  await expect(toast).toBeVisible();
  await page.clock.fastForward(250);
  await page.locator('#timer-duration-500').click();
  await page.clock.fastForward(350);
  expect(await requests(page, 'timerRequests')).toBe(0);
  await page.clock.fastForward(200);
  await expect.poll(() => requests(page, 'timerRequests')).toBe(1);

  await page.locator('#timer-force-close').click();
  await expect(toast).toBeHidden();
  await page.locator('#timer-force-open').click();
  await expect(toast).toBeVisible();
  await page.locator('#timer-duration-zero').click();
  await page.clock.fastForward(5000);
  expect(await requests(page, 'timerRequests')).toBe(1);

  await page.locator('#timer-duration-negative').click();
  await page.clock.fastForward(5000);
  expect(await requests(page, 'timerRequests')).toBe(1);

  await page.locator('#timer-duration-nonfinite').click();
  await page.clock.fastForward(5000);
  expect(await requests(page, 'timerRequests')).toBe(1);
});

test('ordinary rerender and callback identity changes do not restart the timer deadline', async ({ page }) => {
  test.skip(port === 'web', 'Web fixture is static CSS/semantic evidence only.');
  await page.clock.install();
  await page.goto(fixture);
  await waitForClient(page);
  await page.locator('#timer-open').click();
  await page.clock.fastForward(250);
  await page.locator('#timer-rerender').click();
  await page.clock.fastForward(500);
  expect(await requests(page, 'timerRequests')).toBe(0);
  await page.clock.fastForward(300);
  await expect.poll(() => requests(page, 'timerRequests')).toBe(1);
});

test('hover and focus pause independently; duration replacement stays paused and resumes fresh', async ({ page }) => {
  test.skip(port === 'web', 'Web fixture is static CSS/semantic evidence only.');
  await page.clock.install();
  await page.goto(fixture);
  await waitForClient(page);
  await page.locator('#timer-open').click();
  await page.clock.fastForward(250);
  const toast = page.locator('#timer-toast');
  await toast.hover();
  await page.clock.fastForward(1000);
  expect(await requests(page, 'timerRequests')).toBe(0);
  await page.locator('#timer-close').focus();
  await page.evaluate(() => document.querySelector('#timer-duration-500').click());
  await page.clock.fastForward(1000);
  expect(await requests(page, 'timerRequests')).toBe(0);
  await page.locator('#outside-focus').hover();
  await page.clock.fastForward(1000);
  expect(await requests(page, 'timerRequests')).toBe(0);
  await page.locator('#outside-focus').focus();
  await page.clock.fastForward(350);
  expect(await requests(page, 'timerRequests')).toBe(0);
  await page.clock.fastForward(200);
  await expect.poll(() => requests(page, 'timerRequests')).toBe(1);
});

test('teardown clears an old timer and reconnect or remount gets one fresh cycle', async ({ page }) => {
  test.skip(port === 'web', 'Web fixture is static CSS/semantic evidence only.');
  await page.clock.install();
  await page.goto(fixture);
  await waitForClient(page);
  await page.locator('#teardown-toggle').click();
  await expect(page.locator('#teardown-toast')).toBeHidden();
  await page.clock.fastForward(1000);
  expect(await requests(page, 'teardownRequests')).toBe(0);
  await page.locator('#teardown-toggle').click();
  await expect(page.locator('#teardown-toast')).toBeVisible();
  await page.clock.fastForward(350);
  expect(await requests(page, 'teardownRequests')).toBe(0);
  await page.clock.fastForward(200);
  await expect.poll(() => requests(page, 'teardownRequests')).toBe(1);
});
