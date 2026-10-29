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

    const commitTime = Date.parse(branch.commitDate ?? '');
    if (!Number.isFinite(commitTime)) { skipped.push({ name, reason: 'unknown-commit-date' }); continue; }
    if (commitTime > staleBefore) { skipped.push({ name, reason: 'not-stale' }); continue; }

    candidates.push({ name, sha: branch.sha, commitDate: branch.commitDate, reason: 'stale' });
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
