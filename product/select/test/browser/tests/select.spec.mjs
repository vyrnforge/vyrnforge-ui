import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('select opens accessibly and chooses option', async ({ page }) => {
  await page.goto(`/components/select/${port}.html`);
  const trigger = page.locator('#trigger');
  await trigger.click();
  const listbox = page.getByRole('listbox', { name: 'Choose an option' });
  await expect(listbox).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-controls', 'list');
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
  await page.locator('#opt').click();
  await expect(page.locator('#opt')).toHaveAttribute('aria-selected', 'true');
  await expect(trigger).toBeFocused();
});

test('public Select CSS resolves the canonical control radius in light and dark themes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/select/web.html');
  const trigger = page.locator('#trigger');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(trigger).toHaveCSS('border-radius', '6px');
  }
});
