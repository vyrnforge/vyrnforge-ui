import { strict as assert } from 'node:assert';
import { test } from 'vitest';
import { createSemanticImpact } from './plan.mjs';

function hasReason(plan, scope) {
  return plan.reasons.some((reason) => reason.scope === scope);
}

test('Core collection navigation fans to discovered component/conformance consumers', () => {
  const impact = createSemanticImpact(['packages/core/src/capabilities/collection-navigation/index.ts']);
  assert.ok(impact.ownedUnits.includes('unit:core:capabilities:collection-navigation'));
  assert.ok(impact.packages.includes('core'));
  assert.ok(impact.components.includes('tabs'));
  for (const port of ['react', 'angular', 'vue', 'elements']) assert.ok(impact.browserPorts.includes(port));
  assert.equal(impact.selectors.browserRequired, true);
  assert.equal(impact.selectors.docsRequired, true);
  assert.equal(impact.orchestration, 'nx');
  assert.ok(hasReason(impact, 'unit:unit:core:capabilities:collection-navigation'));
  assert.ok(hasReason(impact, 'evidence:docs'));
});

test('React-only component implementation stays port-local while retaining Reference evidence', () => {
  const impact = createSemanticImpact(['packages/react/src/components/button/index.ts']);
  assert.deepEqual(impact.components, ['button']);
  assert.deepEqual(impact.browserPorts, ['react']);
  assert.ok(impact.packages.includes('react'));
  assert.equal(impact.browserPorts.includes('angular'), false);
  assert.equal(impact.browserPorts.includes('vue'), false);
  assert.equal(impact.selectors.packageArtifactsRequired, false);
  assert.equal(impact.selectors.docsRequired, true);
  assert.ok(hasReason(impact, 'evidence:docs'));
});

test('Reference evidence stays additive to generic package fallback classification', () => {
  const impact = createSemanticImpact(['packages/react/src/internal/example.ts']);
  assert.ok(impact.packages.includes('react'));
  assert.equal(impact.selectors.docsRequired, true);
  assert.equal(impact.selectors.browserRequired, true);
  assert.ok(impact.browserPorts.includes('react'));
  assert.ok(hasReason(impact, 'evidence:docs'));
  assert.ok(hasReason(impact, 'port:react'));
});

test('canonical Tabs evidence fans across every implemented Tabs surface', () => {
  const impact = createSemanticImpact(['product/tabs/accessibility.json']);
  assert.deepEqual(impact.components, ['tabs']);
  for (const port of ['web', 'react', 'angular', 'vue', 'elements']) assert.ok(impact.browserPorts.includes(port));
  assert.equal(impact.selectors.browserRequired, true);
});

test('Web component CSS selects only the component real ports plus visual and Reference evidence', () => {
  const impact = createSemanticImpact(['packages/web/src/components/button/button.css']);
  assert.deepEqual(impact.components, ['button']);
  assert.ok(impact.semanticEvidence.includes('visual'));
  assert.equal(impact.selectors.browserRequired, true);
  assert.equal(impact.selectors.docsRequired, true);
  assert.equal(impact.selectors.packageArtifactsRequired, false);
  assert.deepEqual(impact.browserPorts, ['web', 'react', 'angular', 'vue']);
  assert.equal(impact.browserPorts.includes('elements'), false);
});

test('package manifest changes select packed API, consumer, and Reference validation', () => {
  const impact = createSemanticImpact(['packages/react/package.json']);
  assert.deepEqual(impact.packages, ['react']);
  assert.equal(impact.selectors.packageArtifactsRequired, true);
  assert.equal(impact.selectors.browserRequired, false);
  assert.equal(impact.selectors.docsRequired, true);
  assert.ok(hasReason(impact, 'package:react'));
  assert.ok(hasReason(impact, 'evidence:docs'));
});

test('semantic token changes fan to Web-backed consumers and visual evidence', () => {
  const impact = createSemanticImpact(['packages/web/src/styles/tokens.css']);
  assert.ok(impact.components.includes('button'));
  assert.ok(impact.components.includes('tabs'));
  assert.ok(impact.semanticEvidence.includes('visual'));
  assert.equal(impact.selectors.browserRequired, true);
  assert.equal(impact.selectors.docsRequired, true);
  assert.equal(impact.selectors.packageArtifactsRequired, false);
  for (const port of ['web', 'react', 'angular', 'vue', 'elements']) assert.ok(impact.browserPorts.includes(port));
});

test('impact infrastructure validates itself and broadens conservatively', () => {
  const impact = createSemanticImpact(['tooling/impact/plan.mjs']);
  assert.equal(impact.repositoryWide, true);
  assert.ok(impact.semanticEvidence.includes('impact'));
  assert.equal(impact.selectors.packageArtifactsRequired, true);
  assert.equal(impact.selectors.browserRequired, true);
  assert.equal(impact.selectors.docsRequired, true);
  assert.equal(impact.selectors.releaseRequired, true);
  assert.equal(impact.orchestration, 'nx');
});

test('unknown paths fail closed to broad evidence', () => {
  const impact = createSemanticImpact(['mystery/new-root.txt']);
  assert.deepEqual(impact.unknownPaths, ['mystery/new-root.txt']);
  assert.equal(impact.repositoryWide, true);
  assert.equal(impact.selectors.packageArtifactsRequired, true);
  assert.equal(impact.selectors.browserRequired, true);
  assert.equal(impact.selectors.docsRequired, true);
  assert.equal(impact.selectors.releaseRequired, true);
});

test('scheduled and release modes are explicit broad safety nets without a second task graph', () => {
  for (const mode of ['scheduled', 'release']) {
    const impact = createSemanticImpact([], { mode });
    assert.equal(impact.mode, mode);
    assert.equal(impact.repositoryWide, true);
    assert.equal(impact.orchestration, 'nx');
    assert.equal(impact.selectors.packageArtifactsRequired, true);
    assert.equal(impact.selectors.browserRequired, true);
    assert.equal(impact.selectors.docsRequired, true);
    assert.equal(impact.selectors.releaseRequired, true);
  }
});

test('Changesets select release-intent evidence without fabricating package/browser/docs impact', () => {
  const impact = createSemanticImpact(['.changeset/example.md']);
  assert.equal(impact.selectors.releaseRequired, true);
  assert.equal(impact.selectors.packageArtifactsRequired, false);
  assert.equal(impact.selectors.browserRequired, false);
  assert.equal(impact.selectors.docsRequired, false);
  assert.equal(impact.repositoryWide, false);
});

test('archived legacy package changes do not request current Reference evidence', () => {
  const impact = createSemanticImpact(['packages/legacy/archive/root/package-lock.json']);
  assert.equal(impact.selectors.docsRequired, false);
  assert.equal(impact.repositoryWide, false);
});
