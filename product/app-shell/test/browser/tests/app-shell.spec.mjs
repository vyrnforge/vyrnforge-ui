import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';

const port = process.env.VF_COMPONENT_PORT || 'react';

test('app shell preserves landmarks, shared chrome, full-bleed desktop structure, and responsive structure', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/next/app-shell-fixtures/${port}.html`);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(1);
  const presentation = await page.evaluate(() => {
    const shell = document.querySelector('[data-vf-app-shell]');
    const header = document.querySelector('[data-vf-app-shell-header]');
    const body = document.querySelector('[data-vf-app-shell-body]');
    const navigation = document.querySelector('[data-vf-app-shell-navigation]');
    const shellStyle = getComputedStyle(shell);
    const headerStyle = getComputedStyle(header);
    const navigationStyle = getComputedStyle(navigation);
    return {
      viewport: document.documentElement.clientWidth,
      shell: shell.getBoundingClientRect().width,
      body: body.getBoundingClientRect().width,
      headerBorder: headerStyle.borderBlockEndWidth,
      headerShadow: headerStyle.boxShadow,
      navBorder: navigationStyle.borderInlineEndWidth,
      shellBackground: shellStyle.backgroundColor,
      navBackground: navigationStyle.backgroundColor,
    };
  });
  expect(Math.abs(presentation.shell - presentation.viewport)).toBeLessThanOrEqual(1);
  expect(Math.abs(presentation.body - presentation.viewport)).toBeLessThanOrEqual(1);
  expect(presentation.headerBorder).toBe('1px');
  expect(presentation.headerShadow).not.toBe('none');
  expect(presentation.navBorder).toBe('1px');
  expect(presentation.navBackground).not.toBe(presentation.shellBackground);
  await page.setViewportSize({ width: 640, height: 800 });
  await expect(page.locator('[data-vf-app-shell-body]')).toBeVisible();
  const mobileNavigation = await page.locator('[data-vf-app-shell-navigation]').evaluate((node) => {
    const style = getComputedStyle(node);
    return { inlineEnd: style.borderInlineEndWidth, blockEnd: style.borderBlockEndWidth };
  });
  expect(mobileNavigation.inlineEnd).toBe('0px');
  expect(mobileNavigation.blockEnd).toBe('1px');
  await page.addScriptTag({ content: axeCore.source });
  expect((await page.evaluate(async () => globalThis.axe.run(document))).violations).toEqual([]);
});

test('settings navigation preserves deep links, route history, title and focus while local state remains local', async ({ page }) => {
  test.skip(port !== 'react', 'STD-07 representative route integration is intentionally verified through the React public entrypoints.');

  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('/next/app-shell-fixtures/settings-navigation-react.html?route=%2Fsettings%2Fprofile&tab=preferences');

  const main = page.locator('[data-vf-app-shell-main]');
  const profileLink = page.getByRole('link', { name: 'Profile', exact: true });
  const securityLink = page.getByRole('link', { name: 'Security', exact: true });
  const detailsTab = page.getByRole('tab', { name: 'Details', exact: true });
  const preferencesTab = page.getByRole('tab', { name: 'Preferences', exact: true });

  await expect(page).toHaveTitle('Profile settings');
  await expect(page.getByRole('heading', { level: 1, name: 'Profile settings' })).toBeVisible();
  await expect(profileLink).toHaveAttribute('aria-current', 'page');
  await expect(securityLink).not.toHaveAttribute('aria-current', 'page');
  await expect(preferencesTab).toHaveAttribute('aria-selected', 'true');
  await expect(main).not.toBeFocused();

  await detailsTab.click();
  await expect(detailsTab).toHaveAttribute('aria-selected', 'true');
  await expect(page).toHaveURL(/tab=details/);
  await expect(page).toHaveTitle('Profile settings');
  await expect(profileLink).toHaveAttribute('aria-current', 'page');
  await expect(detailsTab).toBeFocused();

  await securityLink.click();
  await expect(page).toHaveURL(/route=%2Fsettings%2Fsecurity/);
  await expect(page).toHaveTitle('Security settings');
  await expect(page.getByRole('heading', { level: 1, name: 'Security settings' })).toBeVisible();
  await expect(securityLink).toHaveAttribute('aria-current', 'page');
  await expect(main).toBeFocused();

  await page.goBack();
  await expect(page).toHaveURL(/route=%2Fsettings%2Fprofile/);
  await expect(page).toHaveURL(/tab=details/);
  await expect(page).toHaveTitle('Profile settings');
  await expect(profileLink).toHaveAttribute('aria-current', 'page');
  await expect(detailsTab).toHaveAttribute('aria-selected', 'true');
  await expect(main).toBeFocused();

  await page.getByRole('link', { name: 'Edit profile', exact: true }).click();
  await expect(page).toHaveURL(/route=%2Fsettings%2Fprofile%2Fedit/);
  await expect(page).toHaveTitle('Edit profile');
  await expect(page.getByRole('heading', { level: 1, name: 'Edit profile' })).toBeVisible();
  await expect(profileLink).toHaveAttribute('aria-current', 'page');
  await expect(main).toBeFocused();

  await page.getByRole('link', { name: 'Return to profile settings', exact: true }).click();
  await expect(page).toHaveURL(/route=%2Fsettings%2Fprofile/);
  await expect(page).toHaveURL(/tab=details/);
  await expect(page).toHaveTitle('Profile settings');
  await expect(main).toBeFocused();

  await page.setViewportSize({ width: 640, height: 800 });
  await expect(page.locator('.settings-persistent-navigation')).toBeHidden();
  const navigationTrigger = page.getByRole('button', { name: 'Settings navigation', exact: true });
  await expect(navigationTrigger).toBeVisible();
  await navigationTrigger.click();
  await expect(page.getByRole('dialog', { name: 'Settings navigation' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Settings' }).getByRole('link', { name: 'Profile', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', { name: 'Close navigation', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Settings navigation' })).toBeHidden();
  await expect(navigationTrigger).toBeFocused();

  await page.addScriptTag({ content: axeCore.source });
  expect((await page.evaluate(async () => globalThis.axe.run(document))).violations).toEqual([]);
});

test('permission-aware task preserves work across authoritative denial and mid-task access loss', async ({ page }) => {
  test.skip(port !== 'react', 'STD-16 representative authorization integration is intentionally verified through the React public entrypoints.');

  await page.goto('/next/app-shell-fixtures/permission-access-react.html');

  const draft = page.getByLabel('Plan notes');
  const save = page.getByRole('button', { name: 'Save changes', exact: true });
  const impersonation = page.getByLabel('Impersonation context');

  await expect(impersonation).toContainText('Avery');
  await expect(impersonation).toContainText('Jordan');
  await expect(page.getByText('Illustrative organization role:')).toContainText('Editor');
  await expect(draft).not.toHaveAttribute('readonly');

  await draft.fill('Quarterly plan draft — unsaved change');
  await save.click();

  await expect(page.getByText('Your changes were not saved because edit access is no longer available. Your draft is preserved here.')).toBeVisible();
  await expect(draft).toHaveValue('Quarterly plan draft — unsaved change');
  await expect(draft).toHaveAttribute('readonly', '');
  await expect(save).toBeDisabled();
  await expect(page.getByText('Last committed value: “Quarterly plan draft”.')).toBeVisible();

  await draft.focus();
  await expect(draft).toBeFocused();

  const requestAccess = page.getByRole('button', { name: 'Request edit access', exact: true });
  await expect(requestAccess).toBeEnabled();
  await requestAccess.click();
  await expect(page.getByRole('button', { name: 'Request submitted', exact: true })).toBeDisabled();
  await expect(page.getByText('Edit access request submitted. Access has not been granted yet.')).toBeVisible();

  await page.getByRole('button', { name: 'Grant edit access for demo', exact: true }).click();
  await expect(draft).not.toHaveAttribute('readonly');
  await draft.fill('Second unsaved draft');
  await page.getByRole('button', { name: 'Revoke edit access for demo', exact: true }).click();
  await expect(draft).toHaveValue('Second unsaved draft');
  await expect(draft).toHaveAttribute('readonly', '');
  await expect(page.getByText('Edit access changed while you were working. Your unsaved draft is preserved in read-only mode.')).toBeVisible();

  await expect(impersonation).toBeVisible();
  await page.getByRole('button', { name: 'End impersonation', exact: true }).click();
  await expect(impersonation).toHaveCount(0);
  await expect(page.getByText('Avery is using their own identity.')).toBeVisible();

  await page.addScriptTag({ content: axeCore.source });
  expect((await page.evaluate(async () => globalThis.axe.run(document))).violations).toEqual([]);
});

test('item management preserves transaction truth and retries only unresolved bulk results', async ({ page }) => {
  test.skip(port !== 'react', 'STD-10 representative CRUD integration is intentionally verified through the React public entrypoints.');

  await page.goto('/next/app-shell-fixtures/item-management-react.html');

  const createName = page.locator('#crud-create-name');
  await createName.fill('Delta');
  await page.getByRole('button', { name: 'Create item', exact: true }).click();
  await expect(page.getByText('Created Delta.', { exact: true })).toBeVisible();
  await expect(page.locator('[data-item-id="item-5"]')).toContainText('Delta');

  await page.getByRole('button', { name: 'Edit Atlas', exact: true }).click();
  const editName = page.locator('#crud-edit-name');
  await expect(editName).toHaveValue('Atlas');
  await editName.fill('Atlas revised');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.locator('[data-item-id="atlas"]')).toContainText('Atlas revised');

  await page.getByRole('button', { name: 'Archive Beacon', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Restore Beacon', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Restore Beacon', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Archive Beacon', exact: true })).toBeVisible();

  await page.getByRole('checkbox', { name: 'Select Atlas revised', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Select Beacon', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Select Cedar', exact: true }).check();
  await expect(page.getByText('3 selected. Selection applies only to the explicitly checked active items.', { exact: true })).toBeVisible();

  const archiveSelected = page.getByRole('button', { name: 'Archive selected', exact: true });
  await archiveSelected.focus();
  await archiveSelected.click();
  await expect(page.getByText('1 item archived. 1 needs attention. 1 outcome is unknown.', { exact: true })).toBeVisible();
  await expect(archiveSelected).toBeFocused();
  await expect(page.getByRole('button', { name: 'Restore Atlas revised', exact: true })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Select Beacon', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Select Cedar', exact: true })).toBeChecked();
  await expect(page.getByText('Beacon: Retention hold prevents archiving.', { exact: true })).toBeVisible();
  await expect(page.getByText('Cedar: outcome unknown; reconcile before retrying.', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Retry unresolved', exact: true }).click();
  await expect(page.getByText('2 unresolved items archived. Known successes were not repeated.', { exact: true })).toBeVisible();
  await expect(page.getByText('Last retry request: Beacon, Cedar.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Restore Beacon', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Restore Cedar', exact: true })).toBeVisible();

  await page.addScriptTag({ content: axeCore.source });
  expect((await page.evaluate(async () => globalThis.axe.run(document))).violations).toEqual([]);
});
