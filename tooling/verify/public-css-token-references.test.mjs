import assert from 'node:assert/strict';
import test from 'node:test';
import {
  extractDeclaredPublicTokens,
  findUndefinedPublicTokenReferences,
} from './public-css-token-references.mjs';

test('accepts references declared by the public token contract', () => {
  const declared = extractDeclaredPublicTokens(':root { --vf-color-surface: #fff; --vf-space-sm: 0.5rem; }');
  assert.deepEqual(
    findUndefinedPublicTokenReferences('.surface { background: var(--vf-color-surface); padding: var(--vf-space-sm); }', declared),
    [],
  );
});

test('reports intentionally undefined public token references', () => {
  const declared = extractDeclaredPublicTokens(':root { --vf-color-surface: #fff; }');
  assert.deepEqual(
    findUndefinedPublicTokenReferences('.surface { color: var(--vf-color-does-not-exist); }', declared),
    ['--vf-color-does-not-exist'],
  );
});

test('ignores private component custom properties', () => {
  const declared = extractDeclaredPublicTokens(':root { --vf-color-surface: #fff; }');
  assert.deepEqual(
    findUndefinedPublicTokenReferences('.surface { --_vf-local: var(--vf-color-surface); color: var(--_vf-local); }', declared),
    [],
  );
});
