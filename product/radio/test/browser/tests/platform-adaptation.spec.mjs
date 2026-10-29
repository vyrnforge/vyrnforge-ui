import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const port = process.env.VF_COMPONENT_PORT || 'web';

async function openPlatformFixture(page) {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto(`/components/radio/platform-${port}.html`);
  try {
    await expect(page.getByRole('status')).toHaveText('Not confirmed.', { timeout: 3000 });
  } catch {
    const body = await page.locator('body').innerText();
    throw new Error(`Platform fixture did not mount for ${port}. pageErrors=${JSON.stringify(pageErrors)} body=${JSON.stringify(body)}`);
  }
}

test.describe('STD-25 platform-adaptable selection and confirmation', () => {
  test('preserves semantic values while selection stays staged until confirmation', async ({ page }) => {
    await openPlatformFixture(page);

    const standard = page.getByLabel('Standard');
    const express = page.getByLabel('Express');
    const unavailable = page.getByLabel('Same day — unavailable');
    const status = page.getByRole('status');

    await expect(standard).toBeChecked();
    await expect(express).not.toBeChecked();
    await expect(unavailable).toBeDisabled();
    await expect(standard).toHaveAttribute('name', 'deliverySpeed');
    await expect(express).toHaveAttribute('name', 'deliverySpeed');

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
    await openPlatformFixture(page);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
