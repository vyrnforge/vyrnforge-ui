import { describe, expect, test } from 'vitest';
import { linkedIssueNumbersForBranch, planBranchDeletions, protectedBranchNames } from './branch-retention.mjs';

const now = new Date('2026-10-29T00:00:00Z');
const repository = 'vyrnforge/vyrnforge-ui';
const policy = { staleDays: 7, maxDeletionsPerRun: 2, protectedBranches: [], protectedPrefixes: ['release/', 'hotfix/'] };

function branch(name, { days = 10, protected: isProtected = false, sha = `${name}-sha`, issueNumbers = [] } = {}) {
  return {
    name,
    sha,
    protected: isProtected,
    issueNumbers,
    commitDate: new Date(now.getTime() - days * 86_400_000).toISOString()
  };
}

function pullRequest(head, base = 'main') {
  return { number: 1500, head: { ref: head, repo: { full_name: repository } }, base: { ref: base, repo: { full_name: repository } } };
}

describe('branch retention policy', () => {
  test('protects default branch plus open PR head and stacked base branches', () => {
    const names = protectedBranchNames([pullRequest('feature/child', 'feature/parent')], { defaultBranch: 'main', repository });
    expect(new Set(names)).toEqual(new Set(['main', 'feature/child', 'feature/parent']));
  });

  test('prunes stale branches without issues even if a closed PR was unmerged or commits are unique', () => {
    const result = planBranchDeletions([
      branch('main'),
      branch('feature/old-unmerged'),
      branch('evidence/old-unique'),
      branch('feature/recent', { days: 3 }),
      branch('feature/tracked', { issueNumbers: [1287] })
    ], [], { ...policy, maxDeletionsPerRun: 10 }, { now, defaultBranch: 'main', repository });

    expect(result.deletions.map((item) => item.name)).toEqual(['evidence/old-unique', 'feature/old-unmerged']);
    expect(result.deletions.every((item) => item.reason === 'stale-without-issue')).toBe(true);
    expect(result.skipped.some((item) => item.name === 'feature/tracked' && item.reason === 'linked-issue')).toBe(true);
    expect(result.skipped.some((item) => item.name === 'feature/recent' && item.reason === 'not-stale')).toBe(true);
  });

  test('unknown issue index or commit date fails closed', () => {
    const result = planBranchDeletions([
      branch('feature/unknown-links', { issueNumbers: null }),
      { ...branch('feature/unknown-date'), commitDate: null },
      branch('feature/regular')
    ], [], policy, { now, defaultBranch: 'main', repository });
    expect(result.deletions.map((item) => item.name)).toEqual(['feature/regular']);
    expect(result.skipped.some((item) => item.reason === 'unknown-issue-links')).toBe(true);
    expect(result.skipped.some((item) => item.reason === 'unknown-commit-date')).toBe(true);
  });

  test('open PR branches remain protected even without a linked issue', () => {
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

describe('issue association evidence', () => {
  const issues = [
    { number: 1287, title: 'Composite-widget tracking', body: '' },
    { number: 1355, title: 'App shell evidence', body: '' },
    { number: 1397, title: 'API conformance', body: '' },
    { number: 1401, title: 'Coordinates', body: 'Evidence branch: evidence/unencoded-branch' },
    { number: 1499, title: 'Review branch PR', body: 'Follow-up to #1498' },
    { number: 1498, title: 'Pull request', body: '', pull_request: { url: 'https://example.invalid/pulls/1498' } }
  ];

  test('recognizes branch-embedded issue IDs and direct issue text', () => {
    expect(linkedIssueNumbersForBranch('qa/type-conformance-negative-1397', issues, [], { repository })).toEqual([1397]);
    expect(linkedIssueNumbersForBranch('evidence/unencoded-branch', issues, [], { repository })).toEqual([1401]);
    expect(linkedIssueNumbersForBranch('feature/none', issues, [], { repository })).toEqual([]);
  });

  test('recognizes actual issue references in the branch PR and head commit', () => {
    const pr = { ...pullRequest('fix/color-picker'), body: 'Related tracking: #1287', number: 1309 };
    expect(linkedIssueNumbersForBranch('fix/color-picker', issues, [pr], { repository })).toEqual([1287]);
    expect(linkedIssueNumbersForBranch('fix/commit-only', issues, [], { repository, commitMessage: 'Fix #1355' })).toEqual([1355]);
  });

  test('PR numbers do not count as standalone issue links', () => {
    const pr = { ...pullRequest('fix/orphan'), body: 'Only follow-up #1498', number: 1309 };
    expect(linkedIssueNumbersForBranch('fix/orphan', issues, [pr], { repository })).toEqual([]);
  });

  test('tracks a branch when its PR is explicitly referenced from an issue', () => {
    const pr = { ...pullRequest('fix/pending'), body: '', number: 1500 };
    const issueList = [...issues, { number: 1445, title: 'Guide', body: 'See PR #1500 for implementation.' }];
    expect(linkedIssueNumbersForBranch('fix/pending', issueList, [pr], { repository })).toEqual([1445]);
  });

  test('does not match PRs from another repository with the same branch name', () => {
    const pr = { ...pullRequest('fix/external'), body: 'Fixes #1287', head: { ref: 'fix/external', repo: { full_name: 'someone/another-repo' } } };
    expect(linkedIssueNumbersForBranch('fix/external', issues, [pr], { repository })).toEqual([]);
  });

  test('requires complete indexed inputs rather than assuming there are no issues', () => {
    expect(() => linkedIssueNumbersForBranch('feature/x', null, [], { repository })).toThrow();
    expect(() => linkedIssueNumbersForBranch('feature/x', [], null, { repository })).toThrow();
  });
});
