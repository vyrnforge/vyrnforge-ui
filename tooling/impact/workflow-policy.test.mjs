import { strict as assert } from 'node:assert';
import { test } from 'vitest';
import { createSemanticImpact } from './plan.mjs';

test('known shared validation workflows broaden deliberately without unknown fallback', () => {
  for (const file of [
    '.github/workflows/_targeted-validation.yml',
    '.github/workflows/_browser-validation.yml',
    '.github/workflows/ci.yml',
    '.github/workflows/main.yml',
    '.github/workflows/scheduled.yml',
    '.github/workflows/release.yml',
  ]) {
    const impact = createSemanticImpact([file]);
    assert.equal(impact.repositoryWide, true, file);
    assert.deepEqual(impact.unknownPaths, [], file);
    assert.equal(impact.selectors.browserRequired, true, file);
    assert.equal(impact.selectors.packageArtifactsRequired, true, file);
    assert.equal(impact.selectors.docsRequired, true, file);
    assert.equal(impact.selectors.releaseRequired, true, file);
  }
});
