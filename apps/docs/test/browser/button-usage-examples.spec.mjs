import { test, expect } from '@playwright/test';

async function expectNoRuntimeErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return () => expect(errors, errors.join('\n')).toEqual([]);
}

test('every Button usage specimen exposes the executable code editor experience', async ({ page }) => {
  const verifyNoErrors = await expectNoRuntimeErrors(page);
  await page.goto('/next/components/button/');

  const examples = [
    ['button/basic', /@vyrnforge\/react\/button/, ['Save changes', 'Preview', 'Cancel']],
    ['button/variants', /variant="ghost"/, ['Primary', 'Secondary', 'Ghost']],
    ['button/sizes', /size="lg"/, ['Small', 'Medium', 'Large']],
    ['button/states', /loading/, ['Ready', 'Disabled', 'Loading', 'Loading and disabled']]
  ];

  for (const [id, sourceNeedle, previewLabels] of examples) {
    const playground = page.locator(`[data-vf-example-id="${id}"]`);
    const frame = page.frameLocator(`[data-vf-example-id="${id}"] iframe`);
    await expect(playground).toBeVisible();
    await expect(playground.getByRole('tab')).toHaveCount(4);
    await expect(playground.locator('iframe')).toHaveAttribute('sandbox', 'allow-scripts');

    const codeToggle = playground.locator('[data-vf-example-code-toggle]');
    await expect(codeToggle).toHaveAccessibleName('Show code');
    await expect(playground.locator('[data-vf-example-editor]')).toBeHidden();
    await codeToggle.click();
    await expect(codeToggle).toHaveAccessibleName('Hide code');

    const editor = playground.locator('[data-vf-example-editor]');
    await expect(editor).toBeVisible();
    await expect(editor).toHaveValue(sourceNeedle);
    await expect(playground.getByRole('button', { name: 'Run' })).toBeVisible();
    await expect(playground.getByRole('button', { name: 'Reset' })).toBeVisible();

    for (const label of previewLabels) {
      await expect(frame.getByRole('button', { name: label, exact: true })).toBeVisible();
    }
  }

  verifyNoErrors();
});
