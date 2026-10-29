import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

test('password field toggles visibility accessibly', async ({ page }) => {
  await page.goto(`/components/password-field/${port}.html`);
  await page.locator('#toggle').click();
  await expect(page.locator('#password')).toHaveAttribute('type', 'text');
  await expect(page.locator('#toggle')).toHaveAttribute('aria-pressed', 'true');
  
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('STD-15 representative session recovery preserves task context', async ({ page }) => {
  test.skip(port !== 'react', 'The complete STD-15 workflow is a declared React representative example.');
  await page.goto('/components/password-field/session-recovery-react.html');

  const note = page.getByRole('textbox', { name: 'Profile note', exact: true });
  await note.fill('Unsaved identity workflow draft');
  await page.getByRole('button', { name: 'Simulate session expiry', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Sign in again to continue editing', exact: true })).toBeFocused();
  await expect(page.getByTestId('draft-value')).toHaveText('Unsaved identity workflow draft');

  await page.getByRole('button', { name: 'Continue with passkey', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('passkey sign-in did not complete');
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(page.getByRole('button', { name: 'Use password instead', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Continue with organization SSO', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Organization sign-in did not complete');
  await expect(page.getByRole('alert')).toBeFocused();

  await page.getByRole('button', { name: 'Use password instead', exact: true }).click();
  await expect(page.getByLabel('Email address', { exact: true })).toHaveAttribute('autocomplete', 'username');
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('autocomplete', 'current-password');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('We could not sign you in with those credentials. Check them or use another allowed method.');

  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Enter your verification code', exact: true })).toBeFocused();
  const otpCells = page.getByRole('group', { name: 'Verification code', exact: true }).locator('input');
  await expect(otpCells).toHaveCount(4);
  await otpCells.nth(0).fill('1');
  await otpCells.nth(1).fill('2');
  await otpCells.nth(2).fill('3');
  await otpCells.nth(3).fill('4');
  await page.getByRole('button', { name: 'Verify and return to edit', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('incorrect or expired');
  await expect(page.getByTestId('draft-value')).toHaveText('Unsaved identity workflow draft');

  await page.getByRole('button', { name: 'Verify and return to edit', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Edit profile note', exact: true })).toBeFocused();
  await expect(note).toHaveValue('Unsaved identity workflow draft');
  await expect(page.getByText('Profile note saved by the example service.', { exact: true })).toHaveCount(0);

  
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});
