import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const port = process.env.VF_COMPONENT_PORT || 'react';
const supportedPorts = new Set(['react', 'angular', 'vue', 'elements']);
test('Portal renders authored content into the explicit host without accessibility violations', async ({ page }) => {
  test.skip(!supportedPorts.has(port), `Portal has no ${port} implementation to validate.`);
  await page.goto(`/components/portal/${port}.html`);
  await expect(page.locator('#portal-target #portal-content')).toBeVisible();
  await expect(page.locator('#app #portal-content')).toHaveCount(0);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({ path: `test-results/portal-${port}.png`, fullPage: true });
});
