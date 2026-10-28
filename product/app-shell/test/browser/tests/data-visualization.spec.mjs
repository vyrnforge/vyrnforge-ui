import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';

const port = process.env.VF_COMPONENT_PORT || 'react';

async function expectNoPageInlineOverflow(page) {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

async function attachScreenshot(page, testInfo, name) {
  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage: true });
  await testInfo.attach(name, { path, contentType: 'image/png' });
}

test('STD-22 trend distinguishes missing and estimated data and preserves an exact nonvisual data path', async ({ page }, testInfo) => {
  test.skip(port !== 'react', 'STD-22 representative consumer evidence is intentionally verified through the React public AppShell entrypoint.');

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/next/app-shell-fixtures/data-visualization-react.html');

  await expect(page.getByRole('heading', { name: 'Weekly completion rate, 6 Jul–24 Aug 2026' })).toBeVisible();
  await expect(page.getByText('Completion increased from 71% to an estimated 85%; the 20 Jul observation is missing, and the 24 Aug estimate ranges from 82% to 88%.', { exact: true })).toBeVisible();
  await expect(page.locator('.viz-observed-line[data-segment="before-gap"]')).toHaveCount(1);
  await expect(page.locator('.viz-observed-line[data-segment="after-gap"]')).toHaveCount(1);
  await expect(page.locator('[data-status="missing"]')).toHaveCount(1);
  await expect(page.locator('[data-status="estimated"]')).toHaveCount(1);
  await expect(page.locator('.viz-uncertainty')).toHaveCount(1);

  const trendTable = page.getByRole('table', { name: 'Weekly completion rate data' });
  await expect(trendTable).toBeVisible();
  const missingRow = trendTable.getByRole('row', { name: /Jul 20/ });
  await expect(missingRow).toContainText('Missing observation');
  const estimateRow = trendTable.getByRole('row', { name: /Aug 24/ });
  await expect(estimateRow).toContainText('Estimated');
  await expect(estimateRow).toContainText('82%–88%');

  await expectNoPageInlineOverflow(page);
  await attachScreenshot(page, testInfo, 'visualization-wide-1280');

  await page.setViewportSize({ width: 320, height: 900 });
  await expect(page.locator('.viz-trend')).toBeHidden();
  await expect(page.getByText('Completion increased from 71% to an estimated 85%; the 20 Jul observation is missing, and the 24 Aug estimate ranges from 82% to 88%.', { exact: true })).toBeVisible();
  await expect(trendTable).toBeVisible();
  await expect(missingRow).toContainText('Missing observation');
  await expect(estimateRow).toContainText('82%–88%');
  const trendDataRegion = page.getByLabel('Scrollable weekly completion rate data');
  await trendDataRegion.focus();
  await expect(trendDataRegion).toBeFocused();
  await expectNoPageInlineOverflow(page);
  await attachScreenshot(page, testInfo, 'visualization-reflow-320');

  await page.addScriptTag({ content: axeCore.source });
  expect((await page.evaluate(async () => globalThis.axe.run(document))).violations).toEqual([]);
});

test('STD-22 categorical comparison uses a zero-based magnitude encoding and localized exact values', async ({ page }) => {
  test.skip(port !== 'react', 'STD-22 representative consumer evidence is intentionally verified through the React public AppShell entrypoint.');

  await page.setViewportSize({ width: 960, height: 900 });
  await page.goto('/next/app-shell-fixtures/data-visualization-react.html?locale=de-DE');

  await expect(page.locator('[data-example-locale="de-DE"]')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Completed orders by channel' })).toBeVisible();
  await expect(page.locator('.viz-bars')).toHaveAttribute('data-scale-min', '0');
  await expect(page.getByText('Web leads with 1.248 completed orders, followed by Partner at 936.', { exact: true })).toBeVisible();

  const comparisonTable = page.getByRole('table', { name: 'Completed order counts by channel' });
  await expect(comparisonTable).toBeVisible();
  await expect(comparisonTable.getByRole('row', { name: /Web/ })).toContainText('1.248');
  await expect(comparisonTable.getByRole('row', { name: /Partner/ })).toContainText('936');
  const comparisonDataRegion = page.getByLabel('Scrollable completed order counts by channel');
  await comparisonDataRegion.focus();
  await expect(comparisonDataRegion).toBeFocused();
  await expectNoPageInlineOverflow(page);

  await page.addScriptTag({ content: axeCore.source });
  expect((await page.evaluate(async () => globalThis.axe.run(document))).violations).toEqual([]);
});
