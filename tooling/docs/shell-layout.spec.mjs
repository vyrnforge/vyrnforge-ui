import { test, expect } from '@playwright/test';

test('guide AppShell uses full-width application chrome at desktop size', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/next/');

  const geometry = await page.evaluate(() => {
    const shell = document.querySelector('vf-app-shell');
    const header = document.querySelector('[data-vf-app-shell-header]');
    const body = document.querySelector('[data-vf-app-shell-body]');
    const navigation = document.querySelector('[data-vf-app-shell-navigation]');
    const main = document.querySelector('[data-vf-app-shell-main]');
    const footer = document.querySelector('[data-vf-app-shell-footer]');
    return {
      viewport: document.documentElement.clientWidth,
      shell: shell.getBoundingClientRect(),
      header: header.getBoundingClientRect(),
      body: body.getBoundingClientRect(),
      navigation: navigation.getBoundingClientRect(),
      main: main.getBoundingClientRect(),
      footer: footer.getBoundingClientRect()
    };
  });

  expect(Math.abs(geometry.shell.width - geometry.viewport)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.header.width - geometry.viewport)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.body.width - geometry.viewport)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.footer.width - geometry.viewport)).toBeLessThanOrEqual(1);
  expect(geometry.navigation.x).toBeLessThanOrEqual(1);
  expect(geometry.navigation.width).toBeGreaterThan(250);
  expect(geometry.main.width).toBeGreaterThan(900);
});

test('guide AppShell remains single-column and overflow-safe on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/next/');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.locator('[data-vf-app-shell-navigation]')).toBeVisible();
  await expect(page.locator('[data-vf-app-shell-main]')).toBeVisible();
});
