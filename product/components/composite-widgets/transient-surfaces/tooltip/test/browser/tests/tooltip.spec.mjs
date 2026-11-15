import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('tooltip relationship is accessible', async ({ page }) => {
  await page.goto(`/components/tooltip/${port}.html`);
  if (port !== 'web') {
    await page.waitForFunction(() => document.body.dataset.tooltipReady === 'true');
    await page.getByRole('button', { name: 'Info' }).focus();
  }
  await expect(page.getByRole('tooltip')).toBeVisible();
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('public Tooltip CSS resolves canonical control radius and typography in light, dark, and forced-colors modes', async ({
  page,
}) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/tooltip/web.html');
  const tooltip = page.getByRole('tooltip');

  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(tooltip).toHaveCSS('border-radius', '6px');
    await expect(tooltip).toHaveCSS('font-size', '15px');
    await expect(tooltip).toHaveCSS('font-weight', '600');
    expect(await tooltip.evaluate((element) => getComputedStyle(element).fontFamily)).toContain('ui-sans-serif');
  }

  await page.locator('html').evaluate((element) => {
    element.style.setProperty('--vf-control-font-family', 'monospace');
    element.style.setProperty('--vf-control-font-size', '18px');
    element.style.setProperty('--vf-control-font-weight', '700');
  });
  await expect(tooltip).toHaveCSS('font-family', 'monospace');
  await expect(tooltip).toHaveCSS('font-size', '18px');
  await expect(tooltip).toHaveCSS('font-weight', '700');

  await page.locator('html').evaluate((element) => {
    element.style.removeProperty('--vf-control-font-family');
    element.style.removeProperty('--vf-control-font-size');
    element.style.removeProperty('--vf-control-font-weight');
  });
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(tooltip).toHaveCSS('border-radius', '6px');
  await expect(tooltip).toHaveCSS('font-size', '15px');
  await expect(tooltip).toHaveCSS('font-weight', '600');
});

test('Public Tooltip uses native top layer and persists across hover and focus until Escape', async ({ page }) => {
  test.skip(port === 'web', 'Native runtime behavior is owned by the runtime ports.');
  await page.goto(`/components/tooltip/${port}.html`);
  await page.waitForFunction(() => document.body.dataset.tooltipReady === 'true');
  const trigger = page.getByRole('button', { name: 'Info' });
  const tooltip = page.locator('#tip');
  await expect(trigger).toHaveAttribute('aria-describedby', 'additional tip');
  await expect(trigger).toHaveAccessibleDescription('Additional context More information');
  await expect(tooltip).toBeHidden();
  await trigger.hover();
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveAttribute('popover', 'manual');
  expect(await tooltip.evaluate((element) => element.matches(':popover-open'))).toBe(true);
  const anchorBox = await trigger.boundingBox();
  const surfaceBox = await tooltip.boundingBox();
  expect(surfaceBox.y).toBeGreaterThanOrEqual(anchorBox.y + anchorBox.height - 1);
  await tooltip.hover();
  await page.waitForTimeout(150);
  await expect(tooltip).toBeVisible();
  await trigger.focus();
  await page.locator('#outside').hover();
  await page.waitForTimeout(150);
  await expect(tooltip).toBeVisible();
  await trigger.press('Escape');
  await expect(tooltip).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAccessibleDescription('Additional context More information');
  await page.locator('#outside').focus();
  await trigger.focus();
  await expect(tooltip).toBeVisible();
  await expectNoAxeViolations(page);
});

test('Elements Tooltip allocates distinct relationships and cancels pending work on removal', async ({ page }) => {
  test.skip(port !== 'elements', 'Public Elements native behavior.');
  await page.goto('/components/tooltip/elements.html');
  await page.waitForFunction(() => Boolean(customElements.get('vf-tooltip')));
  const second = page.getByRole('button', { name: 'Generated' });
  const description = await second.getAttribute('aria-describedby');
  expect(description).toBeTruthy();
  expect(description).not.toBe('tip');
  await expect(second).toHaveAccessibleDescription('Generated description');
  await page.locator('#generated').evaluate((root) => root.setAttribute('open-delay', '150'));
  await second.hover();
  await page.locator('#generated').evaluate((root) => {
    window.removedTooltip = root;
    root.remove();
  });
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.removedTooltip.hasAttribute('open'))).toBe(false);
});

test('Tooltip description relationships exist before activation', async ({ browser }) => {
  test.skip(port === 'web', 'SSR evidence belongs to runtime ports.');
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`/components/tooltip/${port}.html`);
    const trigger = page.getByRole('button', { name: 'Info' });
    await expect(trigger).toHaveAccessibleDescription('Additional context More information');
    await expect(page.locator('#tip')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Second' })).toHaveAccessibleDescription('Second description');
  } finally {
    await context.close();
  }
});

test('Controlled Tooltip requests visibility without overriding the committed value', async ({ page }) => {
  test.skip(port === 'web' || port === 'elements', 'Controlled framework contracts.');
  await page.goto(`/components/tooltip/${port}.html`);
  await page.waitForFunction(() => document.body.dataset.tooltipReady === 'true');
  const trigger = page.getByRole('button', { name: 'Controlled' });
  await trigger.focus();
  await expect(page.locator('body')).toHaveAttribute('data-tooltip-request', 'true');
  await expect(page.locator('#controlled-tip')).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAccessibleDescription('Controlled description');
});
