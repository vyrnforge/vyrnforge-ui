import { test } from 'vitest';
import assert from 'node:assert/strict';
import { loadNativeControlContract, validateNativeControlContract } from './native-control-contract.mjs';

test('native-control contract validation requires only shared semantic fields', () => {
  const contract = { id: 'example', semantics: { tag: 'INPUT', type: 'text' } };
  assert.equal(validateNativeControlContract(contract, 'example'), contract);
});

test('native-control contract validation does not require framework grammar', () => {
  assert.doesNotThrow(() => validateNativeControlContract({ id: 'example', semantics: { tag: 'BUTTON' } }, 'example'));
});

test('native-control contract validation accepts shared browser metadata', () => {
  const assertBrowser = async () => {};
  const contract = { id: 'example', semantics: { tag: 'INPUT' }, styleDependencies: ['button'], reducedMotion: true, assertBrowser };
  assert.equal(validateNativeControlContract(contract, 'example'), contract);
});

test('native-control contract validation rejects invalid shared metadata', () => {
  assert.throws(() => validateNativeControlContract({ id: 'wrong', semantics: { tag: 'INPUT' } }, 'example'), /contract with id example/);
  assert.throws(() => validateNativeControlContract({ id: 'example' }, 'example'), /semantics\.tag/);
  assert.throws(() => validateNativeControlContract({ id: 'example', semantics: { tag: 'INPUT' }, styleDependencies: 'button' }, 'example'), /styleDependencies must be an array/);
  assert.throws(() => validateNativeControlContract({ id: 'example', semantics: { tag: 'INPUT' }, assertBrowser: true }, 'example'), /assertBrowser must be a function/);
  assert.throws(() => validateNativeControlContract({ id: 'example', semantics: { tag: 'INPUT' }, reducedMotion: 'yes' }, 'example'), /reducedMotion must be a boolean/);
});

test('native control contract resolves layered unit metadata rather than a hard-coded legacy path', async () => {
  for (const id of ['link', 'checkbox', 'switch']) {
    const contract = await loadNativeControlContract(id);
    assert.equal(contract.id, id);
    assert.ok(contract.semantics.tag);
  }
});
