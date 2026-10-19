import test from 'node:test';
import assert from 'node:assert/strict';
import { categoryForRun, planRunDeletions } from '../actions/retention.mjs';

const now = new Date('2026-10-19T03:00:00Z');
const policy = {
  minimumRunsPerWorkflow: 2,
  minimumSuccessfulRunsPerWorkflow: 1,
  maxDeletionsPerRun: 2,
  categories: {
    pr: { successDays: 30, nonSuccessDays: 7 },
    release: { successDays: 365, nonSuccessDays: 90 },
    unknown: { successDays: 30, nonSuccessDays: 7 }
  }
};

function run(id, { days = 40, conclusion = 'success', workflow = 1, path = '.github/workflows/ci.yml', status = 'completed' } = {}) {
  const updated = new Date(now.getTime() - days * 86_400_000).toISOString();
  return {
    id,
    workflow_id: workflow,
    name: `run-${id}`,
    path,
    event: path.endsWith('/ci.yml') ? 'pull_request' : 'push',
    status,
    conclusion,
    created_at: updated,
    updated_at: updated,
    html_url: `https://example.invalid/${id}`
  };
}

test('classifies release workflow separately from PR history', () => {
  assert.equal(categoryForRun(run(1)), 'pr');
  assert.equal(categoryForRun(run(2, { path: '.github/workflows/release.yml' })), 'release');
});

test('preserves newest workflow runs and at least one successful run', () => {
  const runs = [
    run(1, { days: 1 }),
    run(2, { days: 2, conclusion: 'failure' }),
    run(3, { days: 40, conclusion: 'failure' }),
    run(4, { days: 45, conclusion: 'cancelled' })
  ];
  const result = planRunDeletions(runs, policy, { now });
  assert.deepEqual(result.deletions.map((item) => item.id), [4, 3]);
  assert.equal(result.protectedRuns, 2);
});

test('never proposes queued or in-progress runs', () => {
  const runs = [
    run(1, { days: 50, status: 'in_progress', conclusion: null }),
    run(2, { days: 50, status: 'queued', conclusion: null }),
    run(3, { days: 50 }),
    run(4, { days: 60 }),
    run(5, { days: 70 })
  ];
  const result = planRunDeletions(runs, policy, { now });
  assert.ok(result.deletions.every((item) => item.id !== 1 && item.id !== 2));
});

test('release evidence uses the longer retention window', () => {
  const runs = [
    run(1, { days: 1, workflow: 9, path: '.github/workflows/release.yml' }),
    run(2, { days: 2, workflow: 9, path: '.github/workflows/release.yml' }),
    run(3, { days: 120, workflow: 9, path: '.github/workflows/release.yml' }),
    run(4, { days: 400, workflow: 9, path: '.github/workflows/release.yml' })
  ];
  const result = planRunDeletions(runs, policy, { now });
  assert.deepEqual(result.deletions.map((item) => item.id), [4]);
});

test('hard caps proposed deletions per cleanup execution', () => {
  const runs = [
    run(1, { days: 1 }),
    run(2, { days: 2 }),
    run(3, { days: 40, conclusion: 'failure' }),
    run(4, { days: 50, conclusion: 'failure' }),
    run(5, { days: 60, conclusion: 'failure' })
  ];
  const result = planRunDeletions(runs, policy, { now });
  assert.equal(result.deletions.length, 2);
  assert.equal(result.deferredByCap, 1);
});
