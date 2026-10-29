import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('tag remove action is accessible', async ({ page }) => {
  await page.goto(`/components/tag-group/${port}.html`);
  await page.locator('#remove').click();
  await expect(page.locator('#tag')).toHaveCount(0);
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('public TagGroup CSS resolves canonical spacing in light and dark themes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/tag-group/web.html');
  const root = page.locator('#root');
  const tag = page.locator('#tag');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(root).toHaveCSS('gap', '8px');
    await expect(tag).toHaveCSS('gap', '4px');
    await expect(tag).toHaveCSS('padding-left', '8px');
    await expect(tag).toHaveCSS('padding-right', '8px');
  }
});
