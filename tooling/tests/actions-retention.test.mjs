import test from 'node:test';
import assert from 'node:assert/strict';
import {
  categoryForRun,
  planMergedPullRequestHistoryDeletions,
  planMergedPullRequestRunDeletions,
  planRunDeletions
} from '../actions/retention.mjs';

const now = new Date('2026-10-19T03:00:00Z');
const policy = {
  minimumRunsPerWorkflow: 2,
  minimumSuccessfulRunsPerWorkflow: 1,
  maxDeletionsPerRun: 2,
  mergedPullRequest: {
    preserveSuccessfulRunsPerWorkflow: 1,
    preserveWorkflowPaths: ['.github/workflows/ci.yml']
  },
  categories: {
    pr: { successDays: 30, nonSuccessDays: 7 },
    main: { successDays: 60, nonSuccessDays: 14 },
    docs: { successDays: 30, nonSuccessDays: 14 },
    release: { successDays: 365, nonSuccessDays: 90 },
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

test('merged PR cleanup preserves only the newest successful validation evidence', () => {
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
      event: 'pull_request',
      conclusion: 'success'
    }),
    run(6, { days: 5, pr: 891, branch: 'feature/other', conclusion: 'failure' })
  ];

  const result = planMergedPullRequestRunDeletions(runs, mergedPolicy, pr);
  assert.equal(result.matchedRuns, 4);
  assert.equal(result.protectedRuns, 1);
  assert.deepEqual(result.deletions.map((item) => item.id), [9, 8, 7]);
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
