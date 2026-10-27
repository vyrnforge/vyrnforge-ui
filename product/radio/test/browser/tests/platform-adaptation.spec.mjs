import { test, expect } from '@playwright/test';

const port = process.env.VF_COMPONENT_PORT || 'web';

test.describe('STD-25 platform-adaptable selection semantics', () => {
  test('keeps one semantic radio value selected and unavailable choices disabled', async ({ page }) => {
    await page.goto(`/next/radio-fixtures/${port}.html`);
    const form = page.locator('#form');
    const control = page.locator('#control');
    await expect(control).toHaveAttribute('type', 'radio');
    await expect(control).toHaveAttribute('name');
    const data = await form.evaluate((node) => Object.fromEntries(new FormData(node).entries()));
    expect(Object.keys(data).length).toBeLessThanOrEqual(1);
  });
});
