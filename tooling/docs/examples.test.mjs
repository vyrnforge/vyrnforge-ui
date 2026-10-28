import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { runtimeResolveDirectory } from './examples.mjs';

test('editable-example runtimes resolve relative imports beside their source file', () => {
  const sourcePath = path.join('repo', 'product', 'app-shell', 'examples', 'item-management', 'react.tsx');
  assert.equal(
    runtimeResolveDirectory(sourcePath),
    path.join('repo', 'product', 'app-shell', 'examples', 'item-management'),
  );
});
