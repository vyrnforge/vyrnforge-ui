import { describe, expect, test } from 'vitest';
import { planBranchDeletions, protectedBranchNames } from './branch-retention.mjs';

const now = new Date('2026-10-29T00:00:00Z');
const repository = 'vyrnforge/vyrnforge-ui';
const policy = { staleDays: 7, maxDeletionsPerRun: 2, protectedBranches: [], protectedPrefixes: ['release/', 'hotfix/'] };

function branch(name, { days = 10, protected: isProtected = false, mergedPullRequest = false, aheadByDefault = 0, sha = `${name}-sha` } = {}) {
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
  return { head: { ref: head, repo: { full_name: repository } }, base: { ref: base, repo: { full_name: repository } } };
}

describe('branch retention policy', () => {
  test('protects default branch plus open PR head and stacked base branches', () => {
    const names = protectedBranchNames([pullRequest('feature/child', 'feature/parent')], { defaultBranch: 'main', repository });
    expect(new Set(names)).toEqual(new Set(['main', 'feature/child', 'feature/parent']));
  });

  test('selects only stale branches whose work is merged or fully contained', () => {
    const result = planBranchDeletions([
      branch('main'),
      branch('feature/contained', { aheadByDefault: 0 }),
      branch('feature/squash-merged', { mergedPullRequest: true, aheadByDefault: 3 }),
      branch('feature/unmerged', { aheadByDefault: 1 }),
      branch('feature/recent', { days: 3, aheadByDefault: 0 })
    ], [], { ...policy, maxDeletionsPerRun: 10 }, { now, defaultBranch: 'main', repository });

    expect(result.deletions.map((item) => item.name)).toEqual(['feature/contained', 'feature/squash-merged']);
    expect(result.skipped.some((item) => item.name === 'feature/unmerged' && item.reason === 'unmerged-work')).toBe(true);
    expect(result.skipped.some((item) => item.name === 'feature/recent' && item.reason === 'not-stale')).toBe(true);
  });

  test('protects stale branches used by open pull requests', () => {
    const result = planBranchDeletions([
      branch('feature/parent', { days: 90 }),
      branch('feature/child', { days: 90 })
    ], [pullRequest('feature/child', 'feature/parent')], policy, { now, defaultBranch: 'main', repository });

    expect(result.deletions).toEqual([]);
    expect(result.skipped.filter((item) => item.reason === 'protected-name-or-open-pr')).toHaveLength(2);
  });

  test('respects GitHub protection, protected prefixes, and deletion cap', () => {
    const result = planBranchDeletions([
      branch('release/1.0', { days: 90 }),
      branch('hotfix/keep', { days: 90 }),
      branch('feature/protected', { days: 90, protected: true }),
      branch('feature/oldest', { days: 90 }),
      branch('feature/older', { days: 80 }),
      branch('feature/old', { days: 70 })
    ], [], policy, { now, defaultBranch: 'main', repository });

    expect(result.deletions.map((item) => item.name)).toEqual(['feature/oldest', 'feature/older']);
    expect(result.deferredByCap).toBe(1);
  });
});
