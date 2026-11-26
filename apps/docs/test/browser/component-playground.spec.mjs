import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';

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
  await expect(code).not.toContainText(/<Button[^>]*\bvariant=/);
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
  await expect(playground.getByRole('region', { name: 'Generated React usage' }).locator('pre')).toBeFocused();
  await expect(playground.getByText('Source selected. Use your device copy command.')).toBeVisible();
  await expect(playground).toBeVisible();
  await playground.screenshot({ path: testInfo.outputPath('playground-mobile-light.png') });
  await page.evaluate(() => { document.documentElement.dataset.vfTheme = 'dark'; });
  await playground.screenshot({ path: testInfo.outputPath('playground-mobile-dark.png') });
});

test('Playground desktop and accessibility adaptations', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/next/react/components/button/');
  const playground = page.locator('[data-vf-docs-component-playground="Button"]');
  await expect(playground.getByRole('radio', { name: 'secondary' })).toBeEnabled();
  await playground.screenshot({ path: testInfo.outputPath('playground-desktop-light.png') });
  await page.evaluate(() => { document.documentElement.dataset.vfTheme = 'dark'; });
  await playground.screenshot({ path: testInfo.outputPath('playground-desktop-dark.png') });
  await page.addScriptTag({ content: axeCore.source });
  const results = await page.evaluate(async () => {
    return await window.axe.run('[data-vf-docs-component-playground="Button"]', {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
    });
  });
  expect(results.violations).toEqual([]);
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.dataset.vfDensity = 'compact'; });
  await playground.getByRole('radio', { name: 'ghost' }).check();
  await expect(playground.getByRole('region', { name: 'Button preview' }).getByRole('button'))
    .toHaveAttribute('data-vf-variant', 'ghost');
  await playground.screenshot({ path: testInfo.outputPath('playground-rtl-forced-colors.png') });
});

test('Avatar and Badge conditionally expose valid controls and generate actual public usage', async ({ page }) => {
  await page.goto('/next/react/components/avatar/');
  const avatar = page.locator('[data-vf-docs-component-playground="Avatar"]');
  await avatar.getByRole('radio', { name: 'icon', exact: true }).check();
  await expect(avatar.getByRole('textbox', { name: 'Custom initials' })).toBeDisabled();
  await expect(avatar.getByRole('region', { name: 'Avatar preview' }).locator('[data-vf-avatar]'))
    .toHaveAttribute('data-vf-avatar-appearance', 'icon');
  await expect(avatar.getByRole('region', { name: 'Generated React usage' })).toContainText('icon={<Icon icon={userIcon} />}');
  await page.goto('/next/react/components/badge/');
  const badge = page.locator('[data-vf-docs-component-playground="Badge"]');
  await badge.getByRole('spinbutton', { name: 'Count', exact: true }).fill('127');
  const preview = badge.getByRole('region', { name: 'Badge preview' });
  await expect(preview.locator('[data-vf-badge-indicator]')).toHaveText('99+');
  await expect(preview.getByRole('button', { name: 'Inbox, 127 unread messages' })).toBeVisible();
  await badge.getByRole('radio', { name: 'dot', exact: true }).check();
  await expect(badge.getByRole('spinbutton', { name: 'Count', exact: true })).toBeDisabled();
  await expect(badge.getByRole('region', { name: 'Generated React usage' })).not.toContainText('badgeContent');
});

test('Chip guide uses the shared playground, with valid source and removal focus', async ({ page }, testInfo) => {
  await page.goto('/next/react/components/chip/');
  const playground = page.locator('[data-vf-docs-component-playground="Chip"]');
  const preview = playground.getByRole('region', { name: 'Chip preview' });
  await playground.getByRole('radio', { name: 'selectable' }).check();
  await playground.getByRole('checkbox', { name: 'Deletable' }).check();
  await playground.getByRole('checkbox', { name: 'Custom delete icon' }).check();
  await preview.getByRole('button', { name: 'Engineering', exact: true }).click();
  await expect(playground.getByRole('checkbox', { name: 'Selected' })).toBeChecked();
  await expect(playground.getByRole('region', { name: 'Generated React usage' })).toContainText('useState(true)');
  await preview.getByRole('button', { name: 'Remove Engineering' }).click();
  await expect(preview.getByRole('button', { name: 'Restore' })).toBeFocused();
  await playground.getByRole('button', { name: 'Reset playground' }).click();
  await expect(preview.locator('[data-vf-chip]')).toBeVisible();
  await expect(playground.getByRole('checkbox', { name: 'Custom delete icon' })).toBeDisabled();
  await playground.screenshot({ path: testInfo.outputPath('chip-shared-playground-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await playground.screenshot({ path: testInfo.outputPath('chip-shared-playground-mobile.png') });
});
