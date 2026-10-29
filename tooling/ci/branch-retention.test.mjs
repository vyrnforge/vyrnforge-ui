import { describe, expect, test } from 'vitest';
import { planBranchDeletions, protectedBranchNames } from './branch-retention.mjs';

const now = new Date('2026-10-29T00:00:00Z');
const repository = 'vyrnforge/vyrnforge-ui';
const policy = { staleDays: 7, maxDeletionsPerRun: 2, protectedBranches: [], protectedPrefixes: ['release/', 'hotfix/'] };
function branch(name, { days = 10, protected: isProtected = false, sha = `${name}-sha` } = {}) { return { name, sha, protected: isProtected, commitDate: new Date(now.getTime() - days * 86_400_000).toISOString() }; }
function pullRequest(head, base = 'main') { return { head: { ref: head, repo: { full_name: repository } }, base: { ref: base, repo: { full_name: repository } } }; }

describe('branch retention policy', () => {
  test('protects default branch plus open PR head and stacked base branches', () => {
    const names = protectedBranchNames([pullRequest('feature/child', 'feature/parent')], { defaultBranch: 'main', repository });
    expect(new Set(names)).toEqual(new Set(['main', 'feature/child', 'feature/parent']));
  });

  test('selects branches by age without merge metadata', () => {
    const result = planBranchDeletions([branch('main'), branch('feature/old-a', { days: 40 }), branch('feature/old-b', { days: 8 }), branch('feature/recent', { days: 3 })], [], { ...policy, maxDeletionsPerRun: 10 }, { now, defaultBranch: 'main', repository });
    expect(result.deletions.map((item) => item.name)).toEqual(['feature/old-a', 'feature/old-b']);
    expect(result.deletions.every((item) => item.reason === 'stale')).toBe(true);
    expect(result.skipped.some((item) => item.name === 'feature/recent' && item.reason === 'not-stale')).toBe(true);
  });

  test('protects branches used by open pull requests', () => {
    const result = planBranchDeletions([branch('feature/parent', { days: 90 }), branch('feature/child', { days: 90 })], [pullRequest('feature/child', 'feature/parent')], policy, { now, defaultBranch: 'main', repository });
    expect(result.deletions).toEqual([]);
    expect(result.skipped.filter((item) => item.reason === 'protected-name-or-open-pr')).toHaveLength(2);
  });

  test('respects GitHub protection, protected prefixes, and selection cap', () => {
    const result = planBranchDeletions([branch('release/1.0', { days: 90 }), branch('hotfix/keep', { days: 90 }), branch('feature/protected', { days: 90, protected: true }), branch('feature/oldest', { days: 90 }), branch('feature/older', { days: 80 }), branch('feature/old', { days: 70 })], [], policy, { now, defaultBranch: 'main', repository });
    expect(result.deletions.map((item) => item.name)).toEqual(['feature/oldest', 'feature/older']);
    expect(result.deferredByCap).toBe(1);
  });
});
