import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const root = new URL('../../../../', import.meta.url);
test('transitional floating positioning and dismissal entrypoints are retired', async () => {
  const manifest = JSON.parse(await readFile(new URL('packages/web/package.json', root), 'utf8'));
  assert.equal(manifest.exports['./floating-positioning'], undefined);
  assert.equal(manifest.exports['./dismissal-coordination'], undefined);
  for (const path of [
    'packages/react/src/internal/floating-surface.ts',
    'packages/vue/src/internal/floating-surface.ts',
    'packages/web/src/transitional/anchored-surface/floating-positioning/index.ts',
    'packages/web/src/transitional/anchored-surface/dismissal-coordination/index.ts',
  ]) {
    await assert.rejects(access(new URL(path, root)), { code: 'ENOENT' });
  }
  const runtime = await import('@vyrnforge/web');
  assert.equal('computeFloatingPosition' in runtime, false);
  assert.equal('createDismissalCoordinator' in runtime, false);
});
