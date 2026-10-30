import { test, expect } from '@playwright/test';
import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';

const port = process.env.VF_COMPONENT_PORT || 'react';
const fixture = `/components/file-uploader/${port}.html`;

async function selectFile(page) {
  await page.locator('#input').setInputFiles({ name: 'records.csv', mimeType: 'text/csv', buffer: Buffer.from('name\nAtlas') });
}

async function emit(page, attemptId, event) {
  await page.evaluate(({ id, next }) => globalThis.__vfImportService.emit(id, next), { id: attemptId, next: event });
}

test('file uploader exposes selected files accessibly', async ({ page }) => {
  await page.goto(fixture);
  await page.locator('#input').setInputFiles({ name: 'example.txt', mimeType: 'text/plain', buffer: Buffer.from('ok') });
  await expect(page.getByText('example.txt')).toBeVisible();
  expect((await expectNoAxeViolations(page)).violations).toEqual([]);
});

test('public FileUploader CSS resolves the canonical subtle surface and focus ring in light and dark themes', async ({ page }) => {
  test.skip(port !== 'web', 'Public CSS resolution evidence is owned by the Web lane.');
  await page.goto('/components/file-uploader/web.html');
  const dropzone = page.locator('#dropzone');
  const expectedByTheme = {
    light: { background: 'rgb(250, 250, 250)', focus: 'rgb(47, 111, 237)' },
    dark: { background: 'rgb(9, 9, 11)', focus: 'rgb(141, 180, 255)' },
  };

  for (const [theme, expected] of Object.entries(expectedByTheme)) {
    await page.locator('html').evaluate((element, value) => element.setAttribute('data-vf-theme', value), theme);
    await expect(dropzone).toHaveCSS('background-color', expected.background);
    await dropzone.focus();
    await expect(dropzone).toHaveCSS('outline-width', '2px');
    await expect(dropzone).toHaveCSS('outline-color', expected.focus);
  }
});

test.describe('STD-12 upload/import recovery workflow', () => {
  test.skip(port !== 'react', 'The complete import workflow is intentionally bounded to the React public entrypoint and an application-owned deterministic service.');

  test('selection is local, progress stays truthful across transfer and processing, and routine status keeps focus stable', async ({ page }) => {
    await page.goto('/components/file-uploader/react.html');
    const input = page.getByLabel('Choose import file');
    const start = page.getByRole('button', { name: 'Import', exact: true });

    await input.setInputFiles({ name: 'records.csv', mimeType: 'text/csv', buffer: Buffer.from('name\nAtlas') });
    await expect(page.getByText('records.csv')).toBeVisible();
    await expect(page.getByRole('status')).toHaveText('1 file selected. Import has not started.');
    await expect(page.locator('body')).toHaveAttribute('data-import-attempts', '0');

    await start.focus();
    await start.click();
    await expect(start).toHaveAttribute('aria-busy', 'true');
    await expect(start).not.toBeDisabled();
    await expect(start).toBeFocused();
    await expect(page.locator('body')).toHaveAttribute('data-import-attempts', '1');
    const progress = page.getByRole('progressbar', { name: 'Import progress' });
    await expect(progress).not.toHaveAttribute('value');

    await emit(page, 1, { type: 'transfer', sent: 25, total: 100 });
    await expect(progress).toHaveAttribute('value', '25');
    await expect(progress).toHaveAttribute('max', '100');
    await expect(page.getByRole('status')).toHaveText('Transferring 25 of 100 bytes.');
    await expect(start).toBeFocused();

    await emit(page, 1, { type: 'processing' });
    await expect(progress).not.toHaveAttribute('value');
    await expect(page.getByRole('status')).toContainText('Processing records');
    await expect(start).toBeFocused();
    await expect(page.getByText('records.csv')).toBeVisible();
  });

  test('cancellation remains a request until acknowledgement and completion can win the race', async ({ page }) => {
    await page.goto('/components/file-uploader/react.html');
    await selectFile(page);
    const start = page.getByRole('button', { name: 'Import', exact: true });
    const cancel = page.getByRole('button', { name: 'Cancel import', exact: true });

    await start.click();
    await cancel.focus();
    await cancel.click();
    await expect(page.getByRole('status')).toHaveText('Cancellation requested. Waiting for authoritative outcome.');
    await expect(cancel).toBeFocused();
    await emit(page, 1, { type: 'completed' });
    await expect(page.getByRole('status')).toHaveText('Import completed authoritatively.');

    await selectFile(page);
    await start.click();
    await cancel.click();
    await emit(page, 2, { type: 'cancelled' });
    await expect(page.getByRole('status')).toHaveText('Import cancelled after the service acknowledged cancellation.');
    await expect(page.getByText('records.csv')).toBeVisible();
  });

  test('unknown outcomes retry as new attempts and stale completions cannot replace newer intent', async ({ page }) => {
    await page.goto('/components/file-uploader/react.html');
    await selectFile(page);
    await page.getByRole('button', { name: 'Import', exact: true }).click();
    await emit(page, 1, { type: 'unknown' });
    await expect(page.getByRole('status')).toContainText('outcome is unknown');

    await page.getByRole('button', { name: 'Retry unresolved', exact: true }).click();
    await expect(page.locator('body')).toHaveAttribute('data-import-attempts', '2');
    await expect(page.locator('body')).toHaveAttribute('data-last-import-scope', 'all');
    await expect(page.getByRole('status')).toContainText('Import attempt 2 started');

    await emit(page, 1, { type: 'completed' });
    await expect(page.getByRole('status')).toContainText('Import attempt 2 started');
    await emit(page, 2, { type: 'completed' });
    await expect(page.getByRole('status')).toHaveText('Import completed authoritatively.');
  });

  test('duplicate activation is bounded and partial completion retries only unresolved records', async ({ page }) => {
    await page.goto('/components/file-uploader/react.html');
    await selectFile(page);
    const start = page.getByRole('button', { name: 'Import', exact: true });
    await start.dblclick();
    await expect(page.locator('body')).toHaveAttribute('data-import-attempts', '1');

    await emit(page, 1, { type: 'partial' });
    await expect(page.getByRole('status')).toHaveText('2 records imported. 1 failed. 1 outcome is unknown.');
    await expect(page.getByRole('list', { name: 'Import results' })).toContainText('Atlas: imported');
    await expect(page.getByRole('list', { name: 'Import results' })).toContainText('Cedar: failed');
    await expect(page.getByRole('list', { name: 'Import results' })).toContainText('Delta: outcome unknown');

    await page.getByRole('button', { name: 'Retry unresolved', exact: true }).click();
    await expect(page.locator('body')).toHaveAttribute('data-import-attempts', '2');
    await expect(page.locator('body')).toHaveAttribute('data-last-import-scope', 'failed-record,unknown-record');
    const attempts = await page.evaluate(() => globalThis.__vfImportService.attempts());
    expect(attempts).toEqual([
      { id: 1, scope: ['all'] },
      { id: 2, scope: ['failed-record', 'unknown-record'] },
    ]);
    await expect(page.getByText('records.csv')).toBeVisible();
    expect((await expectNoAxeViolations(page)).violations).toEqual([]);
  });
});
