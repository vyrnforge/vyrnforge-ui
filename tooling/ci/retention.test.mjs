import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  categoryForRun,
  planMergedPullRequestHistoryDeletions,
  planMergedPullRequestRunDeletions,
  planRunDeletions
} from './retention.mjs';

const now = new Date('2026-10-19T03:00:00Z');
const policy = {
  minimumRunsPerWorkflow: 2,
  minimumSuccessfulRunsPerWorkflow: 1,
  maxDeletionsPerRun: 2,
  preserveSuccessfulCategories: ['main', 'scheduled', 'release', 'docs'],
  mergedPullRequest: {
    preserveSuccessfulRunsPerWorkflow: 1,
    preserveWorkflowPaths: ['.github/workflows/ci.yml']
  },
  categories: {
    pr: { successDays: 30, nonSuccessDays: 7 },
    main: { successDays: 60, nonSuccessDays: 14 },
    scheduled: { successDays: 45, nonSuccessDays: 14 },
    docs: { successDays: 30, nonSuccessDays: 14 },
    release: { successDays: 365, nonSuccessDays: 90 },
    dynamic: { successDays: 14, nonSuccessDays: 7 },
    unknown: { successDays: 30, nonSuccessDays: 7 }
  }
};

function run(id, {
  days = 40,
  conclusion = 'success',
  workflow = 1,
  path = '.github/workflows/ci.yml',
  event = path.endsWith('/ci.yml') ? 'pull_request' : 'push',
  status = 'completed',
  pr = null,
  branch = 'feature/example',
  repository = 'vyrnforge/vyrnforge-ui'
} = {}) {
  const updated = new Date(now.getTime() - days * 86_400_000).toISOString();
  return {
    id,
    workflow_id: workflow,
    name: `run-${id}`,
    path,
    event,
    status,
    conclusion,
    head_branch: branch,
    head_repository: { full_name: repository },
    pull_requests: pr ? [{ number: pr }] : [],
    created_at: updated,
    updated_at: updated,
    html_url: `https://example.invalid/${id}`
  };
}

function pullRequest(number, branch = `feature/${number}`) {
  return {
    number,
    merged_at: now.toISOString(),
    head: {
      ref: branch,
      repo: { full_name: 'vyrnforge/vyrnforge-ui' }
    }
  };
}

test('classifies release workflow separately from PR history', () => {
  assert.equal(categoryForRun(run(1)), 'pr');
  assert.equal(categoryForRun(run(2, { path: '.github/workflows/release.yml' })), 'release');
});

test('normalizes workflow refs and classifies pull_request_target as PR history', () => {
  assert.equal(categoryForRun(run(1, {
    path: '.github/workflows/ci.yml@refs/pull/890/merge',
    event: 'pull_request_target'
  })), 'pr');
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

test('preserves successful main, scheduled, release, and docs acceptance evidence regardless of age', () => {
  const runs = [
    run(1, { days: 1, workflow: 9, path: '.github/workflows/release.yml' }),
    run(2, { days: 400, workflow: 9, path: '.github/workflows/release.yml' }),
    run(3, { days: 500, workflow: 10, path: '.github/workflows/main.yml', branch: 'main' }),
    run(4, { days: 500, workflow: 11, path: '.github/workflows/scheduled.yml', event: 'schedule', branch: 'main' }),
    run(5, { days: 500, workflow: 12, path: '.github/workflows/docs-pages.yml', branch: 'main' })
  ];
  const result = planRunDeletions(runs, policy, { now });
  assert.deepEqual(result.deletions, []);
  assert.ok(result.protectedRuns >= 5);
});

test('old failed acceptance runs remain eligible for bounded cleanup', () => {
  const runs = [
    run(1, { days: 1, workflow: 9, path: '.github/workflows/main.yml', branch: 'main', conclusion: 'success' }),
    run(2, { days: 2, workflow: 9, path: '.github/workflows/main.yml', branch: 'main', conclusion: 'success' }),
    run(3, { days: 40, workflow: 9, path: '.github/workflows/main.yml', branch: 'main', conclusion: 'failure' }),
    run(4, { days: 50, workflow: 9, path: '.github/workflows/main.yml', branch: 'main', conclusion: 'cancelled' })
  ];
  const result = planRunDeletions(runs, policy, { now });
  assert.deepEqual(result.deletions.map((item) => item.id), [4, 3]);
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

test('merged PR cleanup preserves the newest successful PR validation and ignores non-PR workflows', () => {
  const mergedPolicy = { ...policy, maxDeletionsPerRun: 100 };
  const pr = pullRequest(890, 'feat/button-vertical-slice');
  const runs = [
    run(10, { days: 1, pr: 890, branch: pr.head.ref, conclusion: 'success' }),
    run(9, { days: 2, pr: 890, branch: pr.head.ref, conclusion: 'success' }),
    run(8, { days: 3, pr: 890, branch: pr.head.ref, conclusion: 'failure' }),
    run(7, {
      days: 4,
      pr: 890,
      branch: pr.head.ref,
      workflow: 7,
      path: '.github/workflows/button-bootstrap-lock.yml',
      event: 'push',
      conclusion: 'success'
    }),
    run(6, { days: 5, pr: 891, branch: 'feature/other', conclusion: 'failure' })
  ];

  const result = planMergedPullRequestRunDeletions(runs, mergedPolicy, pr);
  assert.equal(result.matchedRuns, 3);
  assert.equal(result.protectedRuns, 1);
  assert.deepEqual(result.deletions.map((item) => item.id), [9, 8]);
  assert.ok(result.deletions.every((item) => item.reason.includes('#890')));
});

test('merged PR cleanup never deletes main or docs runs even when GitHub associates them with the PR', () => {
  const mergedPolicy = { ...policy, maxDeletionsPerRun: 100 };
  const pr = pullRequest(890, 'feat/button-vertical-slice');
  const runs = [
    run(10, { days: 1, pr: 890, branch: pr.head.ref, conclusion: 'success' }),
    run(9, { days: 2, pr: 890, branch: pr.head.ref, conclusion: 'failure' }),
    run(8, {
      days: 1,
      pr: 890,
      branch: 'main',
      workflow: 3,
      path: '.github/workflows/main.yml',
      event: 'push',
      conclusion: 'success'
    }),
    run(7, {
      days: 1,
      pr: 890,
      branch: 'main',
      workflow: 4,
      path: '.github/workflows/docs-pages.yml',
      event: 'push',
      conclusion: 'success'
    })
  ];

  const result = planMergedPullRequestRunDeletions(runs, mergedPolicy, pr);
  assert.deepEqual(result.deletions.map((item) => item.id), [9]);
  assert.ok(result.deletions.every((item) => item.id !== 8 && item.id !== 7));
});

test('merged PR cleanup can fall back to head branch and repository when PR links are absent', () => {
  const mergedPolicy = { ...policy, maxDeletionsPerRun: 100 };
  const pr = pullRequest(890, 'feat/button-vertical-slice');
  const runs = [
    run(3, { days: 1, branch: pr.head.ref, conclusion: 'success' }),
    run(2, { days: 2, branch: pr.head.ref, conclusion: 'failure' }),
    run(1, {
      days: 3,
      branch: pr.head.ref,
      repository: 'someone/fork',
      conclusion: 'failure'
    })
  ];

  const result = planMergedPullRequestRunDeletions(runs, mergedPolicy, pr);
  assert.equal(result.matchedRuns, 2);
  assert.deepEqual(result.deletions.map((item) => item.id), [2]);
});

test('merged PR cleanup excludes the currently executing run and respects deletion cap', () => {
  const pr = pullRequest(890, 'feat/button-vertical-slice');
  const runs = [
    run(5, { days: 1, pr: 890, branch: pr.head.ref, conclusion: 'success' }),
    run(4, { days: 2, pr: 890, branch: pr.head.ref, conclusion: 'failure' }),
    run(3, { days: 3, pr: 890, branch: pr.head.ref, conclusion: 'failure' }),
    run(2, { days: 4, pr: 890, branch: pr.head.ref, conclusion: 'failure' })
  ];

  const result = planMergedPullRequestRunDeletions(runs, policy, pr, { currentRunId: 4 });
  assert.equal(result.matchedRuns, 3);
  assert.deepEqual(result.deletions.map((item) => item.id), [3, 2]);
  assert.equal(result.deferredByCap, 0);
});

test('merged history sweep cleans multiple merged PRs with one global deletion cap', () => {
  const historyPolicy = { ...policy, maxDeletionsPerRun: 3 };
  const pr890 = pullRequest(890, 'feat/button-vertical-slice');
  const pr891 = pullRequest(891, 'fix/actions-retention-cleanup');
  const runs = [
    run(20, { days: 1, pr: 890, branch: pr890.head.ref, conclusion: 'success' }),
    run(19, { days: 4, pr: 890, branch: pr890.head.ref, conclusion: 'failure' }),
    run(18, { days: 5, pr: 890, branch: pr890.head.ref, conclusion: 'failure' }),
    run(17, { days: 1, pr: 891, branch: pr891.head.ref, conclusion: 'success' }),
    run(16, { days: 2, pr: 891, branch: pr891.head.ref, conclusion: 'failure' }),
    run(15, { days: 3, pr: 891, branch: pr891.head.ref, conclusion: 'cancelled' })
  ];

  const result = planMergedPullRequestHistoryDeletions(runs, historyPolicy, [pr890, pr891]);
  assert.equal(result.mergedPullRequests, 2);
  assert.equal(result.protectedRuns, 2);
  assert.equal(result.candidateCount, 4);
  assert.deepEqual(result.deletions.map((item) => item.id), [18, 19, 15]);
  assert.equal(result.deferredByCap, 1);
});

test('age-based cleanup preserves the last successful validation for each merged PR', () => {
  const historyPolicy = { ...policy, maxDeletionsPerRun: 100 };
  const pr890 = pullRequest(890, 'feat/old-change');
  const pr891 = pullRequest(891, 'feat/newer-change');
  const runs = [
    run(30, { days: 1, pr: 891, branch: pr891.head.ref, conclusion: 'success' }),
    run(29, { days: 2, pr: 891, branch: pr891.head.ref, conclusion: 'failure' }),
    run(20, { days: 45, pr: 890, branch: pr890.head.ref, conclusion: 'success' }),
    run(19, { days: 50, pr: 890, branch: pr890.head.ref, conclusion: 'failure' })
  ];

  const mergedPlan = planMergedPullRequestHistoryDeletions(runs, historyPolicy, [pr890, pr891]);
  assert.deepEqual(new Set(mergedPlan.protectedRunIds), new Set([20, 30]));

  const unprotectedAgePlan = planRunDeletions(runs, historyPolicy, { now });
  assert.ok(unprotectedAgePlan.deletions.some((item) => item.id === 20));

  const protectedAgePlan = planRunDeletions(runs, historyPolicy, {
    now,
    protectedRunIds: mergedPlan.protectedRunIds
  });
  assert.ok(protectedAgePlan.deletions.every((item) => item.id !== 20 && item.id !== 30));
  assert.ok(protectedAgePlan.deletions.some((item) => item.id === 19));
});
