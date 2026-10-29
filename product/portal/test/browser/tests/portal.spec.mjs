import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const port = process.env.VF_COMPONENT_PORT || 'react';
test('Portal renders authored content into the explicit host without accessibility violations', async ({ page }) => {
  await page.goto(`/components/portal/${port}.html`);
  await expect(page.locator('#portal-target #portal-content')).toBeVisible();
  await expect(page.locator('#app #portal-content')).toHaveCount(0);
  await page.addScriptTag({ content: axeCore.source });
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({ path: `test-results/portal-${port}.png`, fullPage: true });
});
