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

/**
 * A GitHub pull request is not itself a tracking issue. Only actual GitHub Issues
 * count, whether open or closed. Evidence includes exact branch-name references,
 * an issue number in the branch name, PR references to a real issue, and the
 * current branch head commit message. Never infer "untracked" from a partial index.
 */
export function linkedIssueNumbersForBranch(name, issues, pullRequests, { repository, commitMessage = '' } = {}) {
  if (!repository || !Array.isArray(issues) || !Array.isArray(pullRequests)) {
    throw new Error('complete issue and PR indexes are required');
  }
  const realIssues = issues.filter((item) => Number.isInteger(item.number) && !item.pull_request);
  const issueNumbers = new Set(realIssues.map((issue) => issue.number));
  const linked = new Set();

  // Branches such as evidence/ux-1372-... encode an existing issue directly.
  for (const match of name.matchAll(/(?:^|[/_-])(?:[a-zA-Z]{1,5}[-_]?)?(\d{2,5})(?=$|[/_-])/g)) {
    const number = Number(match[1]);
    if (issueNumbers.has(number)) linked.add(number);
  }

  function addIssueReferences(value) {
    for (const match of String(value || '').matchAll(/(?:#|\/issues\/)(\d{1,6})\b/g)) {
      const number = Number(match[1]);
      if (issueNumbers.has(number)) linked.add(number);
    }
  }
  addIssueReferences(commitMessage);

  const associatedPullRequests = pullRequests.filter((pr) => {
    const head = pr?.head;
    return head?.ref === name && (head?.repo?.full_name === repository || head?.repo == null);
  });
  for (const pullRequest of associatedPullRequests) {
    addIssueReferences(pullRequest.title);
    addIssueReferences(pullRequest.body);
  }

  for (const issue of realIssues) {
    const content = String(issue.title || '') + '\n' + String(issue.body || '');
    if (content.includes(name)) linked.add(issue.number);
    if (associatedPullRequests.some((pr) =>
      content.includes(`#${pr.number}`) ||
      content.includes(`/pull/${pr.number}`) ||
      content.includes(`/pulls/${pr.number}`)
    )) linked.add(issue.number);
  }
  return [...linked].sort((left, right) => left - right);
}

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
    if (!Array.isArray(branch.issueNumbers)) { skipped.push({ name, reason: 'unknown-issue-links' }); continue; }
    if (branch.issueNumbers.length) { skipped.push({ name, reason: 'linked-issue', issueNumbers: branch.issueNumbers }); continue; }

    const commitTime = Date.parse(branch.commitDate ?? '');
    if (!Number.isFinite(commitTime)) { skipped.push({ name, reason: 'unknown-commit-date' }); continue; }
    if (commitTime > staleBefore) { skipped.push({ name, reason: 'not-stale' }); continue; }

    // A stale, untracked branch is disposable, even if an old PR was closed
    // without merging or its historical commits are ahead of main.
    candidates.push({ name, sha: branch.sha, commitDate: branch.commitDate, reason: 'stale-without-issue' });
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
