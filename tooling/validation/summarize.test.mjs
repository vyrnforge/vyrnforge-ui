import { strict as assert } from 'node:assert';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'vitest';

const script = path.resolve('tooling/validation/summarize.mjs');

function plan(overrides = {}) {
  return {
    mode: 'pr',
    changedPaths: ['packages/react/src/components/button/index.ts'],
    components: ['button'],
    packages: ['react'],
    ownedUnits: [],
    browserScopes: [{ port: 'react', components: ['button'] }],
    packageArtifactPackages: [],
    repositoryWide: false,
    unknownPaths: [],
    validationScopes: [
      { scope: 'architecture', selected: true, because: 'repository invariants are always validated' },
      { scope: 'browser-behavior', selected: true, owner: 'react', because: 'react/button requires browser evidence' },
      { scope: 'package-public-entrypoint', selected: false, because: 'not selected for this impact' },
    ],
    executionPrerequisites: ['dependencies', 'browser-runtime:chromium', 'build:react', 'fixture:react:button'],
    selectors: {
      packageArtifactsRequired: false,
      browserRequired: true,
      docsRequired: false,
      releaseRequired: false,
    },
    ...overrides,
  };
}

function withTemp(callback) {
  const directory = mkdtempSync(path.join(tmpdir(), 'vf-validation-summary-'));
  try { return callback(directory); }
  finally { rmSync(directory, { recursive: true, force: true }); }
}

function passingEnvironment(head = 'abc123') {
  return {
    ...process.env,
    VF_HEAD_SHA: head,
    VF_RESULT_AFFECTED: 'success',
    VF_RESULT_PACKAGES: 'skipped',
    VF_RESULT_RELEASE: 'skipped',
    VF_RESULT_DOCS: 'skipped',
    VF_RESULT_BROWSER: 'success',
  };
}

test('summary records selected and skipped evidence without inventing package validation', () => withTemp((directory) => {
  const planPath = path.join(directory, 'plan.json');
  const outputDir = path.join(directory, 'out');
  writeFileSync(planPath, `${JSON.stringify(plan(), null, 2)}\n`);
  execFileSync(process.execPath, [script, '--plan', planPath, '--output-dir', outputDir], {
    env: passingEnvironment(),
    stdio: 'pipe',
  });
  const report = JSON.parse(readFileSync(path.join(outputDir, 'validation-summary.json'), 'utf8'));
  assert.equal(report.result, 'pass');
  assert.equal(report.schemaVersion, 2);
  assert.equal(report.revision, 'abc123');
  assert.deepEqual(report.productImpact.browserScopes, [{ port: 'react', components: ['button'] }]);
  assert.equal(report.validation.evidence.find((item) => item.id === 'browser').disposition, 'pass');
  assert.equal(report.validation.evidence.find((item) => item.id === 'package-artifacts').disposition, 'not-selected');
  assert.deepEqual(report.validation.executionMetrics, []);
  assert.ok(readFileSync(path.join(outputDir, 'validation-summary.md'), 'utf8').includes('Relevant skipped scopes'));
}));

test('summary retains executor timing and cache reuse metrics', () => withTemp((directory) => {
  const planPath = path.join(directory, 'plan.json');
  const outputDir = path.join(directory, 'out');
  const metricsDir = path.join(directory, 'metrics');
  mkdirSync(metricsDir);
  writeFileSync(planPath, `${JSON.stringify(plan(), null, 2)}\n`);
  writeFileSync(path.join(metricsDir, 'browser-prerequisites.json'), `${JSON.stringify({
    schemaVersion: 1,
    scope: 'browser-prerequisites',
    revision: 'abc123',
    browserProfile: 'chromium',
    metrics: [
      { name: 'browser-runtime', durationSeconds: 18, result: 'success', cacheHit: false },
      { name: 'build-prerequisite', durationSeconds: 22, result: 'success', reused: false },
    ],
  })}\n`);
  writeFileSync(path.join(metricsDir, 'browser-react.json'), `${JSON.stringify({
    schemaVersion: 1,
    scope: 'browser-port',
    revision: 'abc123',
    port: 'react',
    components: ['button'],
    cache: { browserRuntimeHit: true, buildArtifactRestored: true },
    metrics: [
      { name: 'browser-runner-dependencies', durationSeconds: 8, result: 'success' },
      { name: 'build-artifact-restore', durationSeconds: 3, result: 'success' },
      { name: 'browser-test', durationSeconds: 41, result: 'success' },
    ],
  })}\n`);

  execFileSync(process.execPath, [script, '--plan', planPath, '--metrics-dir', metricsDir, '--output-dir', outputDir], {
    env: passingEnvironment(),
    stdio: 'pipe',
  });
  const report = JSON.parse(readFileSync(path.join(outputDir, 'validation-summary.json'), 'utf8'));
  assert.equal(report.validation.executionMetrics.length, 2);
  assert.equal(report.validation.executionMetrics.find((item) => item.port === 'react').cache.buildArtifactRestored, true);
  const markdown = readFileSync(path.join(outputDir, 'validation-summary.md'), 'utf8');
  assert.ok(markdown.includes('Execution timing'));
  assert.ok(markdown.includes('browser-test'));
  assert.ok(markdown.includes('exact-revision build artifact restored'));
}));

test('summary rejects executor metrics from a different revision', () => withTemp((directory) => {
  const planPath = path.join(directory, 'plan.json');
  const outputDir = path.join(directory, 'out');
  const metricsDir = path.join(directory, 'metrics');
  mkdirSync(metricsDir);
  writeFileSync(planPath, `${JSON.stringify(plan(), null, 2)}\n`);
  writeFileSync(path.join(metricsDir, 'browser-react.json'), `${JSON.stringify({
    schemaVersion: 1,
    scope: 'browser-port',
    revision: 'wrong-revision',
    port: 'react',
    metrics: [{ name: 'browser-test', durationSeconds: 10, result: 'success' }],
  })}\n`);
  const result = spawnSync(process.execPath, [script, '--plan', planPath, '--metrics-dir', metricsDir, '--output-dir', outputDir], {
    env: passingEnvironment('expected-revision'),
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /validation metrics revision mismatch/);
}));

test('summary is still written and exits non-zero when required evidence fails', () => withTemp((directory) => {
  const planPath = path.join(directory, 'plan.json');
  const outputDir = path.join(directory, 'out');
  writeFileSync(planPath, `${JSON.stringify(plan(), null, 2)}\n`);
  const result = spawnSync(process.execPath, [script, '--plan', planPath, '--output-dir', outputDir], {
    env: {
      ...passingEnvironment('def456'),
      VF_RESULT_BROWSER: 'failure',
    },
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  const report = JSON.parse(readFileSync(path.join(outputDir, 'validation-summary.json'), 'utf8'));
  assert.equal(report.result, 'fail');
  assert.equal(report.validation.evidence.find((item) => item.id === 'browser').disposition, 'fail');
}));
