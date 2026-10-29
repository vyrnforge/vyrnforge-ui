import { test } from 'vitest';
import assert from 'node:assert/strict';
import { renderRuntimeTokens } from './render.mjs';
import { runtimeTokenCompilation } from './source.mjs';

test('preserves current light, dark, and system runtime output semantics', () => {
  const css = renderRuntimeTokens();

  assert.match(css, /:root,\n  \[data-vf-theme="light"\]/);
  assert.match(css, /--vf-color-accent-background: #245edb;/);
  assert.match(css, /--vf-color-border-required: #71717a;/);
  assert.match(css, /--vf-font-family-display: var\(--vf-font-family-sans\);/);
  assert.match(css, /\[data-vf-theme="dark"\][\s\S]*--vf-color-accent-background: #8db4ff;/);
  assert.match(css, /\[data-vf-theme="dark"\][\s\S]*--vf-color-border-required: #a1a1aa;/);
  assert.match(css, /\[data-vf-theme="system"\]/);
  assert.match(css, /@media \(prefers-color-scheme: dark\)/);
});

test('runtime CSS aliases preserve a validated authoring relationship', () => {
  assert.equal(runtimeTokenCompilation.values['--vf-font-family-display'], runtimeTokenCompilation.values['--vf-font-family-sans']);
  assert.equal(runtimeTokenCompilation.cssValues['--vf-font-family-display'], 'var(--vf-font-family-sans)');
  assert.equal(runtimeTokenCompilation.values['--vf-control-font-weight'], runtimeTokenCompilation.values['--vf-font-weight-semibold']);
  assert.equal(runtimeTokenCompilation.cssValues['--vf-control-font-weight'], 'var(--vf-font-weight-semibold)');
});
