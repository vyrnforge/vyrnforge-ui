import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('carousel preserves accessible navigation', async ({ page }) => {
  await page.goto(`/components/carousel/${port}.html`);
  await expect(page.locator('#root')).toHaveAttribute('aria-roledescription', 'carousel');
  await page.locator('#next').click();
  await expect(page.getByText('Second slide')).toBeVisible();
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('public Carousel CSS resolves canonical spacing and control radius in light and dark themes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/carousel/web.html');
  const root = page.locator('#root');
  const next = page.locator('#next');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(root).toHaveCSS('gap', '8px');
    await expect(next).toHaveCSS('border-top-left-radius', '6px');
    await expect(next).toHaveCSS('border-top-right-radius', '6px');
  }
});
