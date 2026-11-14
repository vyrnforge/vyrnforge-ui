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
