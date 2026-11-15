import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

const root = fileURLToPath(new URL('../../', import.meta.url));

async function source(path) {
  return readFile(new URL(path, `file://${root}/`), 'utf8');
}

test('compound field implementations do not fabricate English accessible names', async () => {
  const colorPickerSources = await Promise.all(
    ['react', 'angular', 'vue'].map((port) =>
      source(`product/components/composite-widgets/compound-fields/color-picker/${port}/index.ts`),
    ),
  );
  for (const implementation of colorPickerSources) {
    assert.doesNotMatch(implementation, /Color value/);
  }

  const numberFieldSources = await Promise.all(
    ['react', 'angular', 'vue'].map((port) =>
      source(`product/components/composite-widgets/compound-fields/number-field/${port}/index.ts`),
    ),
  );
  for (const implementation of numberFieldSources) {
    assert.doesNotMatch(implementation, /Increase value|Decrease value/);
  }
});


test('L5 navigation and collection implementations do not fabricate English accessible names', async () => {
  const cases = [
    ['product/components/composite-widgets/commands-actions/split-button/react/index.ts', /aria-label[^\n]*More actions/],
    ['product/components/composite-widgets/commands-actions/split-button/vue/index.ts', /aria-label[^\n]*More actions/],
    ['product/components/composite-widgets/collection-selection/tag-group/react/index.ts', /label\s*=\s*['"]Remove['"]/],
    ['product/components/composite-widgets/collection-selection/tag-group/angular/index.ts', /input\(['"]Remove['"]\)/],
    ['product/components/composite-widgets/collection-selection/tag-group/vue/index.ts', /default\s*:\s*['"]Remove['"]/],
    ['product/components/composite-widgets/content-navigation/pagination/react/index.ts', /aria-label[^\n]*(?:Pagination|Previous page|Next page)/],
    ['product/components/composite-widgets/content-navigation/pagination/angular/index.ts', /aria-label[^\n]*(?:Pagination|Previous page|Next page)/],
    ['product/components/composite-widgets/content-navigation/pagination/vue/index.ts', /aria-label[^\n]*(?:Pagination|Previous page|Next page)/],
    ['product/components/composite-widgets/content-navigation/pagination/elements/index.ts', /aria-label[^\n]*Pagination/],
    ['product/components/composite-widgets/content-navigation/carousel/react/index.ts', /aria-label[^\n]*(?:Carousel|Previous slide|Next slide)|`Slide \$\{/],
    ['product/components/composite-widgets/content-navigation/carousel/angular/index.ts', /aria-label[^\n]*(?:Previous slide|Next slide)/],
    ['product/components/composite-widgets/content-navigation/carousel/vue/index.ts', /aria-label[^\n]*(?:Carousel|Previous slide|Next slide)/],
  ];
  for (const [path, pattern] of cases) {
    assert.doesNotMatch(await source(path), pattern, path);
  }
});
