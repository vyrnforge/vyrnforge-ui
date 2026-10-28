import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';

const port = process.env.VF_COMPONENT_PORT || 'react';

test.describe('STD-09 native table management', () => {
  test.skip(port !== 'react', 'Representative STD-09 evidence is intentionally bounded to the React public-entrypoint consumer.');

  test('preserves native semantics, sort state, page selection scope, and focus', async ({ page }) => {
    await page.goto('/components/app-shell/data-table-management-react.html');

    const table = page.getByRole('table', { name: 'Records available for review' });
    await expect(table).toBeVisible();
    const nameHeader = table.getByRole('columnheader').nth(1);
    const nameSort = nameHeader.getByRole('button');
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    await expect(nameSort).toHaveAccessibleName(/Name, ascending/);

    await nameSort.click();
    await expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
    await expect(nameSort).toHaveAccessibleName(/Name, descending/);
    await expect(nameSort).toBeFocused();

    await page.getByRole('checkbox', { name: 'Select Lumen' }).check();
    const pageSelector = page.getByRole('checkbox', { name: 'Select all rows on this page' });
    await expect(pageSelector).toHaveJSProperty('indeterminate', true);
    await expect(page.getByRole('status').filter({ hasText: 'selected on this page' })).toContainText('1 selected on this page');
    await expect(page.getByRole('status').filter({ hasText: 'selected on this page' })).toContainText('Off-page results are not selected');

    await pageSelector.check();
    await expect(pageSelector).toBeChecked();
    await expect(page.getByRole('status').filter({ hasText: 'selected on this page' })).toContainText('5 selected on this page');

    const bulk = page.getByRole('button', { name: 'Mark selected on this page reviewed' });
    await bulk.click();
    await expect(bulk).toBeFocused();
    await expect(page.getByRole('status').filter({ hasText: 'marked reviewed' })).toContainText('5 selected rows on this page marked reviewed');

    const next = page.getByRole('link', { name: 'Next page' });
    await next.click();
    await expect(next).toBeFocused();
    await expect(page.getByText(/Page 2 of 3/)).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: 'selected on this page' })).toContainText('0 selected on this page');
  });

  test('keeps the task accessible at 320 CSS pixels without page-level horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/components/app-shell/data-table-management-react.html');

    const metrics = await page.evaluate(() => ({ documentWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth }));
    expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth);
    await expect(page.getByRole('button', { name: /Name, ascending/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mark selected on this page reviewed' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Record pages' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Record table' })).toBeVisible();
  });

  test('passes structural accessibility guardrails', async ({ page }) => {
    await page.goto('/components/app-shell/data-table-management-react.html');
    await page.addScriptTag({ content: axeCore.source });
    const results = await page.evaluate(async () => globalThis.axe.run(document));
    expect(results.violations).toEqual([]);
  });
});