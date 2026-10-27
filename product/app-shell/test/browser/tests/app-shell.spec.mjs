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
  const profileLink = page.getByRole('link', { name: 'Profile' });
  const securityLink = page.getByRole('link', { name: 'Security' });
  const detailsTab = page.getByRole('tab', { name: 'Details' });
  const preferencesTab = page.getByRole('tab', { name: 'Preferences' });

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

  await page.getByRole('link', { name: 'Edit profile' }).click();
  await expect(page).toHaveURL(/route=%2Fsettings%2Fprofile%2Fedit/);
  await expect(page).toHaveTitle('Edit profile');
  await expect(page.getByRole('heading', { level: 1, name: 'Edit profile' })).toBeVisible();
  await expect(profileLink).toHaveAttribute('aria-current', 'page');
  await expect(main).toBeFocused();

  await page.getByRole('link', { name: 'Return to profile settings' }).click();
  await expect(page).toHaveURL(/route=%2Fsettings%2Fprofile/);
  await expect(page).toHaveURL(/tab=details/);
  await expect(page).toHaveTitle('Profile settings');
  await expect(main).toBeFocused();

  await page.setViewportSize({ width: 640, height: 800 });
  await expect(page.locator('.settings-persistent-navigation')).toBeHidden();
  const navigationTrigger = page.getByRole('button', { name: 'Settings navigation' });
  await expect(navigationTrigger).toBeVisible();
  await navigationTrigger.click();
  await expect(page.getByRole('dialog', { name: 'Settings navigation' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Settings' }).getByRole('link', { name: 'Profile' })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('button', { name: 'Close navigation' }).click();
  await expect(page.getByRole('dialog', { name: 'Settings navigation' })).toBeHidden();
  await expect(navigationTrigger).toBeFocused();

  await page.addScriptTag({ content: axeCore.source });
  expect((await page.evaluate(async () => globalThis.axe.run(document))).violations).toEqual([]);
});
