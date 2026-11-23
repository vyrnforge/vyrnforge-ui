const DAY_MS = 86_400_000;

export function protectedBranchNames(openPullRequests, { defaultBranch, repository }) {
  const names = new Set([defaultBranch]);
  for (const pullRequest of openPullRequests) {
    if (pullRequest?.base?.repo?.full_name === repository && pullRequest?.base?.ref) names.add(pullRequest.base.ref);
    if (pullRequest?.head?.repo?.full_name === repository && pullRequest?.head?.ref) names.add(pullRequest.head.ref);
  }
  return names;
}

function matchesPrefix(name, prefixes) { return prefixes.some((prefix) => name.startsWith(prefix)); }

export function planBranchDeletions(branches, openPullRequests, policy, { now = new Date(), defaultBranch = 'main', repository } = {}) {
  if (!repository) throw new Error('repository is required');
  const protectedNames = protectedBranchNames(openPullRequests, { defaultBranch, repository });
  const explicitNames = new Set(policy.protectedBranches ?? []);
  const protectedPrefixes = policy.protectedPrefixes ?? [];
  const staleBefore = now.getTime() - policy.staleDays * DAY_MS;
  const candidates = [];
  const skipped = [];

  for (const branch of branches) {
    const name = branch.name;
    if (protectedNames.has(name) || explicitNames.has(name)) { skipped.push({ name, reason: 'protected-name-or-open-pr' }); continue; }
    if (branch.protected) { skipped.push({ name, reason: 'github-protected' }); continue; }
    if (matchesPrefix(name, protectedPrefixes)) { skipped.push({ name, reason: 'protected-prefix' }); continue; }
    if (branch.closedWithoutMerge) { skipped.push({ name, reason: 'closed-unmerged-pr' }); continue; }

    const commitTime = Date.parse(branch.commitDate ?? '');
    if (!Number.isFinite(commitTime)) { skipped.push({ name, reason: 'unknown-commit-date' }); continue; }
    if (commitTime > staleBefore) { skipped.push({ name, reason: 'not-stale' }); continue; }
    if (!Number.isInteger(branch.aheadByDefault) || branch.aheadByDefault < 0) {
      skipped.push({ name, reason: 'unknown-comparison' });
      continue;
    }
    // Squash merges can leave commits ahead of main. Only trust a verified, exact
    // merged PR head; a branch name match on its own is never sufficient.
    if (branch.aheadByDefault > 0 && branch.mergedPullRequest !== true) {
      skipped.push({ name, reason: 'unique-commits' });
      continue;
    }

    candidates.push({
      name,
      sha: branch.sha,
      commitDate: branch.commitDate,
      reason: branch.aheadByDefault === 0 ? 'contained-in-default' : 'verified-merged-pr-head'
    });
  }

  candidates.sort((left, right) => Date.parse(left.commitDate) - Date.parse(right.commitDate) || left.name.localeCompare(right.name));
  const maxDeletions = Math.max(0, policy.maxDeletionsPerRun ?? 0);
  return {
    deletions: candidates.slice(0, maxDeletions),
    deferredByCap: Math.max(0, candidates.length - maxDeletions),
    candidateCount: candidates.length,
    skipped,
    protectedBranches: [...protectedNames].sort()
  };
}
