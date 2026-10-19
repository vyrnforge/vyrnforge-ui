import { test, expect } from '@playwright/test';

async function expectNoRuntimeErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return () => expect(errors, errors.join('\n')).toEqual([]);
}

test('docs home exposes versioned accessible navigation and search', async ({ page }) => {
  const verifyNoErrors = await expectNoRuntimeErrors(page);
  await page.goto('/next/');
  await expect(page).toHaveTitle(/Getting Started · VyrnForge/);
  await expect(page.getByRole('heading', { level: 1, name: 'Getting Started' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeAttached();
  await expect(page.locator('[data-vf-docs-version]')).toContainText('next');

  const search = page.getByRole('searchbox', { name: 'Search' });
  await search.fill('styling');
  const result = page.getByRole('link', { name: 'Styling' }).last();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page.getByRole('heading', { level: 1, name: 'Styling' })).toBeVisible();
  verifyNoErrors();
});

test('framework selection navigates to explicit implementation status', async ({ page }) => {
  const verifyNoErrors = await expectNoRuntimeErrors(page);
  await page.goto('/next/');
  await page.getByLabel('Framework').selectOption('react');
  await expect(page).toHaveURL(/\/next\/frameworks\/react\/$/);
  await expect(page.locator('[data-vf-support-status="not-implemented"]')).toContainText('not implemented');
  await expect(page.getByRole('heading', { name: 'Shared VyrnForge foundations' })).toBeVisible();
  verifyNoErrors();
});

test('docs remain navigable at a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/next/foundations/accessibility/');
  await expect(page.getByRole('navigation', { name: 'Documentation' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Accessibility' })).toBeVisible();
  await expect(page.getByLabel('Framework')).toBeVisible();
});
