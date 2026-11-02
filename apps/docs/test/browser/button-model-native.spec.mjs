import { test, expect } from '@playwright/test';

for (const framework of ['react', 'angular', 'vue']) {
  test(`Button ${framework} view renders structured content without a mainHtml payload`, async ({ page }) => {
    await page.goto(`/next/${framework}/components/button/`);

    const pageModelSource = await page.locator('#vf-docs-page-model').textContent();
    const pageModel = JSON.parse(pageModelSource || '{}');
    expect(pageModel.mainHtml).toBeUndefined();
    expect(pageModel.mainContent?.format).toBe('vyrnforge.docs.content.v1');
    expect(pageModel.mainContent?.framework).toBe(framework);
    expect(pageModel.mainContent?.pageTitle).toBe('Button');

    const shell = page.locator(`[data-vf-app-shell][data-vf-docs-renderer="${framework}"]`);
    await expect(shell).toHaveCount(1);
    await expect(shell.getByRole('heading', { level: 1, name: 'Button' })).toHaveAttribute('data-vf-text', '');

    const playground = shell.locator('[data-vf-example-id="button/basic"]');
    await expect(playground).toHaveAttribute('data-vf-surface', '');
    await expect(playground.locator('[data-vf-example-code-toggle]')).toHaveAttribute('data-vf-button', '');
    await playground.locator('[data-vf-example-code-toggle]').click();
    await expect(playground.getByRole('textbox', { name: 'Basic button code editor' })).toHaveAttribute('data-vf-textarea', '');
  });
}

test('Button Native Web view is generated from the semantic model without a framework app payload', async ({ page }) => {
  await page.goto('/next/native-web/components/button/');
  await expect(page.locator('#vf-docs-page-model')).toHaveCount(0);
  await expect(page.locator('[data-vf-app-shell][data-vf-docs-renderer="native-web"]')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1, name: 'Button' })).toHaveAttribute('data-vf-text', '');
  await expect(page.locator('[data-vf-framework-adaptation="native-web"]')).toHaveCount(1);
  await expect(page.locator('[data-vf-example-id="button/basic"] [data-vf-button]')).toHaveCount(3);
});
