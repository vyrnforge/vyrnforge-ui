import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  compileRuntimeTokenDefinitions,
  deprecatedTokenAlias,
  tokenLiteral,
  tokenReference,
} from './model.mjs';

const references = Object.freeze({
  color: Object.freeze({ blue: '#245edb' }),
  space: Object.freeze({ md: '1rem' }),
});
const referenceTypes = Object.freeze({ color: 'color', space: 'dimension' });

test('resolves a direct primitive alias deterministically', () => {
  const result = compileRuntimeTokenDefinitions({
    '--vf-accent': tokenReference('color', 'reference.color.blue'),
  }, { references, referenceTypes });

  assert.equal(result.values['--vf-accent'], '#245edb');
  assert.equal(result.cssValues['--vf-accent'], '#245edb');
});

test('resolves chained runtime aliases deterministically', () => {
  const result = compileRuntimeTokenDefinitions({
    '--vf-base': tokenReference('color', 'reference.color.blue'),
    '--vf-middle': tokenReference('color', 'runtime.--vf-base'),
    '--vf-leaf': tokenReference('color', 'runtime.--vf-middle'),
  }, { references, referenceTypes });

  assert.equal(result.values['--vf-leaf'], '#245edb');
  assert.equal(result.cssValues['--vf-leaf'], '#245edb');
});

test('rejects a missing reference with the affected chain', () => {
  assert.throws(() => compileRuntimeTokenDefinitions({
    '--vf-broken': tokenReference('color', 'reference.color.missing'),
  }, { references, referenceTypes }), /--vf-broken -> reference\.color\.missing/);
});

test('rejects incompatible token types', () => {
  assert.throws(() => compileRuntimeTokenDefinitions({
    '--vf-bad-space': tokenReference('color', 'reference.space.md'),
  }, { references, referenceTypes }), /Token type mismatch: --vf-bad-space \(color\) -> reference\.space\.md \(dimension\)/);
});

test('rejects circular runtime aliases and reports the cycle', () => {
  assert.throws(() => compileRuntimeTokenDefinitions({
    '--vf-a': tokenReference('color', 'runtime.--vf-b'),
    '--vf-b': tokenReference('color', 'runtime.--vf-c'),
    '--vf-c': tokenReference('color', 'runtime.--vf-a'),
  }, { references, referenceTypes }), /--vf-a -> --vf-b -> --vf-c -> --vf-a/);
});

test('emits deprecated public aliases as forwarding CSS variables', () => {
  const result = compileRuntimeTokenDefinitions({
    '--vf-new': tokenLiteral('color', '#245edb'),
    '--vf-old': deprecatedTokenAlias('color', '--vf-new', 'remove after the next approved breaking compatibility window'),
  }, { references, referenceTypes });

  assert.equal(result.values['--vf-old'], '#245edb');
  assert.equal(result.cssValues['--vf-old'], 'var(--vf-new)');
  assert.deepEqual(result.deprecations['--vf-old'], {
    replacement: '--vf-new',
    reviewTrigger: 'remove after the next approved breaking compatibility window',
  });
});

test('includes deprecated aliases in cycle validation', () => {
  assert.throws(() => compileRuntimeTokenDefinitions({
    '--vf-old': deprecatedTokenAlias('color', '--vf-new', 'review on breaking release'),
    '--vf-new': tokenReference('color', 'runtime.--vf-old'),
  }, { references, referenceTypes }), /--vf-old -> --vf-new -> --vf-old/);
});
