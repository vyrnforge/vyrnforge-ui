import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';

const port = process.env.VF_COMPONENT_PORT || 'web';

test.describe('STD-06 profile form workflow', () => {
  test.skip(port !== 'react', 'The full representative workflow is declared and verified in React only.');

  test.beforeEach(async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    const response = await page.goto('/next/input-fixtures/react-profile.html');
    expect(response?.status()).toBe(200);
    try {
      await expect(page.locator('#profile-display-name')).toBeAttached({ timeout: 2000 });
    } catch {
      const body = await page.locator('body').innerText();
      throw new Error(`Profile fixture did not mount. pageErrors=${JSON.stringify(pageErrors)} body=${JSON.stringify(body)}`);
    }
  });

  test('preserves native form data, autocomplete, and conditional submission semantics', async ({ page }) => {
    const form = page.locator('form');
    const displayName = page.locator('#profile-display-name');
    const email = page.locator('#profile-email');

    await expect(displayName).toHaveJSProperty('tagName', 'INPUT');
    await expect(displayName).toHaveAttribute('name', 'displayName');
    await expect(displayName).toHaveAttribute('required', '');
    await expect(displayName).toHaveAttribute('autocomplete', 'name');
    await expect(email).toHaveAttribute('autocomplete', 'email');

    let data = await form.evaluate((node) => Object.fromEntries(new FormData(node).entries()));
    expect(data).toEqual({ displayName: 'Atlas Research', email: 'team@example.com', biography: '' });

    await page.getByLabel('Add a work phone').check();
    const phone = page.locator('#profile-work-phone');
    await expect(phone).toHaveAttribute('autocomplete', 'tel');
    await phone.fill('+62 21 555 0100');
    data = await form.evaluate((node) => Object.fromEntries(new FormData(node).entries()));
    expect(data.workPhone).toBe('+62 21 555 0100');

    await page.getByLabel('Add a work phone').uncheck();
    await expect(phone).toHaveCount(0);
    data = await form.evaluate((node) => Object.fromEntries(new FormData(node).entries()));
    expect(data.workPhone).toBeUndefined();

    await page.getByLabel('Add a work phone').check();
    await expect(page.locator('#profile-work-phone')).toHaveValue('+62 21 555 0100');
  });

  test('shows linked errors after explicit submit, focuses the summary once, and preserves values', async ({ page }) => {
    const displayName = page.locator('#profile-display-name');
    const email = page.locator('#profile-email');
    await displayName.fill('');
    await email.fill('not-an-email');

    await page.getByRole('button', { name: 'Save changes' }).click();
    const summary = page.locator('[aria-labelledby="profile-error-heading"]');
    await expect(summary).toBeFocused();
    await expect(summary.getByRole('link', { name: 'Enter a display name.' })).toHaveAttribute('href', '#profile-display-name');
    await expect(summary.getByRole('link', { name: /Enter an email address/ })).toHaveAttribute('href', '#profile-email');
    await expect(displayName).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(displayName).toHaveValue('');
    await expect(email).toHaveValue('not-an-email');

    await displayName.fill('Atlas Updated');
    await expect(page.locator('#profile-display-error')).toHaveCount(0);
    await expect(page.locator('#profile-email-error')).toBeVisible();
    await expect(displayName).toBeFocused();
  });

  test('reconciles a deterministic server field error without losing the draft', async ({ page }) => {
    const displayName = page.locator('#profile-display-name');
    const email = page.locator('#profile-email');
    await displayName.fill('Atlas Updated');
    await email.fill('taken@example.com');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page.locator('#profile-email-error')).toHaveText('That email address is already in use.');
    await expect(page.locator('[aria-labelledby="profile-error-heading"]')).toBeFocused();
    await expect(displayName).toHaveValue('Atlas Updated');
    await expect(email).toHaveValue('taken@example.com');

    await email.fill('new@example.com');
    await expect(page.locator('#profile-email-error')).toHaveCount(0);
    await expect(email).toBeFocused();
  });

  test('supports deterministic draft recovery, native reset activation, and explicit cancel discard', async ({ page }) => {
    const displayName = page.locator('#profile-display-name');
    const biography = page.locator('#profile-biography');

    await displayName.fill('Draft profile');
    await biography.fill('Draft biography');
    await page.getByRole('button', { name: 'Save draft' }).click();
    await expect(page.getByRole('status')).toHaveText('Draft saved in this example.');

    await displayName.fill('Changed after draft');
    await page.getByRole('button', { name: 'Restore draft' }).click();
    await expect(displayName).toHaveValue('Draft profile');
    await expect(biography).toHaveValue('Draft biography');

    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(displayName).toHaveValue('Atlas Research');
    await expect(biography).toHaveValue('');

    await displayName.fill('Unsaved edit');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Discard unsaved changes?')).toBeVisible();
    await expect(displayName).toHaveValue('Unsaved edit');
    await page.getByRole('button', { name: 'Discard changes' }).click();
    await expect(displayName).toHaveValue('Atlas Research');
    await expect(page.getByRole('status')).toHaveText('Unsaved changes discarded.');
  });

  test('ignores repeated submit intent while pending and exposes authored Indonesian content', async ({ page }) => {
    const save = page.getByRole('button', { name: 'Save changes' });
    await save.dblclick();
    await expect(save).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByRole('status')).toHaveText('Profile changes saved by the example service.');

    await page.getByRole('button', { name: 'Bahasa Indonesia' }).click();
    await expect(page.locator('section[lang="id"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Detail profil' })).toBeVisible();
    await expect(page.getByLabel('Nama tampilan')).toHaveAttribute('name', 'displayName');
    await expect(page.getByLabel('Alamat email')).toHaveAttribute('name', 'email');
  });

  test('has no automated accessibility violations in the representative state', async ({ page }) => {
    await page.getByLabel('Add a work phone').check();
    await page.addScriptTag({ content: axeCore.source });
    const results = await page.evaluate(async () => globalThis.axe.run(document));
    expect(results.violations).toEqual([]);
  });
});
