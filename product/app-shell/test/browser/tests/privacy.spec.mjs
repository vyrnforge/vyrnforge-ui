import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';

const port = process.env.VF_COMPONENT_PORT || 'react';

test('privacy controls preserve optional choice symmetry, permission recovery, export truth, and deletion confirmation', async ({ page }) => {
  test.skip(port !== 'react', 'STD-17 representative privacy integration is intentionally verified through the React public entrypoints.');

  await page.goto('/components/app-shell/privacy-controls-react.html');

  const allow = page.getByRole('button', { name: 'Allow optional analytics', exact: true });
  const decline = page.getByRole('button', { name: 'Decline optional analytics', exact: true });
  await expect(allow).toBeVisible();
  await expect(allow).toBeEnabled();
  await expect(decline).toBeVisible();
  await expect(decline).toBeEnabled();

  await decline.focus();
  await decline.click();
  await expect(page.getByText('Optional analytics declined. Core account use remains available.', { exact: true })).toBeVisible();
  await expect(decline).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Account deletion', exact: true })).toBeVisible();

  await allow.click();
  await expect(page.getByText('Optional analytics allowed by the fake preference service. You can turn it off here at any time.', { exact: true })).toBeVisible();
  const turnOff = page.getByRole('button', { name: 'Turn off optional analytics', exact: true });
  await expect(turnOff).toBeVisible();
  await turnOff.click();
  await expect(page.getByText('Optional analytics turned off for future demo processing. This example does not claim historical-data erasure.', { exact: true })).toBeVisible();
  await expect(allow).toBeVisible();
  await expect(decline).toBeVisible();

  await page.getByRole('button', { name: 'Use camera', exact: true }).click();
  await expect(page.getByText('Camera access was denied by the fake platform service. No native prompt is simulated; you can continue using the account or try the camera again.', { exact: true })).toBeVisible();
  const cameraRetry = page.getByRole('button', { name: 'Try camera again', exact: true });
  await expect(cameraRetry).toBeVisible();
  await cameraRetry.click();
  await expect(page.getByText('Camera access was granted by the fake platform service. Real browser permission lifetime remains platform-owned.', { exact: true })).toBeVisible();
  await expect(page.getByText('Fake camera state: granted. No real device access occurred.', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Request data export', exact: true }).click();
  await expect(page.getByText('Data export ready. Scope: Profile and account settings. The example does not simulate or claim a download.', { exact: true })).toBeVisible();
  await expect(page.getByText('Export state: ready. No download is simulated.', { exact: true })).toBeVisible();

  const deleteTrigger = page.getByRole('button', { name: 'Delete account', exact: true });
  await deleteTrigger.click();
  let dialog = page.getByRole('alertdialog', { name: 'Delete account?' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Some records may remain under the demo organization’s external retention, security, backup, or legal-hold policy.');
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(deleteTrigger).toBeFocused();
  await expect(deleteTrigger).toBeVisible();

  await deleteTrigger.click();
  dialog = page.getByRole('alertdialog', { name: 'Delete account?' });
  await dialog.getByRole('button', { name: 'Delete account', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText('Fake account state: deleted. This UI evidence does not prove backend erasure or retention compliance.', { exact: true })).toBeVisible();
  await expect(page.getByText('Account deletion committed by the fake service. This does not prove universal erasure, retention fulfillment, or legal compliance.', { exact: true })).toBeVisible();

  await page.addScriptTag({ content: axeCore.source });
  expect((await page.evaluate(async () => globalThis.axe.run(document))).violations).toEqual([]);
});
