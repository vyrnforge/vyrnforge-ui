import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../../../../tooling/testing/accessibility.mjs';
const port = process.env.VF_COMPONENT_PORT || 'react';

async function openFixture(page) {
  await page.goto(`/components/alert-dialog/${port}.html`);
  if (port === 'elements') await expect(page.locator('body')).toHaveAttribute('data-modal-ready', 'true');
  const trigger = page.locator('#trigger');
  const modal = page.locator('#modal');
  await expect(modal).not.toHaveAttribute('open', '');
  await trigger.click();
  await expect(modal).toHaveAttribute('open', '');
  expect(await modal.evaluate((el) => el.matches(':modal'))).toBe(true);
  await expect(page.getByRole('alertdialog', { name: 'Confirm changes', exact: true })).toBeVisible();
  await expect(page.locator('#close')).toBeFocused();
  return { modal, trigger };
}

test('alert-dialog public ports preserve native modality, naming, dismissal and focus', async ({ page }) => {
  const { modal, trigger } = await openFixture(page);
  if (port === 'react') await expect(modal).toHaveCSS('animation-name', 'vf-motion-enter-reveal');
  expect(await modal.evaluate((el) => !!el.ownerDocument.getElementById(el.getAttribute('aria-describedby')))).toBe(
    true,
  );
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(modal).not.toHaveAttribute('open', '');
  await expect(trigger).toBeFocused();
  if (port !== 'web') await expect(page.locator('body')).toHaveAttribute('data-dismiss-reason', 'escape');
  await trigger.click();
  await page.locator('#close').click();
  await expect(modal).not.toHaveAttribute('open', '');
  await expect(trigger).toBeFocused();
});

test('alert-dialog controlled rejection keeps committed native modality', async ({ page }) => {
  test.skip(port === 'web', 'Native authored baseline has no framework owner.');
  const { modal } = await openFixture(page);
  await page.locator('body').evaluate((body) => {
    body.dataset.rejectClose = 'true';
  });
  await page.keyboard.press('Escape');
  await expect(modal).toHaveAttribute('open', '');
  await expect(page.locator('body')).toHaveAttribute('data-dismiss-reason', 'escape');
  await page.locator('#close').click();
  await expect(modal).toHaveAttribute('open', '');
  await page.locator('body').evaluate((body) => {
    delete body.dataset.rejectClose;
  });
  await page.locator('#close').click();
  await expect(modal).not.toHaveAttribute('open', '');
});

test('AlertDialog backdrop never dismisses or commits a decision', async ({ page }) => {
  const { modal } = await openFixture(page);
  await page.mouse.click(3, 3);
  await expect(modal).toHaveAttribute('open', '');
  await expect(page.locator('body')).not.toHaveAttribute('data-dismiss-reason', /.+/);
  if (port === 'elements') {
    await page.locator('#owner').evaluate((el) => el.setAttribute('backdrop-dismiss', ''));
    await page.mouse.click(3, 3);
    await expect(modal).toHaveAttribute('open', '');
  }
});

async function openReactAlertDialog(page) {
  const trigger = page.getByRole('button', { name: 'Delete shared collection' });
  await trigger.click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  return { trigger, dialog };
}

test.describe('STD-11 destructive AlertDialog workflow', () => {
  test.skip(
    port !== 'react',
    'STD-11 commit-boundary evidence is intentionally bound to the React public entrypoint and deterministic application service.',
  );

  test('Cancel, Escape, and backdrop interaction do not commit and restore focus predictably', async ({ page }) => {
    await page.goto('/components/alert-dialog/destructive-react.html');

    let { trigger, dialog } = await openReactAlertDialog(page);
    await expect(page.getByRole('heading', { name: 'Delete “Quarterly planning”?' })).toBeVisible();
    await expect(
      page.getByText('This permanently removes 14 shared items from the workspace. There is no self-service restore.'),
    ).toBeVisible();
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
    await page.goto('/components/alert-dialog/destructive-react.html');
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
    await expect(page.getByRole('alert')).toHaveText(
      'Deletion failed. Nothing was deleted. Review the consequence and retry.',
    );
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
