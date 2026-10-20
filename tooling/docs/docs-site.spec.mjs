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

test('framework selection exposes current public component availability', async ({ page }) => {
  const verifyNoErrors = await expectNoRuntimeErrors(page);
  await page.goto('/next/');
  await page.getByLabel('Framework').selectOption('react');
  await expect(page).toHaveURL(/\/next\/frameworks\/react\/$/);
  await expect(page.locator('[data-vf-support-status="partial"]')).toContainText('React integration is available');
  await expect(page.getByRole('heading', { level: 2, name: 'Available component entrypoints' })).toBeVisible();
  await expect(page.locator('main')).toContainText('@vyrnforge/react/dialog');

  await page.getByLabel('Framework').selectOption('elements');
  await expect(page).toHaveURL(/\/next\/frameworks\/elements\/$/);
  await expect(page.locator('[data-vf-support-status="partial"]')).toContainText('Icon and Tabs');
  await expect(page.locator('main')).toContainText('@vyrnforge/elements/tabs');
  verifyNoErrors();
});

test('Button documentation uses executable multi-framework examples and a sandboxed live editor', async ({ page }) => {
  const verifyNoErrors = await expectNoRuntimeErrors(page);
  await page.goto('/next/components/button/');

  const playground = page.locator('[data-vf-example-id="button/basic"]');
  const editor = playground.getByRole('textbox', { name: 'Basic button code editor' });
  const frame = page.frameLocator('[data-vf-example-id="button/basic"] iframe');
  await expect(playground).toBeVisible();
  await expect(playground.locator('iframe')).toHaveAttribute('sandbox', 'allow-scripts');

  const expectations = [
    ['React', '@vyrnforge/react/button'],
    ['Angular', '@vyrnforge/angular/button'],
    ['Vue', '@vyrnforge/vue/button'],
    ['Native Web', 'data-vf-button']
  ];
  for (const [label, sourceNeedle] of expectations) {
    await playground.getByRole('tab', { name: label }).click();
    await expect(editor).toHaveValue(new RegExp(sourceNeedle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await expect(frame.getByRole('button', { name: 'Save changes' })).toBeVisible();
  }

  await playground.getByRole('tab', { name: 'React' }).click();
  const reactSource = await editor.inputValue();
  await editor.fill(reactSource.replace('Save changes', 'Ship release'));
  await playground.getByRole('button', { name: 'Run' }).click();
  await expect(playground.locator('[data-vf-example-status]')).toHaveText('Live preview updated.');
  await expect(frame.getByRole('button', { name: 'Ship release' })).toBeVisible();

  await playground.getByRole('tab', { name: 'Angular' }).click();
  await playground.getByRole('button', { name: 'Run' }).click();
  await expect(playground.locator('[data-vf-example-status]')).toHaveText('Live preview updated.');
  await expect(frame.getByRole('button', { name: 'Save changes' })).toBeVisible();

  await playground.getByRole('tab', { name: 'Vue' }).click();
  await playground.getByRole('button', { name: 'Run' }).click();
  await expect(playground.locator('[data-vf-example-status]')).toHaveText('Live preview updated.');
  await expect(frame.getByRole('button', { name: 'Save changes' })).toBeVisible();

  await playground.getByRole('tab', { name: 'Native Web' }).click();
  const nativeSource = await editor.inputValue();
  await editor.fill(nativeSource.replace('Save changes', 'Publish changes'));
  await playground.getByRole('button', { name: 'Run' }).click();
  await expect(playground.locator('[data-vf-example-status]')).toHaveText('Live preview updated.');
  await expect(frame.getByRole('button', { name: 'Publish changes' })).toBeVisible();

  verifyNoErrors();
});

test('Icon documentation renders the sample glyph in every executable framework example', async ({ page }) => {
  const verifyNoErrors = await expectNoRuntimeErrors(page);
  await page.goto('/next/components/icon/');

  const playground = page.locator('[data-vf-example-id="icon/basic"]');
  const frame = page.frameLocator('[data-vf-example-id="icon/basic"] iframe');
  await expect(playground).toBeVisible();

  for (const label of ['React', 'Angular', 'Vue', 'Elements', 'Native Web']) {
    await playground.getByRole('tab', { name: label }).click();
    await expect(frame.locator('[data-vf-icon]')).toBeVisible();
    await expect(frame.locator('[data-vf-icon] path')).toHaveCount(1);
  }

  verifyNoErrors();
});

test('Text documentation teaches the live typography scale instead of only listing variants', async ({ page }) => {
  const verifyNoErrors = await expectNoRuntimeErrors(page);
  await page.goto('/next/components/text/');

  const guide = page.locator('[data-vf-typography-guide]');
  await expect(guide).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Variants and sizes' })).toBeVisible();
  await expect(page.locator('[data-vf-type-specimen]')).toHaveCount(18);
  await expect(page.locator('[data-vf-type-specimen="overline"] [data-vf-text]')).toHaveCSS('text-transform', 'uppercase');

  const displaySize = await page.locator('[data-vf-type-specimen="display-lg"] [data-vf-text]').evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  const bodySize = await page.locator('[data-vf-type-specimen="body-md"] [data-vf-text]').evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(displaySize).toBeGreaterThan(bodySize);

  await expect(page.getByRole('heading', { level: 2, name: 'Semantics and appearance' })).toBeVisible();
  await expect(guide).toContainText('Semantics and style are separate');
  await expect(guide).toContainText('--vf-font-family-display');
  await expect(guide).toContainText('TextVariantOverrides');

  await page.setViewportSize({ width: 390, height: 844 });
  const horizontalOverflow = await guide.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(horizontalOverflow).toBeLessThanOrEqual(1);
  verifyNoErrors();
});

test('docs remain navigable at a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/next/foundations/accessibility/');
  await expect(page.getByRole('navigation', { name: 'Documentation' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Accessibility' })).toBeVisible();
  await expect(page.getByLabel('Framework')).toBeVisible();
});
