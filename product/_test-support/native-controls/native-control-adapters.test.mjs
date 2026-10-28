import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWebNativeControlContract } from './native-control-adapters/web.mjs';
import { validateReactNativeControlContract } from './native-control-adapters/react.mjs';
import { validateVueNativeControlContract } from './native-control-adapters/vue.mjs';
import { validateAngularNativeControlContract } from './native-control-adapters/angular.mjs';

test('web adapter owns web fixture grammar', () => {
  const contract = { markup: '<input id="control">', webConnector: 'connectInput' };
  assert.equal(validateWebNativeControlContract(contract, 'input'), contract);
  assert.throws(() => validateWebNativeControlContract({}, 'input'), /requires markup/);
  assert.throws(() => validateWebNativeControlContract({ markup: '<input>', webConnector: '' }, 'input'), /webConnector must be a non-empty string/);
  assert.throws(() => validateWebNativeControlContract({ markup: '<input>', webInlineScript: '' }, 'input'), /webInlineScript must be a non-empty string/);
  assert.throws(() => validateWebNativeControlContract({ markup: '<input>', webConnector: 'connectInput', webInlineScript: 'connect()' }, 'input'), /must not define both/);
});

test('react adapter owns React fixture grammar', () => {
  const contract = { exportName: 'Input', props: { name: 'control' }, hydrate: true };
  assert.equal(validateReactNativeControlContract(contract, 'input'), contract);
  assert.throws(() => validateReactNativeControlContract({}, 'input'), /requires exportName/);
  assert.throws(() => validateReactNativeControlContract({ exportName: 'Input', props: [] }, 'input'), /props must be an object/);
  assert.throws(() => validateReactNativeControlContract({ exportName: 'Input', select: 'yes' }, 'input'), /select must be a boolean/);
});

test('vue adapter owns Vue fixture grammar', () => {
  const contract = { exportName: 'NativeSelect', props: { defaultValue: 'two' }, select: true };
  assert.equal(validateVueNativeControlContract(contract, 'native-select'), contract);
  assert.throws(() => validateVueNativeControlContract({}, 'native-select'), /requires exportName/);
  assert.throws(() => validateVueNativeControlContract({ exportName: 'NativeSelect', props: null }, 'native-select'), /props must be an object/);
  assert.throws(() => validateVueNativeControlContract({ exportName: 'NativeSelect', label: 1 }, 'native-select'), /label must be a boolean/);
});

test('angular adapter owns Angular fixture grammar', () => {
  const contract = { angularName: 'VfInputDirective', angular: '<input vfInput>', hydrate: false };
  assert.equal(validateAngularNativeControlContract(contract, 'input'), contract);
  assert.throws(() => validateAngularNativeControlContract({ angular: '<input vfInput>' }, 'input'), /requires angularName/);
  assert.throws(() => validateAngularNativeControlContract({ angularName: 'VfInputDirective' }, 'input'), /requires angular template/);
  assert.throws(() => validateAngularNativeControlContract({ angularName: 'VfInputDirective', angular: '<input vfInput>', hydrate: 'yes' }, 'input'), /hydrate must be a boolean/);
});
