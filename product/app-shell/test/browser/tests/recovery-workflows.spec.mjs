import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';

const port = process.env.VF_COMPONENT_PORT || 'react';
const fixture = '/components/app-shell/recovery-workflows-react.html';

async function resolveLoad(page, value = 'Atlas') {
  await page.evaluate((next) => globalThis.__vfRecoveryService.resolveLoad(next), value);
  await expect(page.getByLabel('Display name')).toHaveValue(value);
}

async function emitSave(page, attemptId, event) {
  await page.evaluate(({ id, next }) => globalThis.__vfRecoveryService.emitSave(id, next), { id: attemptId, next: event });
}

test.describe('STD-05 / STD-12 / STD-13 recovery workflows', () => {
  test.skip(port !== 'react', 'Representative recovery evidence is intentionally bounded to React public entrypoints and deterministic application-owned services.');

  test('distinguishes initial loading from ready state and preserves task focus across list-state transitions', async ({ page }) => {
    await page.goto(fixture);
    await expect(page.getByRole('heading', { name: 'Profile editor' })).toBeVisible();
    await expect(page.getByText('Loading profile. No empty or error state is committed yet.')).toBeVisible();
    await expect(page.getByLabel('Display name')).toHaveCount(0);

    await resolveLoad(page);
    await expect(page.locator('[data-committed-value]')).toHaveText('Atlas');

    const search = page.getByLabel('Search projects');
    await expect(search).toHaveValue('quarterly');
    await expect(page.getByText('Loading projects. Results are not known yet.')).toBeVisible();

    const sentinel = page.locator('#focus-sentinel');
    await sentinel.focus();
    await page.evaluate(() => globalThis.__vfRecoveryService.setListState('empty'));
    await expect(page.getByText('No projects yet. Create a project to get started.')).toBeVisible();
    await expect(sentinel).toBeFocused();

    await page.evaluate(() => globalThis.__vfRecoveryService.setListState('no-results'));
    await expect(page.getByText('No results for “quarterly”. Change or clear the current search.')).toBeVisible();
    await expect(search).toHaveValue('quarterly');
    await expect(sentinel).toBeFocused();

    await page.evaluate(() => globalThis.__vfRecoveryService.setListState('error'));
    await expect(page.getByText('Projects could not be loaded. Try again when the service is available.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeVisible();
    await expect(sentinel).toBeFocused();

    await page.evaluate(() => globalThis.__vfRecoveryService.setListState('permission'));
    await expect(page.getByText(/do not have permission to view these projects/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Request access', exact: true })).toBeVisible();
    await expect(sentinel).toBeFocused();
  });

  test('optimistic edits keep pending distinct from committed truth and reconcile stale remote completion', async ({ page }) => {
    await page.goto(fixture);
    await resolveLoad(page);
    const input = page.getByLabel('Display name');
    const save = page.getByRole('button', { name: 'Save changes', exact: true });

    await input.fill('Beacon');
    await save.focus();
    await save.click();
    await expect(save).toHaveAttribute('aria-busy', 'true');
    await expect(save).not.toBeDisabled();
    await expect(page.locator('[data-preview-value]')).toHaveText('Beacon');
    await expect(page.locator('[data-committed-value]')).toHaveText('Atlas');
    await expect(page.locator('[data-editor-status]')).toContainText('optimistic, not committed success');
    await expect(save).toBeFocused();

    await input.fill('Cedar');
    await save.click();
    await expect(page.locator('body')).toHaveAttribute('data-save-attempts', '2');
    await expect(page.locator('[data-preview-value]')).toHaveText('Cedar');

    await emitSave(page, 1, { type: 'accepted', value: 'Beacon' });
    await expect(page.locator('[data-committed-value]')).toHaveText('Beacon');
    await expect(page.locator('[data-preview-value]')).toHaveText('Cedar');
    await expect(page.locator('[data-reconciliation]')).toContainText('Earlier attempt 1 committed remotely as Beacon');
    await expect(input).toHaveValue('Cedar');

    await emitSave(page, 2, { type: 'rejected' });
    await expect(page.locator('[data-preview-value]')).toHaveText('Beacon');
    await expect(page.locator('[data-committed-value]')).toHaveText('Beacon');
    await expect(input).toHaveValue('Cedar');
    await expect(page.getByRole('alert')).toContainText('draft is preserved');

    await input.fill('Delta');
    await save.click();
    await save.click();
    await expect(page.locator('body')).toHaveAttribute('data-save-attempts', '3');
    await expect(page.locator('body')).toHaveAttribute('data-duplicate-policy', 'ignored-same-pending-intent');
    await emitSave(page, 3, { type: 'accepted', value: 'Delta' });
    await expect(page.locator('[data-committed-value]')).toHaveText('Delta');
    await expect(page.locator('[data-preview-value]')).toHaveText('Delta');
    await expect(page.locator('[data-editor-status]')).toHaveText('Saved Delta authoritatively.');
  });

  test('system failure preserves the draft and stale refresh retains useful data with safe recovery', async ({ page }) => {
    await page.goto(fixture);
    await resolveLoad(page);
    const input = page.getByLabel('Display name');
    const save = page.getByRole('button', { name: 'Save changes', exact: true });
    await input.fill('Unsaved local draft');
    await save.click();
    await emitSave(page, 1, { type: 'system-failure' });
    await expect(input).toHaveValue('Unsaved local draft');
    await expect(page.locator('[data-committed-value]')).toHaveText('Atlas');
    await expect(page.locator('[data-preview-value]')).toHaveText('Atlas');
    await expect(page.getByRole('alert')).toContainText('save service failed');

    const refresh = page.getByRole('button', { name: 'Refresh report', exact: true });
    await refresh.focus();
    await refresh.click();
    await expect(page.locator('[data-report-value]')).toHaveText('Quarterly revenue: 42');
    await page.evaluate(() => globalThis.__vfRecoveryService.emitRefresh('failed'));
    await expect(page.locator('[data-report-value]')).toHaveText('Quarterly revenue: 42');
    await expect(page.locator('[data-stale-state]')).toHaveText('Stale — last updated 10:00.');
    await expect(page.getByRole('status').filter({ hasText: 'Refresh failed' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Try again', exact: true }).click();
    await expect(page.locator('body')).toHaveAttribute('data-refresh-attempts', '2');
    await page.evaluate(() => globalThis.__vfRecoveryService.emitRefresh('accepted'));
    await expect(page.locator('[data-report-value]')).toHaveText('Quarterly revenue: 43');
  });

  test('blocked form submission preserves values and unrelated errors through the existing public Input/Button workflow', async ({ page }) => {
    await page.goto('/components/input/react-profile.html');
    const displayName = page.locator('#profile-display-name');
    const email = page.locator('#profile-email');
    await displayName.fill('');
    await email.fill('not-an-email');
    await page.getByRole('button', { name: 'Save changes' }).click();

    const summary = page.locator('[aria-labelledby="profile-error-heading"]');
    await expect(summary).toBeFocused();
    await expect(displayName).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveValue('not-an-email');
    await summary.getByRole('link', { name: 'Enter a display name.' }).click();
    await expect(displayName).toBeFocused();
    await displayName.fill('Atlas Updated');
    await expect(page.locator('#profile-display-error')).toHaveCount(0);
    await expect(page.locator('#profile-email-error')).toBeVisible();
    await expect(email).toHaveValue('not-an-email');
  });

  test('bulk mixed outcomes retain committed work and retry only failed or unknown subsets', async ({ page }) => {
    await page.goto('/components/app-shell/item-management-react.html');
    await page.getByRole('checkbox', { name: 'Select Atlas', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Select Beacon', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Select Cedar', exact: true }).check();
    await page.getByRole('button', { name: 'Archive selected', exact: true }).click();
    await expect(page.getByText('1 item archived. 1 needs attention. 1 outcome is unknown.', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Restore Atlas', exact: true })).toBeVisible();
    await expect(page.getByText('Beacon: Retention hold prevents archiving.', { exact: true })).toBeVisible();
    await expect(page.getByText('Cedar: outcome unknown; reconcile before retrying.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Retry unresolved', exact: true }).click();
    await expect(page.getByText('Last retry request: Beacon, Cedar.', { exact: true })).toBeVisible();
    await expect(page.getByText('2 unresolved items archived. Known successes were not repeated.', { exact: true })).toBeVisible();
  });

  test('representative recovery fixture has no automated accessibility violations', async ({ page }) => {
    await page.goto(fixture);
    await resolveLoad(page);
    await page.evaluate(() => globalThis.__vfRecoveryService.setListState('no-results'));
    expect((await expectNoAxeViolations(page)).violations).toEqual([]);
  });
});
