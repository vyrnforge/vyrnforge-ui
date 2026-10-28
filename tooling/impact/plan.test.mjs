import { strict as assert } from 'node:assert';
import { test } from 'vitest';
import { createSemanticImpact } from './plan.mjs';

test('component changes retain VyrnForge semantic ownership without scheduling work', () => {
  const impact = createSemanticImpact([
    'packages/react/src/components/button/index.ts',
    'product/button/test/browser/tests/button.spec.mjs',
  ]);
  assert.deepEqual(impact.components, ['button']);
  assert.deepEqual(impact.packages, ['react']);
  assert.equal(impact.repositoryWide, false);
  assert.equal(impact.orchestration, 'nx');
  assert.ok(impact.semanticEvidence.includes('browser'));
  assert.ok(impact.semanticEvidence.includes('package-artifacts'));
});

test('shared tooling changes broaden semantic evidence but never create a second task graph', () => {
  const impact = createSemanticImpact(['nx.json', 'tooling/verify/package-artifacts.mjs']);
  assert.equal(impact.repositoryWide, true);
  assert.deepEqual(impact.semanticEvidence, ['architecture', 'browser', 'docs', 'package-artifacts']);
  assert.equal(impact.orchestration, 'nx');
});
