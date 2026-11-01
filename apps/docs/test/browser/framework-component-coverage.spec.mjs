import { expect, test } from '@playwright/test';

const coverage = {
  button: ['native-web', 'react', 'angular', 'vue'],
  dialog: ['native-web', 'react', 'angular', 'vue', 'elements'],
  icon: ['native-web', 'react', 'angular', 'vue', 'elements'],
  tabs: ['native-web', 'react', 'angular', 'vue', 'elements'],
};

for (const [component, frameworks] of Object.entries(coverage)) {
  for (const framework of frameworks) {
    test(`${component} publishes complete ${framework} framework documentation`, async ({ page }) => {
      await page.goto(`/next/${framework}/components/${component}/`);

      await expect(page.locator(`[data-vf-framework-adaptation="${framework}"]`)).toBeVisible();
      await expect(page.locator('[data-vf-example-unavailable]')).toHaveCount(0);

      const example = page.locator(`[data-vf-example-id="${component}/basic"]`);
      await expect(example).toBeVisible();
      await expect(example).toHaveAttribute('data-vf-example-locked-framework', framework);
      await expect(example.locator('[data-vf-example-frame]')).toHaveAttribute('sandbox', 'allow-scripts');
    });
  }
}

test('unsupported Button Elements remains explicit', async ({ page }) => {
  await page.goto('/next/elements/components/button/');
  await expect(page.locator('[data-vf-framework-unavailable="elements"]')).toBeVisible();
  await expect(page.locator('[data-vf-framework-adaptation]')).toHaveCount(0);
});
