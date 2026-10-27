import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';

const port = process.env.VF_COMPONENT_PORT || 'react';

test('search field clears and restores focus', async ({ page }) => {
  await page.goto(`/next/search-field-fixtures/${port}.html`);
  await page.locator('#clear').click();
  await expect(page.locator('#search')).toHaveValue('');
  await expect(page.locator('#search')).toBeFocused();
  await page.addScriptTag({ content: axeCore.source });
  expect((await page.evaluate(async () => globalThis.axe.run(document))).violations).toEqual([]);
});

test('STD-08 list explorer preserves committed criteria, history, IME, stale-response, and zero-result recovery', async ({ page }) => {
  test.skip(port !== 'react', 'Representative STD-08 application integration is intentionally React-only.');

  await page.goto('/next/search-field-fixtures/data-explorer-react.html?q=forge&active=1&sort=updated');
  const query = page.getByLabel('Search projects');
  const active = page.getByLabel('Active only');
  const mine = page.getByLabel('Owned by me');
  const sort = page.getByLabel('Sort by');

  await expect(query).toHaveValue('forge');
  await expect(active).toBeChecked();
  await expect(mine).not.toBeChecked();
  await expect(sort).toHaveValue('updated');
  await expect(page.getByRole('list', { name: 'Project results' })).toContainText('Forge beta');
  await expect(page.getByRole('status')).toHaveText('1 project');

  await query.fill('Atlas');
  await expect(page).toHaveURL(/q=forge/);
  await expect(page.getByRole('list', { name: 'Project results' })).toContainText('Forge beta');

  await query.dispatchEvent('compositionstart');
  await query.fill('Delta');
  await query.press('Enter');
  await expect(page).toHaveURL(/q=forge/);
  await query.dispatchEvent('compositionend');
  await query.press('Enter');
  await expect(page).toHaveURL(/q=Delta/);
  await expect(page.getByRole('list', { name: 'Project results' })).toContainText('Delta research');

  await query.fill('atlas');
  await query.press('Enter');
  await query.fill('forge');
  await query.press('Enter');
  await expect(page).toHaveURL(/q=forge/);
  await expect(page.getByRole('status')).toHaveText('1 project');
  await expect(page.getByRole('list', { name: 'Project results' })).toContainText('Forge beta');
  await page.waitForTimeout(120);
  await expect(page.getByRole('list', { name: 'Project results' })).toContainText('Forge beta');
  await expect(page.getByRole('list', { name: 'Project results' })).not.toContainText('Atlas migration');

  await active.uncheck();
  await expect(page).toHaveURL(/q=forge/);
  await expect(page).not.toHaveURL(/active=1/);
  await expect(active).toBeFocused();
  await expect(page.getByRole('status')).toHaveText('1 project');

  await mine.check();
  await expect(page).toHaveURL(/mine=1/);
  await expect(page.getByRole('status')).toHaveText('0 projects');
  await expect(page.getByRole('heading', { name: 'No matching projects' })).toBeVisible();

  await page.goBack();
  await expect(mine).not.toBeChecked();
  await expect(page).not.toHaveURL(/mine=1/);
  await expect(page.getByRole('list', { name: 'Project results' })).toContainText('Forge beta');

  await query.fill('temporary draft');
  await page.getByRole('button', { name: 'Clear project search' }).click();
  await expect(query).toHaveValue('');
  await expect(query).toBeFocused();
  await expect(page).toHaveURL(/q=forge/);

  await query.fill('zzzz');
  await query.press('Enter');
  await expect(page).toHaveURL(/q=zzzz/);
  await expect(page.getByRole('heading', { name: 'No matching projects' })).toBeVisible();
  await expect(query).toHaveValue('zzzz');

  await page.getByRole('button', { name: 'Reset search and filters' }).first().click();
  await expect(query).toHaveValue('');
  await expect(active).not.toBeChecked();
  await expect(mine).not.toBeChecked();
  await expect(sort).toHaveValue('name');
  await expect(page).not.toHaveURL(/[?&](q|active|mine|sort)=/);
  await expect(page.getByRole('status')).toHaveText('6 projects');

  await page.addScriptTag({ content: axeCore.source });
  expect((await page.evaluate(async () => globalThis.axe.run(document))).violations).toEqual([]);
});
