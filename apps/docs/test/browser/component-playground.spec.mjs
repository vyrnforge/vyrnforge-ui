import { test, expect } from '@playwright/test';

test('Button playground keeps configuration, interaction and generated usage synchronized', async ({ page }) => {
  await page.goto('/next/react/components/button/');
  const playground = page.locator('[data-vf-docs-component-playground="Button"]');
  const preview = playground.getByRole('region', { name: 'Button preview' });
  const button = preview.getByRole('button', { name: 'Save changes' });
  const code = playground.getByRole('region', { name: 'Generated React usage' });
  await playground.getByRole('radio', { name: 'secondary', exact: true }).check();
  await playground.getByRole('radio', { name: 'lg', exact: true }).check();
  await expect(button).toHaveAttribute('data-vf-variant', 'secondary');
  await expect(button).toHaveAttribute('data-vf-size', 'lg');
  await expect(code).toContainText('variant={"secondary"}');
  await button.focus();
  await button.press('Space');
  await expect(preview.getByRole('status')).toHaveText('Activations: 1');
  await playground.getByRole('button', { name: 'Busy and disabled' }).click();
  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute('aria-busy', 'true');
  await playground.getByRole('button', { name: 'Reset playground' }).click();
  await expect(button).toBeEnabled();
  await expect(code).not.toContainText('variant=');
  await expect(preview.getByRole('status')).toHaveText('Activations: 0');
});

test('Checkbox and Radio playground previews update configuration and source', async ({ page }) => {
  await page.goto('/next/react/components/checkbox/');
  const checkbox = page.locator('[data-vf-docs-component-playground="Checkbox"]');
  const preview = checkbox.getByRole('region', { name: 'Checkbox preview' });
  await checkbox.getByRole('radio', { name: 'mixed', exact: true }).check();
  await expect(preview.getByRole('checkbox')).toHaveJSProperty('indeterminate', true);
  await preview.getByRole('checkbox').click();
  await expect(checkbox.getByRole('radio', { name: 'checked', exact: true })).toBeChecked();
  await expect(checkbox.getByRole('region', { name: 'Generated React usage' })).toContainText('>("checked")');

  await page.goto('/next/react/components/radio/');
  const radio = page.locator('[data-vf-docs-component-playground="Radio"]');
  const radioPreview = radio.getByRole('region', { name: 'Radio preview' });
  await radioPreview.getByRole('radio', { name: 'Standard' }).focus();
  await radioPreview.getByRole('radio', { name: 'Standard' }).press('ArrowRight');
  await expect(radioPreview.getByRole('radio', { name: 'Express' })).toBeChecked();
  await expect(radio.getByRole('region', { name: 'Generated React usage' })).toContainText('useState("express")');
});

test('Playground preserves source and reflows at narrow widths with clipboard denied', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: () => Promise.reject(new Error('denied')),
    } });
  });
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/next/react/components/button/');
  const playground = page.locator('[data-vf-docs-component-playground="Button"]');
  await playground.getByRole('button', { name: 'Copy React usage' }).click();
  await expect(playground.getByRole('region', { name: 'Generated React usage' })).toBeFocused();
  await expect(playground.getByText('Source selected. Use your device copy command.')).toBeVisible();
  await expect(playground).toBeVisible();
  await playground.screenshot({ path: testInfo.outputPath('playground-mobile-light.png') });
  await page.evaluate(() => { document.documentElement.dataset.vfTheme = 'dark'; });
  await playground.screenshot({ path: testInfo.outputPath('playground-mobile-dark.png') });
});
