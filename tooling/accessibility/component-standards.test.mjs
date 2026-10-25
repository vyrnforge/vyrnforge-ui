import test from 'node:test';
import assert from 'node:assert/strict';
import { loadComponentStandards, summarizeComponentStandards, unresolvedComponentStandard, validateComponentStandard } from './component-standards.mjs';

test('every discovered public component receives an accessibility classification', async () => {
  const { discovery, standards } = await loadComponentStandards();
  assert.equal(standards.length, discovery.components.length);
  assert.equal(new Set(standards.map((entry) => entry.component)).size, discovery.components.length);
  const summary = summarizeComponentStandards(standards);
  assert.equal(summary.mapped + summary.reviewRequired, summary.total);
  assert.ok(summary.mapped > 0);
});

test('unmapped discovered components fail closed to review-required', () => {
  const standard = unresolvedComponentStandard('fixture');
  assert.equal(standard.reviewStatus, 'review-required');
  assert.equal(standard.classificationSource, 'derived-placeholder');
  assert.equal(standard.wcag.status, 'review-required');
});

test('mapped records cannot hide unresolved accessibility fields', () => {
  const standard = { schemaVersion:1, component:'fixture', reviewStatus:'mapped', nativeBaseline:{kind:'native',reference:'button'}, wcag:{target:'2.2 AA',status:'mapped',criteria:['2.1.1']}, aria:{status:'not-applicable',apgPattern:null}, interaction:{keyboard:'native',focus:'native',directionality:'native'}, ownership:{library:['review-required'],consumer:['provide an accessible name']}, forms:{status:'native'}, visualAccessibility:{status:'shared-foundation'}, ssrHydration:{status:'native'}, evidence:{browser:'required',assistiveTechnology:'not-applicable'}, profileVariability:[], notes:[] };
  assert.throws(() => validateComponentStandard(standard, 'fixture'), /cannot contain review-required/);
});
