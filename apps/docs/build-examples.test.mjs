import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'vitest';
import { importAnalysis, runtimeResolveDirectory } from './build-examples.mjs';

test('editable-example runtimes resolve relative imports beside their source file', () => {
  const sourcePath = path.join('repo', 'product', 'app-shell', 'examples', 'item-management', 'react.tsx');
  assert.equal(
    runtimeResolveDirectory(sourcePath),
    path.join('repo', 'product', 'app-shell', 'examples', 'item-management'),
  );
});

test('editable-example runtime analysis excludes type-only bindings', () => {
  const analysis = importAnalysis(`
import * as React from 'react';
import type { FormEvent } from 'react';
import { useId, type ChangeEvent } from 'react';
import './example.css';
`);

  assert.deepEqual(analysis.bindings, ['React', 'useId']);
  assert.deepEqual(analysis.imports, ['react', './example.css']);
  assert.equal(analysis.statements.some((statement) => statement.includes('import type')), false);
  assert.equal(analysis.statements.some((statement) => statement.includes('type ChangeEvent')), true);
});
