import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

async function attachJson(testInfo, name, value) {
  await testInfo.attach(name, {
    body: Buffer.from(JSON.stringify(value, null, 2)),
    contentType: 'application/json',
  });
}

async function browserMetrics(page) {
  return page.evaluate(() => ({
    measures: performance.getEntriesByType('measure').map((entry) => ({ name: entry.name, duration: entry.duration })),
    longTasks: performance.getEntriesByType('longtask').map((entry) => ({ name: entry.name, startTime: entry.startTime, duration: entry.duration })),
    resources: performance.getEntriesByType('resource').map((entry) => ({ name: entry.name, duration: entry.duration, transferSize: entry.transferSize })),
    userAgent: navigator.userAgent,
    viewport: { width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth },
  }));
}

test('STD-24 records list/page-change measurements without a flaky timing gate', async ({ page }, testInfo) => {
  test.skip(port !== 'react', 'STD-24 representative evidence is intentionally bounded to the React public AppShell entrypoint.');

  await page.setViewportSize({ width: 1120, height: 900 });
  await page.goto('/components/app-shell/performance-feedback-react.html');
  await expect(page.getByRole('heading', { name: 'Measured performance without fake certainty' })).toBeVisible();
  await expect(page.getByText('2,000 records · 50 per page', { exact: true })).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(50);
  await expect(page.getByRole('status').filter({ hasText: 'Showing records 1–50 of 2000' })).toBeVisible();

  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Showing records 51–100 of 2000' })).toBeVisible();
  await expect(page.locator('tbody tr').first()).toContainText('51');

  const metrics = await browserMetrics(page);
  expect(metrics.measures.some((entry) => entry.name === 'vf-list-render' && Number.isFinite(entry.duration))).toBe(true);
  await attachJson(testInfo, 'performance-diagnostics', metrics);

  
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('STD-24 delayed save exposes pending state and does not fabricate success', async ({ page }) => {
  test.skip(port !== 'react', 'STD-24 representative evidence is intentionally bounded to the React public AppShell entrypoint.');

  await page.goto('/components/app-shell/performance-feedback-react.html');
  const note = page.getByLabel('Review note');
  await note.fill('Edited note remains visible during the delayed save.');
  const save = page.getByRole('button', { name: 'Save note' });
  await save.click();
  await expect(save).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByText('Saving note…', { exact: true })).toBeVisible();
  await expect(note).toHaveValue('Edited note remains visible during the delayed save.');
  await expect(page.getByText('Note saved by the deterministic fake service.', { exact: true })).toBeVisible();
});

test('STD-24 optional detail defers module activation and primary task remains usable', async ({ page }, testInfo) => {
  test.skip(port !== 'react', 'STD-24 representative evidence is intentionally bounded to the React public AppShell entrypoint.');

  await page.goto('/components/app-shell/performance-feedback-react.html');
  const activatedBefore = await page.evaluate(() => Boolean(globalThis.__vfPerformanceDetailEvaluated));
  expect(activatedBefore).toBe(false);

  await page.getByRole('button', { name: 'Load optional detail' }).click();
  await expect(page.getByText('Deferred detail capability loaded on demand. Loading this module is optional for the initial list task.', { exact: true })).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(50);
  expect(await page.evaluate(() => Boolean(globalThis.__vfPerformanceDetailEvaluated))).toBe(true);

  const after = await browserMetrics(page);
  const splitResources = after.resources.filter((entry) => entry.name.includes('/performance-chunks/'));
  expect(splitResources.length).toBeGreaterThan(0);
  await attachJson(testInfo, 'deferred-module-resources', splitResources);
});

test('STD-24 reduced motion disables the non-essential transition and narrow layout preserves task access', async ({ page }, testInfo) => {
  test.skip(port !== 'react', 'STD-24 representative evidence is intentionally bounded to the React public AppShell entrypoint.');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/components/app-shell/performance-feedback-react.html');

  const transition = await page.getByTestId('motion-indicator').evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(transition.split(',').every((value) => value.trim() === '0s')).toBe(true);
  await expect(page.getByRole('button', { name: 'Next page' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save note' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Load optional detail' })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  await attachJson(testInfo, 'narrow-reduced-motion', { dimensions, transitionDuration: transition });
});
