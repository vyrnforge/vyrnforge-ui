import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  planMergedPullRequestHistoryDeletions,
  planMergedPullRequestRunDeletions,
  planRunDeletions
} from './retention.mjs';

const policy = JSON.parse(await readFile('tooling/actions/retention-policy.json', 'utf8'));
const repository = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const currentRunId = process.env.GITHUB_RUN_ID;
const eventName = process.env.GITHUB_EVENT_NAME || 'unknown';
const eventPath = process.env.GITHUB_EVENT_PATH;
const requestedPullRequest = String(process.env.RETENTION_PR_NUMBER || '').trim();
const outputPath = process.env.RETENTION_REPORT || 'test-results/actions-retention.json';
const apiBase = process.env.GITHUB_API_URL || 'https://api.github.com';

if (!repository || !token) throw new Error('GITHUB_REPOSITORY and GITHUB_TOKEN are required');

const headers = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'vyrnforge-actions-retention'
};

async function githubJson(endpoint) {
  const response = await fetch(`${apiBase}/repos/${repository}${endpoint}`, { headers });
  if (!response.ok) throw new Error(`GitHub API ${endpoint} failed: ${response.status} ${await response.text()}`);
  return response.json();
}

async function listWorkflowRuns() {
  const runs = [];
  for (let page = 1; page <= 20; page += 1) {
    const data = await githubJson(`/actions/runs?per_page=100&page=${page}`);
    const pageRuns = data.workflow_runs || [];
    runs.push(...pageRuns);
    if (pageRuns.length < 100) break;
  }
  return runs;
}

async function readEventPayload() {
  if (!eventPath) return {};
  return JSON.parse(await readFile(eventPath, 'utf8'));
}

async function requestedMergedPullRequest() {
  if (!requestedPullRequest) return null;
  const number = Number(requestedPullRequest);
  if (!Number.isInteger(number) || number < 1) throw new Error(`Invalid RETENTION_PR_NUMBER: ${requestedPullRequest}`);
  const pullRequest = await githubJson(`/pulls/${number}`);
  if (!pullRequest.merged_at) throw new Error(`Pull request #${number} is not merged; refusing merged-PR cleanup`);
  return pullRequest;
}

async function listMergedPullRequests() {
  const merged = new Map();
  const payload = await readEventPayload();
  if ((eventName === 'pull_request' || eventName === 'pull_request_target') && payload.pull_request?.merged) {
    merged.set(Number(payload.pull_request.number), payload.pull_request);
  }

  for (let page = 1; page <= 20; page += 1) {
    const pullRequests = await githubJson(`/pulls?state=closed&sort=updated&direction=desc&per_page=100&page=${page}`);
    for (const pullRequest of pullRequests) {
      if (pullRequest.merged_at) merged.set(Number(pullRequest.number), pullRequest);
    }
    if (pullRequests.length < 100) break;
  }

  return [...merged.values()];
}

async function deleteWorkflowRun(runId) {
  const endpoint = `/actions/runs/${runId}`;
  const response = await fetch(`${apiBase}/repos/${repository}${endpoint}`, {
    method: 'DELETE',
    headers
  });
  if (response.status === 204) return { id: runId, status: 'deleted' };
  if (response.status === 404) return { id: runId, status: 'already-absent' };
  return {
    id: runId,
    status: 'failed',
    httpStatus: response.status,
    error: await response.text()
  };
}

function combinedPlan(mergedPlan, agePlan) {
  const deletionCap = Number(policy.maxDeletionsPerRun || 0);
  const deletionsById = new Map();
  for (const deletion of mergedPlan.deletions) deletionsById.set(deletion.id, deletion);
  for (const deletion of agePlan.deletions) {
    if (!deletionsById.has(deletion.id)) deletionsById.set(deletion.id, deletion);
  }
  const candidates = [...deletionsById.values()];
  return {
    mergedHistory: mergedPlan,
    ageBased: agePlan,
    candidateCount: candidates.length,
    deletionCap,
    deletions: candidates.slice(0, deletionCap),
    deferredByCap: Math.max(0, candidates.length - deletionCap)
  };
}

async function writeReport(report) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

const report = {
  generatedAt: new Date().toISOString(),
  repository,
  trigger: eventName,
  mode: null,
  policy,
  plan: null,
  results: []
};

try {
  const runs = await listWorkflowRuns();
  const requested = await requestedMergedPullRequest();

  if (requested) {
    report.mode = 'merged-pull-request';
    report.pullRequest = {
      number: requested.number,
      headBranch: requested.head?.ref || null,
      mergedAt: requested.merged_at || null
    };
    report.plan = planMergedPullRequestRunDeletions(runs, policy, requested, { currentRunId });
  } else {
    const mergedPullRequests = await listMergedPullRequests();
    const mergedPlan = planMergedPullRequestHistoryDeletions(runs, policy, mergedPullRequests, { currentRunId });

    if (eventName === 'schedule' || eventName === 'workflow_dispatch') {
      report.mode = 'merged-history-and-age-based';
      const agePlan = planRunDeletions(runs, policy, { currentRunId });
      report.plan = combinedPlan(mergedPlan, agePlan);
    } else {
      report.mode = 'merged-pull-request-history';
      report.plan = mergedPlan;
    }
  }

  for (const deletion of report.plan.deletions) {
    report.results.push(await deleteWorkflowRun(deletion.id));
  }

  report.completedAt = new Date().toISOString();
  report.deletedRuns = report.results.filter((result) => result.status === 'deleted').length;
  report.alreadyAbsentRuns = report.results.filter((result) => result.status === 'already-absent').length;
  report.failedRuns = report.results.filter((result) => result.status === 'failed').length;
  await writeReport(report);

  if (report.failedRuns > 0) throw new Error(`${report.failedRuns} workflow-run deletion(s) failed`);
} catch (error) {
  report.completedAt = new Date().toISOString();
  report.error = error instanceof Error ? error.message : String(error);
  await writeReport(report);
  throw error;
}
