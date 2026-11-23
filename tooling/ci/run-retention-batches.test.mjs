import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { planRunDeletions } from './retention.mjs';
import { sweepRunHistory } from './run-retention-batches.mjs';

const now = new Date('2026-11-23T10:00:00Z');
const policy = JSON.parse(readFileSync(new URL('./retention-policy.json', import.meta.url), 'utf8'));

function makeRun(id, { days = 9, status = 'completed' } = {}) {
  const updated = new Date(now.getTime() - days * 86_400_000).toISOString();
  return {
    id,
    workflow_id: 1,
    path: '.github/workflows/ci.yml',
    event: 'pull_request',
    status,
    conclusion: status === 'completed' ? 'success' : null,
    created_at: updated,
    updated_at: updated
  };
}

function harness(count, { recent = 0, running = 0, failId = null } = {}) {
  const records = [
    ...Array.from({ length: count }, (_, i) => makeRun(i + 1)),
    ...Array.from({ length: recent }, (_, i) => makeRun(count + i + 1, { days: 1 })),
    ...Array.from({ length: running }, (_, i) => makeRun(count + recent + i + 1, { status: 'in_progress' }))
  ];
  const deleted = [];
  return {
    records,
    deleted,
    listRuns: async () => records.slice(),
    plan: (runs) => planRunDeletions(runs, policy, { now }),
    deleteRun: async (id) => {
      if (id === failId) return { id, status: 'failed', error: 'provider rejected deletion' };
      const index = records.findIndex((run) => run.id === id);
      if (index < 0) return { id, status: 'already-absent' };
      records.splice(index, 1);
      deleted.push(id);
      return { id, status: 'deleted' };
    },
    wait: async () => {}
  };
}

test('refreshes run history and drains a backlog across bounded 200-deletion batches', async () => {
  const ctx = harness(501, { recent: 2, running: 1 });
  const result = await sweepRunHistory({ ...ctx, maxBatches: 4 });
  assert.equal(result.initialCandidates, 501);
  assert.equal(result.deletedRuns, 501);
  assert.equal(result.remainingCandidates, 0);
  assert.equal(result.incomplete, false);
  assert.deepEqual(result.batches.map((batch) => batch.plannedDeletions), [200, 200, 101, 0]);
  assert.ok(result.batches.every((batch) => batch.plannedDeletions <= policy.maxDeletionsPerRun));
  assert.equal(ctx.records.length, 3);
});

test('manual dry-run never deletes and reports the complete pending count', async () => {
  const ctx = harness(230);
  const result = await sweepRunHistory({ ...ctx, dryRun: true });
  assert.equal(result.initialCandidates, 230);
  assert.equal(result.remainingCandidates, 230);
  assert.equal(result.deletedRuns, 0);
  assert.equal(result.incomplete, false);
  assert.deepEqual(result.batches.map((batch) => batch.plannedDeletions), [200]);
  assert.equal(ctx.records.length, 230);
});

test('reports incomplete backlog after finite sweep budget rather than claiming success', async () => {
  const ctx = harness(501);
  const result = await sweepRunHistory({ ...ctx, maxBatches: 2 });
  assert.equal(result.deletedRuns, 400);
  assert.equal(result.remainingCandidates, 101);
  assert.equal(result.incomplete, true);
});

test('stops on provider deletion failure and preserves an auditable outcome', async () => {
  const ctx = harness(5, { failId: 1 });
  const result = await sweepRunHistory({ ...ctx, maxBatches: 4 });
  assert.equal(result.deletedRuns, 0);
  assert.equal(result.failedRuns, 1);
  assert.equal(result.stoppedForFailure, true);
  assert.equal(result.remainingCandidates, 5);
  assert.equal(result.incomplete, true);
  assert.equal(result.results[0].error, 'provider rejected deletion');
});

test('invalid sweep limits cannot cause unbounded cleanup', async () => {
  const ctx = harness(1);
  await assert.rejects(sweepRunHistory({ ...ctx, maxBatches: 0 }), /maxBatches/);
  await assert.rejects(sweepRunHistory({ ...ctx, delayMs: -1 }), /delayMs/);
});

test('production policy retains independent per-batch and per-execution bounds', () => {
  assert.equal(policy.maxDeletionsPerRun, 200);
  assert.equal(policy.maxBatchesPerExecution, 4);
  for (const category of Object.values(policy.categories)) {
    assert.equal(category.successDays, 6);
    assert.equal(category.nonSuccessDays, 6);
  }
});
