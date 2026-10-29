import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';

const port = process.env.VF_COMPONENT_PORT || 'react';

async function openReactAlertDialog(page) {
  const trigger = page.getByRole('button', { name: 'Delete shared collection' });
  await trigger.click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  return { trigger, dialog };
}

test('alert dialog is labelled and accessible', async ({ page }) => {
  await page.goto(`/components/alert-dialog/${port}.html`);
  if (port === 'react') await page.getByRole('button', { name: 'Delete shared collection' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test.describe('STD-11 destructive AlertDialog workflow', () => {
  test.skip(port !== 'react', 'STD-11 commit-boundary evidence is intentionally bound to the React public entrypoint and deterministic application service.');

  test('Cancel, Escape, and backdrop interaction do not commit and restore focus predictably', async ({ page }) => {
    await page.goto('/components/alert-dialog/react.html');

    let { trigger, dialog } = await openReactAlertDialog(page);
    await expect(page.getByRole('heading', { name: 'Delete “Quarterly planning”?' })).toBeVisible();
    await expect(page.getByText('This permanently removes 14 shared items from the workspace. There is no self-service restore.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await expect(page.locator('body')).toHaveAttribute('data-delete-requests', '0');

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.locator('[data-collection-state]')).toHaveText('Quarterly planning is available.');
    await expect(page.locator('body')).toHaveAttribute('data-delete-requests', '0');

    ({ trigger, dialog } = await openReactAlertDialog(page));
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.locator('body')).toHaveAttribute('data-last-dismiss-reason', 'escape');
    await expect(page.locator('body')).toHaveAttribute('data-delete-requests', '0');

    ({ dialog } = await openReactAlertDialog(page));
    await dialog.evaluate((element) => {
      element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await expect(dialog).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-delete-requests', '0');
    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('delayed and rejected commits preserve decision context until authoritative success', async ({ page }) => {
    await page.goto('/components/alert-dialog/react.html');
    const { dialog } = await openReactAlertDialog(page);
    const action = page.getByRole('button', { name: 'Delete collection' });

    await action.click();
    await expect(page.getByRole('status')).toHaveText('Deleting collection…');
    await expect(dialog).toBeVisible();
    await expect(action).toBeFocused();
    await expect(page.locator('body')).toHaveAttribute('data-delete-requests', '1');
    await expect(page.locator('[data-collection-state]')).toHaveText('Quarterly planning is available.');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-last-dismiss-reason', 'escape');

    await page.evaluate(() => globalThis.__vfAlertDialogTestService.reject());
    await expect(page.getByRole('alert')).toHaveText('Deletion failed. Nothing was deleted. Review the consequence and retry.');
    await expect(dialog).toBeVisible();
    await expect(action).toBeFocused();
    await expect(page.locator('[data-collection-state]')).toHaveText('Quarterly planning is available.');

    await action.click();
    await expect(page.getByRole('status')).toHaveText('Deleting collection…');
    await expect(page.locator('body')).toHaveAttribute('data-delete-requests', '2');
    await expect(page.locator('[data-collection-state]')).toHaveText('Quarterly planning is available.');

    await page.evaluate(() => globalThis.__vfAlertDialogTestService.resolve());
    await expect(dialog).toBeHidden();
    await expect(page.locator('[data-collection-state]')).toHaveText('Quarterly planning deleted.');
    await expect(page.getByRole('button', { name: 'Collection deleted' })).toBeFocused();
  });
});
