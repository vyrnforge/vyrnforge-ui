import test from 'node:test';
import assert from 'node:assert/strict';
import { planBranchDeletions, protectedBranchNames } from './branch-retention.mjs';

const now = new Date('2026-10-29T00:00:00Z');
const repository = 'vyrnforge/vyrnforge-ui';
const policy = {
  staleDays: 30,
  maxDeletionsPerRun: 2,
  protectedBranches: [],
  protectedPrefixes: ['release/', 'hotfix/']
};

function branch(name, {
  days = 40,
  protected: isProtected = false,
  mergedPullRequest = false,
  aheadByDefault = 0,
  sha = `${name}-sha`
} = {}) {
  return {
    name,
    sha,
    protected: isProtected,
    commitDate: new Date(now.getTime() - days * 86_400_000).toISOString(),
    mergedPullRequest,
    aheadByDefault
  };
}

function pullRequest(head, base = 'main') {
  return {
    head: { ref: head, repo: { full_name: repository } },
    base: { ref: base, repo: { full_name: repository } }
  };
}

test('protects default branch plus open PR head and stacked base branches', () => {
  const names = protectedBranchNames(
    [pullRequest('feature/child', 'feature/parent')],
    { defaultBranch: 'main', repository }
  );

  assert.deepEqual(new Set(names), new Set(['main', 'feature/child', 'feature/parent']));
});

test('deletes only stale branches whose work is merged or fully contained', () => {
  const result = planBranchDeletions([
    branch('main'),
    branch('feature/contained', { aheadByDefault: 0 }),
    branch('feature/squash-merged', { mergedPullRequest: true, aheadByDefault: 3 }),
    branch('feature/unmerged', { aheadByDefault: 1 }),
    branch('feature/recent', { days: 3, aheadByDefault: 0 })
  ], [], { ...policy, maxDeletionsPerRun: 10 }, {
    now,
    defaultBranch: 'main',
    repository
  });

  assert.deepEqual(result.deletions.map((item) => item.name), ['feature/contained', 'feature/squash-merged']);
  assert.ok(result.skipped.some((item) => item.name === 'feature/unmerged' && item.reason === 'unmerged-work'));
  assert.ok(result.skipped.some((item) => item.name === 'feature/recent' && item.reason === 'not-stale'));
});

test('merged PR target can be removed immediately but never while another PR depends on it', () => {
  const immediate = planBranchDeletions([
    branch('feature/merged-now', { days: 0, aheadByDefault: 4 })
  ], [], policy, {
    now,
    defaultBranch: 'main',
    repository,
    targetBranch: 'feature/merged-now',
    targetWasMerged: true
  });

  assert.deepEqual(immediate.deletions.map((item) => item.name), ['feature/merged-now']);

  const stacked = planBranchDeletions([
    branch('feature/merged-now', { days: 0, aheadByDefault: 4 })
  ], [pullRequest('feature/child', 'feature/merged-now')], policy, {
    now,
    defaultBranch: 'main',
    repository,
    targetBranch: 'feature/merged-now',
    targetWasMerged: true
  });

  assert.deepEqual(stacked.deletions, []);
  assert.ok(stacked.skipped.some((item) => item.name === 'feature/merged-now' && item.reason === 'protected-name-or-open-pr'));
});

test('respects GitHub protection, protected prefixes, and deletion cap', () => {
  const result = planBranchDeletions([
    branch('release/1.0'),
    branch('hotfix/keep'),
    branch('feature/protected', { protected: true }),
    branch('feature/oldest', { days: 90 }),
    branch('feature/older', { days: 80 }),
    branch('feature/old', { days: 70 })
  ], [], policy, {
    now,
    defaultBranch: 'main',
    repository
  });

  assert.deepEqual(result.deletions.map((item) => item.name), ['feature/oldest', 'feature/older']);
  assert.equal(result.deferredByCap, 1);
});
