import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';

const port = process.env.VF_COMPONENT_PORT || 'react';
const fixture = '/components/app-shell/notification-feedback-react.html';

async function emit(page, event) {
  await page.evaluate((next) => globalThis.__vfNotificationService.emit(next), event);
}

test.describe('STD-14 notification and feedback selection', () => {
  test.skip(port !== 'react', 'Representative channel-selection evidence is intentionally bounded to React public entrypoints and application-owned events.');

  test('authoritative save success uses a timed supplemental Toast while durable saved state remains', async ({ page }) => {
    await page.clock.install();
    await page.goto(fixture);
    const save = page.getByRole('button', { name: 'Save profile', exact: true });
    await save.focus();
    await save.click();
    await expect(page.locator('[data-saved-state]')).toHaveText('Save pending; no success has been committed.');
    await expect(page.locator('#save-success-toast')).toHaveCount(0);
    await expect(save).toBeFocused();

    await emit(page, 'save-accepted');
    const toast = page.locator('#save-success-toast');
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute('role', 'status');
    await expect(page.locator('#notification-viewport')).toHaveAttribute('aria-live', 'polite');
    await expect(page.getByRole('button', { name: 'Tutup notifikasi', exact: true })).toBeVisible();
    await expect(page.locator('[data-saved-state]')).toHaveText('Profile saved authoritatively.');
    await expect(save).toBeFocused();

    await page.clock.fastForward(1050);
    await expect(toast).toHaveCount(0);
    await expect(page.locator('[data-saved-state]')).toHaveText('Profile saved authoritatively.');
  });

  test('failed background work keeps recovery durable and a persistent Toast remains supplemental', async ({ page }) => {
    await page.clock.install();
    await page.goto(fixture);
    const focusTarget = page.getByRole('button', { name: 'Save profile', exact: true });
    await focusTarget.focus();
    await emit(page, 'job-failed');

    const durable = page.locator('[data-job-record]');
    const toast = page.locator('#job-failure-toast');
    await expect(durable).toContainText('Quarterly export failed');
    await expect(page.getByRole('button', { name: 'Retry export', exact: true })).toBeVisible();
    await expect(toast).toBeVisible();
    await expect(focusTarget).toBeFocused();

    await page.clock.fastForward(5000);
    await expect(toast).toBeVisible();
    await page.getByRole('button', { name: 'Tutup notifikasi pekerjaan', exact: true }).click();
    await expect(toast).toHaveCount(0);
    await expect(durable).toContainText('Quarterly export failed');
    await page.getByRole('button', { name: 'Retry export', exact: true }).click();
    await expect(page.locator('body')).toHaveAttribute('data-job-retries', '1');
    await expect(durable).toBeVisible();
  });

  test('persistent outage stays scoped and dismissal does not imply resolution', async ({ page }) => {
    await page.goto(fixture);
    await emit(page, 'outage-started');
    await expect(page.locator('[data-outage-banner]')).toContainText('Reporting service outage');
    await expect(page.locator('[data-outage-banner]')).toContainText('Profile editing remains available');
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.getByRole('button', { name: 'Hide outage notice', exact: true }).click();
    await expect(page.locator('[data-outage-banner]')).toHaveCount(0);
    await expect(page.locator('[data-outage-durable]')).toContainText('Reporting outage remains active');
    await expect(page.getByRole('button', { name: 'Show outage notice', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Show outage notice', exact: true }).click();
    await expect(page.locator('[data-outage-banner]')).toBeVisible();
  });

  test('critical security severity remains durable without mechanically selecting a modal', async ({ page }) => {
    await page.goto(fixture);
    const focusTarget = page.getByRole('button', { name: 'Save profile', exact: true });
    await focusTarget.focus();
    await emit(page, 'security-notice');
    await expect(page.locator('[data-security-banner]')).toContainText('Critical security notice');
    await expect(page.locator('[data-security-record]')).toContainText('New sign-in from an unrecognized device');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(focusTarget).toBeFocused();
  });

  test('representative channel composition has no automated accessibility violations', async ({ page }) => {
    await page.goto(fixture);
    await emit(page, 'job-failed');
    await emit(page, 'outage-started');
    await emit(page, 'security-notice');
    expect((await expectNoAxeViolations(page)).violations).toEqual([]);
  });
});
