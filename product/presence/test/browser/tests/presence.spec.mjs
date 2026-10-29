import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const port = process.env.VF_COMPONENT_PORT || 'react';
const supportedPorts = new Set(['react', 'angular', 'vue', 'elements']);
test('Presence retains exiting content until explicit completion', async ({ page }) => {
  test.skip(!supportedPorts.has(port), `Presence has no ${port} implementation to validate.`);
  await page.goto(`/components/presence/${port}.html`);
  const panel = page.locator('#panel');
  await expect(panel).toHaveAttribute('data-state', 'entered');
  await page.locator('#close').click();
  await expect(panel).toHaveAttribute('data-state', 'exiting');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  await page.locator('#complete').click();
  await expect(panel).toBeHidden();
  await page.screenshot({ path: `test-results/presence-${port}.png`, fullPage: true });
});
