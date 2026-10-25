import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { browserProjectsForExecution, createExecutionPlan, expandScopes, runExecutionPlan } from './executor.mjs';
import { managedPlaywrightConfigSource } from '../testing/component-browser-runtime.mjs';

function tempRoot() { return mkdtempSync(path.join(os.tmpdir(), 'vf-impact-executor-')); }
function write(root, relativePath, content = '') { const target = path.join(root, relativePath); mkdirSync(path.dirname(target), { recursive: true }); writeFileSync(target, content); }

test('scope dependency closure stays ordered and carries prerequisite reasons', () => {
  const execution = expandScopes(['pack-react']);
  assert.deepEqual(execution.map((item) => item.scope), ['lint-core', 'build-core', 'lint-web', 'build-web', 'lint-react', 'build-react', 'pack-core', 'pack-web', 'pack-react']);
  assert.deepEqual(execution.find((item) => item.scope === 'build-core').requiredBy, ['build-web', 'build-react']);
  assert.deepEqual(execution.find((item) => item.scope === 'lint-core').requiredBy, ['build-core']);
});

test('component browser evidence pulls the required package builds and shared browser server', () => {
  const execution = expandScopes(['component:button:react:browser']);
  const scopes = execution.map((item) => item.scope);
  assert.ok(scopes.includes('build-core'));
  assert.ok(scopes.includes('build-web'));
  assert.ok(scopes.includes('build-react'));
  assert.ok(scopes.includes('component-browser-server'));
  assert.ok(scopes.includes('component:button:react:browser'));
  assert.deepEqual(execution.find((item) => item.scope === 'component-browser-server').requiredBy, ['component:button:react:browser']);
});

test('browser setup is deduplicated to the widest selected browser matrix', () => {
  const chromium = expandScopes(['component:button:react:browser', 'component:button:vue:browser']);
  assert.deepEqual(browserProjectsForExecution(chromium), ['chromium']);
  const cross = expandScopes(['component:button:web:browser-cross', 'component:button:react:browser']);
  assert.deepEqual(browserProjectsForExecution(cross), ['chromium', 'firefox', 'webkit']);
  assert.deepEqual(browserProjectsForExecution(expandScopes(['pack-core'])), []);
});

test('managed component browser config preserves the original config while leaving server ownership to the executor', () => {
  const source = managedPlaywrightConfigSource('playwright.config.mjs');
  assert.match(source, /import config from "\.\/playwright\.config\.mjs"/);
  assert.match(source, /webServer: undefined/);
  assert.doesNotMatch(source, /reuseExistingServer/);
  assert.match(source, /export default \{ \.\.\.config, webServer: undefined \}/);
});

test('change rendering depends on fragment validation', () => {
  const execution = expandScopes(['changes-preview']);
  assert.deepEqual(execution.map((item) => item.scope), ['change-fragments', 'changes-preview']);
  assert.deepEqual(execution.find((item) => item.scope === 'change-fragments').requiredBy, ['changes-preview']);
});

test('validation plans become inspectable execution plans with selection and prerequisite reasons', () => {
  const execution = createExecutionPlan({ validationScopes: ['structure', 'pack-core'], scopeReasons: { structure: ['global sentinel'], 'pack-core': ['evidence for package:core:public-surface'] } });
  assert.deepEqual(execution.map((item) => item.scope), ['structure', 'lint-core', 'build-core', 'pack-core']);
  assert.equal(execution[0].selectionReason, 'global sentinel');
  assert.match(execution[1].selectionReason, /prerequisite for build-core/);
  assert.equal(execution[3].selectionReason, 'evidence for package:core:public-surface');
});

test('execution writes one retained JSONL record per scope with outcome and duration', async () => {
  const root = tempRoot();
  write(root, 'package.json', JSON.stringify({ type: 'module' }));
  const execution = [{ scope: 'one', command: process.execPath, args: ['-e', 'process.stdout.write("ok")'], requiredBy: [], direct: true, selectionReason: 'selected by test' }];
  const result = await runExecutionPlan(execution, { root, mode: 'pr', telemetryFile: 'artifacts/validation-scopes.jsonl' });
  assert.equal(result.ok, true);
  const rows = readFileSync(path.join(root, 'artifacts/validation-scopes.jsonl'), 'utf8').trim().split('\n').map((line) => JSON.parse(line));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].scope, 'one');
  assert.equal(rows[0].outcome, 'success');
  assert.equal(rows[0].selectionReason, 'selected by test');
  assert.equal(typeof rows[0].durationMs, 'number');
});

test('execution records failures and stops after the failing scope', async () => {
  const root = tempRoot();
  write(root, 'package.json', JSON.stringify({ type: 'module' }));
  const execution = [
    { scope: 'fail', command: process.execPath, args: ['-e', 'process.exit(3)'], requiredBy: [], direct: true, selectionReason: 'selected by test' },
    { scope: 'later', command: process.execPath, args: ['-e', 'process.exit(0)'], requiredBy: [], direct: true, selectionReason: 'selected by test' },
  ];
  const result = await runExecutionPlan(execution, { root, mode: 'pr', telemetryFile: 'artifacts/validation-scopes.jsonl' });
  assert.equal(result.ok, false);
  assert.equal(result.failedScope, 'fail');
  const rows = readFileSync(path.join(root, 'artifacts/validation-scopes.jsonl'), 'utf8').trim().split('\n').map((line) => JSON.parse(line));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].scope, 'fail');
  assert.equal(rows[0].outcome, 'failure');
});
