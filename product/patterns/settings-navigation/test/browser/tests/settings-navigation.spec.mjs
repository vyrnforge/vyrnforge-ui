import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('settings navigation preserves deep links, route history, title and focus while local state remains local', async ({ page }) => {
  test.skip(port !== 'react', 'STD-07 representative route integration is intentionally verified through the React public entrypoints.');

  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto('/components/app-shell/settings-navigation-react.html?route=%2Fsettings%2Fprofile&tab=preferences');

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

  
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('saved display name commits before later Cancel restores that saved value', async ({ page }) => {
  test.skip(port !== 'react', 'The reference settings form is intentionally a React-only consumer task.');

  await page.goto('/components/app-shell/settings-navigation-react.html?route=%2Fsettings%2Fprofile&tab=details');

  const name = page.getByRole('textbox', { name: 'Display name' });
  const status = page.getByRole('status');
  await expect(name).toHaveValue('Avery Example');

  await name.fill('New Visible Name');
  await expect(status).toHaveText('Display name has unsaved changes.');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(name).toHaveValue('New Visible Name');
  await expect(status).toHaveText('Saved display name New Visible Name.');

  await name.fill('Uncommitted Draft');
  await expect(status).toHaveText('Display name has unsaved changes.');
  await page.getByRole('button', { name: 'Cancel edits' }).click();
  await expect(name).toHaveValue('New Visible Name');
  await expect(status).toHaveText('Unsaved profile changes discarded.');
});
