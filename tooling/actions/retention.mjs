const completedStatuses = new Set(['completed']);

function workflowPath(run) {
  const value = String(run.path || '');
  const refSeparator = value.indexOf('@');
  return refSeparator === -1 ? value : value.slice(0, refSeparator);
}

export function categoryForRun(run) {
  const path = workflowPath(run);
  const event = String(run.event || '');

  if (path.endsWith('/release.yml') || event === 'release' || String(run.head_branch || '').startsWith('v')) return 'release';
  if (path.endsWith('/actions-retention.yml')) return 'retention';
  if (path.endsWith('/docs-pages.yml')) return 'docs';
  if (path.endsWith('/scheduled.yml') || event === 'schedule') return 'scheduled';
  if (path.endsWith('/main.yml')) return 'main';
  if (path.endsWith('/ci.yml') || event === 'pull_request' || event === 'pull_request_target') return 'pr';
  if (event === 'workflow_dispatch') return 'dynamic';
  return 'unknown';
}

function ageDays(run, now) {
  const timestamp = Date.parse(run.updated_at || run.created_at || '');
  if (!Number.isFinite(timestamp)) return 0;
  return Math.max(0, (now.getTime() - timestamp) / 86_400_000);
}

function isSuccess(run) {
  return run.conclusion === 'success';
}

function workflowKey(run) {
  return String(run.workflow_id || workflowPath(run) || run.name || 'unknown');
}

function runSummary(run, extra = {}) {
  return {
    id: run.id,
    name: run.name,
    workflowId: run.workflow_id,
    path: workflowPath(run),
    event: run.event,
    conclusion: run.conclusion,
    createdAt: run.created_at,
    updatedAt: run.updated_at,
    htmlUrl: run.html_url,
    ...extra
  };
}

export function planRunDeletions(runs, policy, { now = new Date(), currentRunId } = {}) {
  const completed = runs
    .filter((run) => completedStatuses.has(run.status))
    .filter((run) => Number(run.id) !== Number(currentRunId))
    .sort((a, b) => Date.parse(b.updated_at || b.created_at) - Date.parse(a.updated_at || a.created_at));

  const protectedIds = new Set();
  const perWorkflow = new Map();

  for (const run of completed) {
    const key = workflowKey(run);
    if (!perWorkflow.has(key)) perWorkflow.set(key, []);
    perWorkflow.get(key).push(run);
  }

  for (const workflowRuns of perWorkflow.values()) {
    for (const run of workflowRuns.slice(0, policy.minimumRunsPerWorkflow)) protectedIds.add(run.id);
    const successful = workflowRuns.filter(isSuccess).slice(0, policy.minimumSuccessfulRunsPerWorkflow);
    for (const run of successful) protectedIds.add(run.id);
  }

  const candidates = [];
  for (const run of completed) {
    if (protectedIds.has(run.id)) continue;
    const category = categoryForRun(run);
    const rule = policy.categories[category] || policy.categories.unknown;
    const threshold = isSuccess(run) ? rule.successDays : rule.nonSuccessDays;
    const age = ageDays(run, now);
    if (age < threshold) continue;
    candidates.push(runSummary(run, {
      category,
      ageDays: Math.floor(age),
      thresholdDays: threshold,
      reason: `${isSuccess(run) ? 'successful' : 'non-successful'} run exceeded ${threshold}-day retention`
    }));
  }

  candidates.sort((a, b) => b.ageDays - a.ageDays || Number(a.id) - Number(b.id));
  return {
    totalRuns: runs.length,
    completedRuns: completed.length,
    protectedRuns: protectedIds.size,
    candidateCount: candidates.length,
    deletionCap: policy.maxDeletionsPerRun,
    deletions: candidates.slice(0, policy.maxDeletionsPerRun),
    deferredByCap: Math.max(0, candidates.length - policy.maxDeletionsPerRun)
  };
}

function pullRequestNumbers(run) {
  return (run.pull_requests || [])
    .map((pullRequest) => Number(pullRequest.number))
    .filter(Number.isFinite);
}

function belongsToPullRequest(run, pullRequest) {
  const pullRequestNumber = Number(pullRequest?.number);
  if (Number.isFinite(pullRequestNumber) && pullRequestNumbers(run).includes(pullRequestNumber)) return true;

  const headBranch = pullRequest?.head?.ref;
  if (!headBranch || run.head_branch !== headBranch) return false;

  const expectedRepository = pullRequest?.head?.repo?.full_name;
  const actualRepository = run.head_repository?.full_name;
  if (expectedRepository && actualRepository && expectedRepository !== actualRepository) return false;

  return run.event === 'pull_request' || run.event === 'pull_request_target' || run.event === 'workflow_dispatch';
}

export function planMergedPullRequestRunDeletions(runs, policy, pullRequest, { currentRunId } = {}) {
  if (!pullRequest?.number) throw new Error('A pull request number is required for merged-PR cleanup');

  const mergedPolicy = policy.mergedPullRequest || {};
  const preservePaths = new Set((mergedPolicy.preserveWorkflowPaths || []).map(String));
  const preserveSuccessCount = Math.max(0, Number(mergedPolicy.preserveSuccessfulRunsPerWorkflow || 0));
  const deletionCap = Number(policy.maxDeletionsPerRun || 0);

  const matched = runs
    .filter((run) => completedStatuses.has(run.status))
    .filter((run) => Number(run.id) !== Number(currentRunId))
    .filter((run) => belongsToPullRequest(run, pullRequest))
    .sort((a, b) => Date.parse(b.updated_at || b.created_at) - Date.parse(a.updated_at || a.created_at));

  const protectedIds = new Set();
  for (const path of preservePaths) {
    const successful = matched
      .filter((run) => workflowPath(run) === path && isSuccess(run))
      .slice(0, preserveSuccessCount);
    for (const run of successful) protectedIds.add(run.id);
  }

  const candidates = matched
    .filter((run) => !protectedIds.has(run.id))
    .map((run) => runSummary(run, {
      category: categoryForRun(run),
      reason: `superseded run for merged pull request #${pullRequest.number}`
    }));

  return {
    pullRequestNumber: Number(pullRequest.number),
    headBranch: pullRequest.head?.ref || null,
    totalRuns: runs.length,
    matchedRuns: matched.length,
    protectedRuns: protectedIds.size,
    candidateCount: candidates.length,
    deletionCap,
    deletions: candidates.slice(0, deletionCap),
    deferredByCap: Math.max(0, candidates.length - deletionCap)
  };
}
