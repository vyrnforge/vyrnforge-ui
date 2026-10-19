import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { planMergedPullRequestRunDeletions, planRunDeletions } from './retention.mjs';

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

async function resolveMergedPullRequest() {
  if (eventName === 'pull_request' || eventName === 'pull_request_target') {
    const payload = await readEventPayload();
    if (!payload.pull_request?.merged) return null;
    return payload.pull_request;
  }

  if (!requestedPullRequest) return null;
  const number = Number(requestedPullRequest);
  if (!Number.isInteger(number) || number < 1) throw new Error(`Invalid RETENTION_PR_NUMBER: ${requestedPullRequest}`);
  const pullRequest = await githubJson(`/pulls/${number}`);
  if (!pullRequest.merged_at) throw new Error(`Pull request #${number} is not merged; refusing merged-PR cleanup`);
  return pullRequest;
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
  const pullRequest = await resolveMergedPullRequest();

  if (pullRequest) {
    report.mode = 'merged-pull-request';
    report.pullRequest = {
      number: pullRequest.number,
      headBranch: pullRequest.head?.ref || null,
      mergedAt: pullRequest.merged_at || null
    };
    report.plan = planMergedPullRequestRunDeletions(runs, policy, pullRequest, { currentRunId });
  } else {
    report.mode = 'age-based';
    report.plan = planRunDeletions(runs, policy, { currentRunId });
  }

  for (const deletion of report.plan.deletions) {
    report.results.push(await deleteWorkflowRun(deletion.id));
  }

  report.completedAt = new Date().toISOString();
  report.deletedRuns = report.results.filter((result) => result.status === 'deleted').length;
  report.alreadyAbsentRuns = report.results.filter((result) => result.status === 'already-absent').length;
  report.failedRuns = report.results.filter((result) => result.status === 'failed').length;
  await writeReport(report);

  if (report.failedRuns > 0) {
    throw new Error(`${report.failedRuns} workflow-run deletion(s) failed`);
  }
} catch (error) {
  report.completedAt = new Date().toISOString();
  report.error = error instanceof Error ? error.message : String(error);
  await writeReport(report);
  throw error;
}
