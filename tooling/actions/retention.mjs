const completedStatuses = new Set(['completed']);

export function categoryForRun(run) {
  const path = String(run.path || '');
  if (path.endsWith('/ci.yml') || run.event === 'pull_request') return 'pr';
  if (path.endsWith('/main.yml')) return 'main';
  if (path.endsWith('/scheduled.yml')) return 'scheduled';
  if (path.endsWith('/docs-pages.yml')) return 'docs';
  if (path.endsWith('/release.yml') || run.event === 'release' || String(run.head_branch || '').startsWith('v')) return 'release';
  if (path.endsWith('/actions-retention.yml')) return 'retention';
  if (run.event === 'dynamic') return 'dynamic';
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
  return String(run.workflow_id || run.path || run.name || 'unknown');
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
    candidates.push({
      id: run.id,
      name: run.name,
      workflowId: run.workflow_id,
      path: run.path,
      event: run.event,
      conclusion: run.conclusion,
      category,
      ageDays: Math.floor(age),
      thresholdDays: threshold,
      createdAt: run.created_at,
      updatedAt: run.updated_at,
      htmlUrl: run.html_url
    });
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
