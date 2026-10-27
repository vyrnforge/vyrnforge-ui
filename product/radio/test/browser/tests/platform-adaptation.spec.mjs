import { test, expect } from '@playwright/test';
import axeCore from 'axe-core';

const port = process.env.VF_COMPONENT_PORT || 'web';

test.describe('STD-25 platform-adaptable selection and confirmation', () => {
  test('preserves semantic values while selection stays staged until confirmation', async ({ page }) => {
    await page.goto(`/next/radio-fixtures/platform-${port}.html`);

    const standard = page.getByLabel('Standard');
    const express = page.getByLabel('Express');
    const unavailable = page.getByLabel('Same day — unavailable');
    const status = page.getByRole('status');

    await expect(standard).toBeChecked();
    await expect(express).not.toBeChecked();
    await expect(unavailable).toBeDisabled();
    await expect(standard).toHaveAttribute('name', 'deliverySpeed');
    await expect(express).toHaveAttribute('name', 'deliverySpeed');
    await expect(status).toHaveText('Not confirmed.');

    await express.check();
    await expect(express).toBeChecked();
    await expect(standard).not.toBeChecked();
    await expect(status).toHaveText('Not confirmed.');

    const formData = await page.locator('form').evaluate((form) => Object.fromEntries(new FormData(form).entries()));
    expect(formData).toEqual({ deliverySpeed: 'express' });

    await page.getByRole('button', { name: 'Confirm delivery speed' }).click();
    await expect(status).toHaveText('Confirmed: express.');
  });

  test('has no automated accessibility violations in the representative state', async ({ page }) => {
    await page.goto(`/next/radio-fixtures/platform-${port}.html`);
    await page.addScriptTag({ content: axeCore.source });
    const results = await page.evaluate(async () => globalThis.axe.run(document));
    expect(results.violations).toEqual([]);
  });
});
