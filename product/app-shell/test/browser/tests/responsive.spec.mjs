import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';

const port = process.env.VF_COMPONENT_PORT || 'react';

async function expectNoPageInlineOverflow(page) {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

async function attachScreenshot(page, testInfo, name) {
  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage: true });
  await testInfo.attach(name, { path, contentType: 'image/png' });
}

test('STD-21 settings task preserves draft, actions, focus, and reflow across wide, zoom-equivalent, and 320 CSS pixel layouts', async ({ page }, testInfo) => {
  test.skip(port !== 'react', 'STD-21 representative responsive application evidence is intentionally verified through the React public entrypoints.');

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/next/app-shell-fixtures/settings-navigation-react.html?route=%2Fsettings%2Fprofile&tab=details');

  const draft = page.getByLabel('Display name');
  const save = page.getByRole('button', { name: 'Save profile', exact: true });
  const cancel = page.getByRole('button', { name: 'Cancel edits', exact: true });
  const navigationTrigger = page.getByRole('button', { name: 'Settings navigation', exact: true });

  await draft.fill('Unsaved responsive draft');
  await draft.focus();
  await expect(draft).toBeFocused();
  await expect(draft).toHaveValue('Unsaved responsive draft');
  await expect(page.getByText('Display name has unsaved changes.', { exact: true })).toBeVisible();
  await expect(page.locator('.settings-persistent-navigation')).toBeVisible();
  await expect(navigationTrigger).toBeHidden();
  await expectNoPageInlineOverflow(page);
  await attachScreenshot(page, testInfo, 'settings-wide-1280');

  await page.setViewportSize({ width: 640, height: 800 });
  await expect(draft).toHaveValue('Unsaved responsive draft');
  await expect(draft).toBeFocused();
  await expect(save).toBeVisible();
  await expect(cancel).toBeVisible();
  await expect(page.locator('.settings-persistent-navigation')).toBeHidden();
  await expect(navigationTrigger).toBeVisible();
  await expectNoPageInlineOverflow(page);
  await attachScreenshot(page, testInfo, 'settings-zoom-equivalent-640');

  await page.setViewportSize({ width: 320, height: 800 });
  await expect(draft).toHaveValue('Unsaved responsive draft');
  await expect(draft).toBeFocused();
  await expect(save).toBeVisible();
  await expect(cancel).toBeVisible();
  await expect(navigationTrigger).toBeVisible();
  await expectNoPageInlineOverflow(page);
  await attachScreenshot(page, testInfo, 'settings-reflow-320');

  await draft.press('Tab');
  await expect(save).toBeFocused();

  await navigationTrigger.click();
  await expect(page.getByRole('dialog', { name: 'Settings navigation' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Settings' }).getByRole('link', { name: 'Profile', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', { name: 'Close navigation', exact: true }).click();
  await expect(navigationTrigger).toBeFocused();
  await expect(draft).toHaveValue('Unsaved responsive draft');

  await page.addScriptTag({ content: axeCore.source });
  expect((await page.evaluate(async () => globalThis.axe.run(document))).violations).toEqual([]);
});

test('STD-21 data-list task preserves selection, required actions, focus, and reflow across wide, zoom-equivalent, and 320 CSS pixel layouts', async ({ page }, testInfo) => {
  test.skip(port !== 'react', 'STD-21 representative responsive application evidence is intentionally verified through the React public entrypoints.');

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/next/app-shell-fixtures/item-management-react.html');

  const atlas = page.getByRole('checkbox', { name: 'Select Atlas', exact: true });
  const beacon = page.getByRole('checkbox', { name: 'Select Beacon', exact: true });
  const archiveSelected = page.getByRole('button', { name: 'Archive selected', exact: true });
  const clearSelection = page.getByRole('button', { name: 'Clear selection', exact: true });

  await atlas.check();
  await beacon.check();
  await archiveSelected.focus();
  await expect(atlas).toBeChecked();
  await expect(beacon).toBeChecked();
  await expect(page.getByText('2 selected. Selection applies only to the explicitly checked active items.', { exact: true })).toBeVisible();
  await expect(archiveSelected).toBeFocused();
  await expectNoPageInlineOverflow(page);
  await attachScreenshot(page, testInfo, 'data-list-wide-1280');

  await page.setViewportSize({ width: 640, height: 900 });
  await expect(atlas).toBeChecked();
  await expect(beacon).toBeChecked();
  await expect(archiveSelected).toBeVisible();
  await expect(clearSelection).toBeVisible();
  await expect(archiveSelected).toBeFocused();
  await expectNoPageInlineOverflow(page);
  await attachScreenshot(page, testInfo, 'data-list-zoom-equivalent-640');

  await page.setViewportSize({ width: 320, height: 900 });
  await expect(atlas).toBeChecked();
  await expect(beacon).toBeChecked();
  await expect(page.getByText('2 selected. Selection applies only to the explicitly checked active items.', { exact: true })).toBeVisible();
  await expect(archiveSelected).toBeVisible();
  await expect(clearSelection).toBeVisible();
  await expect(page.getByRole('button', { name: 'Edit Atlas', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Archive Beacon', exact: true })).toBeVisible();
  await expect(archiveSelected).toBeFocused();
  await expectNoPageInlineOverflow(page);
  await attachScreenshot(page, testInfo, 'data-list-reflow-320');

  await archiveSelected.press('Tab');
  await expect(clearSelection).toBeFocused();

  await page.addScriptTag({ content: axeCore.source });
  expect((await page.evaluate(async () => globalThis.axe.run(document))).violations).toEqual([]);
});
