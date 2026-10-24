import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';
const port = process.env.VF_COMPONENT_PORT || 'react';
test('Portal renders authored content into the explicit host without accessibility violations', async ({ page }) => {
  await page.goto(`/next/portal-fixtures/${port}.html`);
  await expect(page.locator('#portal-target #portal-content')).toBeVisible();
  await expect(page.locator('#app #portal-content')).toHaveCount(0);
  await page.addScriptTag({ content: axeCore.source });
  const results = await page.evaluate(async () => globalThis.axe.run(document));
  expect(results.violations).toEqual([]);
  await page.screenshot({ path: `test-results/portal-${port}.png`, fullPage: true });
});
