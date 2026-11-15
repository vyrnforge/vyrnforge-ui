import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('tag group exposes native list and individually named removal actions', async ({ page }) => {
  await page.goto(`/components/tag-group/${port}.html`);
  if (port === 'elements') await expect(page.locator('body')).toHaveAttribute('data-tag-ready', 'true');
  await expect(page.getByRole('list', { name: 'Selected tags' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Remove Design' })).toHaveAttribute('type', 'button');
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('runtime removal follows committed DOM changes and preserves adjacent or external focus', async ({ page }) => {
  test.skip(port === 'web', 'Native Web owns the authored list/button and styling baseline.');
  await page.goto(`/components/tag-group/${port}.html`);
  if (port === 'elements') await expect(page.locator('body')).toHaveAttribute('data-tag-ready', 'true');
  const body = page.locator('body');
  const remove = page.locator('#remove');
  await remove.focus();
  await body.evaluate((element) => {
    element.dataset.rejectRemoval = 'true';
  });
  await page.keyboard.press('Enter');
  await expect(remove).toBeFocused();
  await expect(page.locator('#tag')).toBeVisible();
  await body.evaluate((element) => {
    delete element.dataset.rejectRemoval;
  });
  await page.keyboard.press('Space');
  await expect(page.locator('#tag')).toHaveCount(0);
  await expect(page.locator('#remove-build')).toBeFocused();
  await page.locator('#remove-ship').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#tag-ship')).toHaveCount(0);
  await expect(page.locator('#remove-build')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('listitem')).toHaveCount(0);
  await expect(page.locator('#root')).toBeFocused();

  await page.reload();
  if (port === 'elements') await expect(body).toHaveAttribute('data-tag-ready', 'true');
  await body.evaluate((element) => {
    element.dataset.outsideFocus = 'true';
  });
  await page.locator('#remove').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#tag')).toHaveCount(0);
  await expect(page.locator('#outside')).toBeFocused();
});

test('public TagGroup CSS resolves canonical spacing and subtle surface in light and dark themes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/tag-group/web.html');
  const root = page.locator('#root');
  const tag = page.locator('#tag');
  const backgroundByTheme = {
    light: 'rgb(250, 250, 250)',
    dark: 'rgb(9, 9, 11)',
  };
  for (const [theme, background] of Object.entries(backgroundByTheme)) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(root).toHaveCSS('gap', '8px');
    await expect(tag).toHaveCSS('gap', '4px');
    await expect(tag).toHaveCSS('padding-left', '8px');
    await expect(tag).toHaveCSS('padding-right', '8px');
    await expect(tag).toHaveCSS('background-color', background);
  }
});
