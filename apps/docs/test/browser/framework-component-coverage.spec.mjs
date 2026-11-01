import { expect, test } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { documentationCoverage, documentationFrameworkSurfaces } from '../../documentation-coverage.mjs';

const root = path.resolve(fileURLToPath(new URL('../../../../', import.meta.url)));
const coverage = documentationCoverage(root);
if (coverage.problems.length) throw new Error(coverage.problems.join('\n'));

for (const cell of coverage.cells) {
  test(`${cell.component} publishes complete ${cell.framework} framework documentation`, async ({ page }) => {
    await page.goto(`/next/${cell.framework}/components/${cell.component}/`);

    await expect(page.locator(`[data-vf-framework-adaptation="${cell.framework}"]`)).toBeVisible();
    await expect(page.locator('[data-vf-example-unavailable]')).toHaveCount(0);

    const example = page.locator('[data-vf-example-id]').first();
    await expect(example).toBeVisible();
    await expect(example).toHaveAttribute('data-vf-example-locked-framework', cell.framework);
    await expect(example.locator('[data-vf-example-frame]')).toHaveAttribute('sandbox', 'allow-scripts');
  });
}

const allFrameworks = Object.keys(documentationFrameworkSurfaces);
const canonicalComponents = [...new Set(coverage.cells.map((cell) => cell.component))];
for (const component of canonicalComponents) {
  const supported = new Set(coverage.cells.filter((cell) => cell.component === component).map((cell) => cell.framework));
  for (const framework of allFrameworks.filter((candidate) => !supported.has(candidate))) {
    test(`${component} keeps unsupported ${framework} explicit`, async ({ page }) => {
      await page.goto(`/next/${framework}/components/${component}/`);
      await expect(page.locator(`[data-vf-framework-unavailable="${framework}"]`)).toBeVisible();
      await expect(page.locator('[data-vf-framework-adaptation]')).toHaveCount(0);
    });
  }
}
