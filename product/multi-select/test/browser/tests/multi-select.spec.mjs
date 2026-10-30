import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('multi-select toggles options independently and preserves authored naming', async ({ page }) => {
  await page.goto(`/components/multi-select/${port}.html`);
  const listbox = page.getByRole('listbox', { name: 'Choose items' });
  const optionA = page.locator('#a');
  await expect(listbox).toBeVisible();
  await expect(listbox).toHaveCSS('display', 'grid');
  await expect(listbox).toHaveCSS('min-width', '192px');
  await expect(optionA).toHaveCSS('padding-left', '16px');
  await optionA.click();
  await page.locator('#b').click();
  await expect(optionA).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#b')).toHaveAttribute('aria-selected', 'true');
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});
