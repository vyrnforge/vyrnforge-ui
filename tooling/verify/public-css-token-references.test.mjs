import assert from 'node:assert/strict';
import test from 'node:test';
import {
  compareUnresolvedReferencesToBaseline,
  extractDeclaredPublicVariables,
  findUndefinedPublicVariableReferences,
} from './public-css-token-references.mjs';

test('accepts references declared by the public CSS variable contract', () => {
  const declared = extractDeclaredPublicVariables(':root { --vf-color-surface: #fff; --vf-space-sm: 0.5rem; }');
  assert.deepEqual(
    findUndefinedPublicVariableReferences('.surface { background: var(--vf-color-surface); padding: var(--vf-space-sm); }', declared),
    [],
  );
});

test('reports intentionally undefined public variable references without a fallback', () => {
  const declared = extractDeclaredPublicVariables(':root { --vf-color-surface: #fff; }');
  assert.deepEqual(
    findUndefinedPublicVariableReferences('.surface { color: var(--vf-color-does-not-exist); }', declared),
    ['--vf-color-does-not-exist'],
  );
});

test('allows explicit fallback-safe public customization variables', () => {
  const declared = extractDeclaredPublicVariables(':root { --vf-color-surface: #fff; }');
  assert.deepEqual(
    findUndefinedPublicVariableReferences('.swatch { color: var(--vf-consumer-swatch, currentColor); }', declared),
    [],
  );
});

test('ignores private component custom properties', () => {
  const declared = extractDeclaredPublicVariables(':root { --vf-color-surface: #fff; }');
  assert.deepEqual(
    findUndefinedPublicVariableReferences('.surface { --_vf-local: var(--vf-color-surface); color: var(--_vf-local); }', declared),
    [],
  );
});

test('baseline comparison blocks new debt and identifies repaired debt', () => {
  assert.deepEqual(
    compareUnresolvedReferencesToBaseline(
      ['a.css: --vf-existing', 'b.css: --vf-new'],
      ['a.css: --vf-existing', 'c.css: --vf-repaired'],
    ),
    { introduced: ['b.css: --vf-new'], resolved: ['c.css: --vf-repaired'] },
  );
});
