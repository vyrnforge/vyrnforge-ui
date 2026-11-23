import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  planMergedPullRequestHistoryDeletions,
  planMergedPullRequestRunDeletions,
  planRunDeletions
} from './retention.mjs';
import { linkedIssueNumbersForBranch, planBranchDeletions, protectedBranchNames } from './branch-retention.mjs';
import { mapLimited, requestWithBackoff } from './github-api.mjs';

const policy = JSON.parse(await readFile('tooling/ci/retention-policy.json', 'utf8'));
const branchPolicy = JSON.parse(await readFile('tooling/ci/branch-retention-policy.json', 'utf8'));
const repository = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const currentRunId = process.env.GITHUB_RUN_ID;
const eventName = process.env.GITHUB_EVENT_NAME || 'unknown';
const eventPath = process.env.GITHUB_EVENT_PATH;
const requestedPullRequest = String(process.env.RETENTION_PR_NUMBER || '').trim();
const outputPath = process.env.RETENTION_REPORT || 'test-results/actions-retention.json';
const apiBase = process.env.GITHUB_API_URL || 'https://api.github.com';
const dryRun = String(process.env.RETENTION_DRY_RUN || '').toLowerCase() === 'true';
const DAY_MS = 86_400_000;

if (!repository || !token) throw new Error('GITHUB_REPOSITORY and GITHUB_TOKEN are required');

const headers = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'vyrnforge-actions-retention'
};

async function githubResponse(endpoint, { method = 'GET' } = {}) {
  return requestWithBackoff(`${apiBase}/repos/${repository}${endpoint}`, { method, headers });
}

async function githubJson(endpoint) {
  const response = await githubResponse(endpoint);
  if (!response.ok) throw new Error(`GitHub API ${endpoint} failed: ${response.status} ${await response.text()}`);
  return response.json();
}

async function listPages(endpoint, key = null, maxPages = 50) {
  const values = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const separator = endpoint.includes('?') ? '&' : '?';
    const data = await githubJson(`${endpoint}${separator}per_page=100&page=${page}`);
    const pageValues = key ? data[key] || [] : data;
    values.push(...pageValues);
    if (pageValues.length < 100) return values;
  }
  throw new Error(`GitHub API pagination incomplete for ${endpoint}: exceeded ${maxPages} pages`);
}

async function listWorkflowRuns() { return listPages('/actions/runs', 'workflow_runs'); }
async function readEventPayload() { if (!eventPath) return {}; return JSON.parse(await readFile(eventPath, 'utf8')); }

async function requestedMergedPullRequest() {
  if (!requestedPullRequest) return null;
  const number = Number(requestedPullRequest);
  if (!Number.isInteger(number) || number < 1) throw new Error(`Invalid RETENTION_PR_NUMBER: ${requestedPullRequest}`);
  const pullRequest = await githubJson(`/pulls/${number}`);
  if (!pullRequest.merged_at) throw new Error(`Pull request #${number} is not merged; refusing merged-PR cleanup`);
  return pullRequest;
}

let closedPullRequestsCache;
async function listClosedPullRequests() {
  if (!closedPullRequestsCache) {
    closedPullRequestsCache = await listPages('/pulls?state=closed&sort=updated&direction=desc');
  }
  return closedPullRequestsCache;
}
async function listMergedPullRequests() {
  const merged = new Map();
  const payload = await readEventPayload();
  if ((eventName === 'pull_request' || eventName === 'pull_request_target') && payload.pull_request?.merged) merged.set(Number(payload.pull_request.number), payload.pull_request);
  const pullRequests = await listClosedPullRequests();
  for (const pullRequest of pullRequests) if (pullRequest.merged_at) merged.set(Number(pullRequest.number), pullRequest);
  return [...merged.values()];
}

async function deleteWorkflowRun(runId) {
  if (dryRun) return { id: runId, status: 'would-delete' };
  const endpoint = `/actions/runs/${runId}`;
  const response = await githubResponse(endpoint, { method: 'DELETE' });
  if (response.status === 204) return { id: runId, status: 'deleted' };
  if (response.status === 404) return { id: runId, status: 'already-absent' };
  return { id: runId, status: 'failed', httpStatus: response.status, error: await response.text() };
}

function combinedPlan(mergedPlan, agePlan) {
  const deletionCap = Number(policy.maxDeletionsPerRun || 0);
  const deletionsById = new Map();
  for (const deletion of mergedPlan.deletions) deletionsById.set(deletion.id, deletion);
  for (const deletion of agePlan.deletions) if (!deletionsById.has(deletion.id)) deletionsById.set(deletion.id, deletion);
  const candidates = [...deletionsById.values()];
  return { mergedHistory: mergedPlan, ageBased: agePlan, candidateCount: candidates.length, deletionCap, deletions: candidates.slice(0, deletionCap), deferredByCap: Math.max(0, candidates.length - deletionCap) };
}

function encodeRef(name) { return name.split('/').map(encodeURIComponent).join('/'); }
async function listOpenPullRequests() { return listPages('/pulls?state=open'); }

async function branchRecords(defaultBranch, closedPullRequests, openPullRequests, issueEntries) {
  if (!issueEntries.some((item) => Number.isInteger(item.number) && !item.pull_request)) {
    throw new Error('GitHub Issue index is empty or incomplete; refusing branch deletion');
  }
  const allPullRequests = [...closedPullRequests, ...openPullRequests];
  const protectedNames = protectedBranchNames(openPullRequests, { defaultBranch, repository });
  const protectedPrefixes = branchPolicy.protectedPrefixes || [];
  const explicitNames = new Set(branchPolicy.protectedBranches || []);
  const branches = await listPages('/branches');

  return mapLimited(branches, 2, async (branch) => {
    const metadata = {
      name: branch.name,
      sha: branch.commit.sha,
      protected: branch.protected === true,
      issueNumbers: linkedIssueNumbersForBranch(branch.name, issueEntries, allPullRequests, { repository }),
      commitDate: null
    };
    if (metadata.protected || protectedNames.has(branch.name) || explicitNames.has(branch.name) ||
        protectedPrefixes.some((prefix) => branch.name.startsWith(prefix)) || metadata.issueNumbers.length) {
      return metadata;
    }

    const commit = await githubJson(`/commits/${branch.commit.sha}`);
    metadata.commitDate = commit.commit?.committer?.date ?? commit.commit?.author?.date ?? null;
    metadata.issueNumbers = linkedIssueNumbersForBranch(branch.name, issueEntries, allPullRequests, {
      repository, commitMessage: commit.commit?.message || ''
    });
    await new Promise((resolve) => { setTimeout(resolve, 150); });
    return metadata;
  });
}

async function branchRef(name) {
  const response = await githubResponse(`/git/ref/heads/${encodeRef(name)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub API branch ref ${name} failed: ${response.status} ${await response.text()}`);
  return response.json();
}

async function deleteBranch(name) {
  if (dryRun) return { name, status: 'would-delete' };
  const response = await githubResponse(`/git/refs/heads/${encodeRef(name)}`, { method: 'DELETE' });
  if (response.status === 204) return { name, status: 'deleted' };
  if (response.status === 404) return { name, status: 'already-absent' };
  return { name, status: 'failed', httpStatus: response.status, error: await response.text() };
}

async function cleanupStaleBranches() {
  const repositoryInfo = await githubJson('');
  const defaultBranch = repositoryInfo.default_branch;
  const openPullRequests = await listOpenPullRequests();
  const closedPullRequests = await listClosedPullRequests();
  // GitHub's Issues endpoint includes PRs; the linker filters PR records out.
  // Exhaust pagination; partial issue data must not be treated as "no issue".
  const issueEntries = await listPages('/issues?state=all');
  const branches = await branchRecords(defaultBranch, closedPullRequests, openPullRequests, issueEntries);
  const plan = planBranchDeletions(branches, openPullRequests, branchPolicy, { defaultBranch, repository });
  const results = [];

  // Re-read Issues before mutation so new issue associations protect their heads.
  const freshIssueEntries = plan.deletions.length ? await listPages('/issues?state=all') : issueEntries;
  if (!freshIssueEntries.some((item) => Number.isInteger(item.number) && !item.pull_request)) {
    throw new Error('Current GitHub Issue index is empty; refusing branch deletion');
  }
  for (const candidate of plan.deletions) {
    const freshOpenPullRequests = await listOpenPullRequests();
    const protectedNames = protectedBranchNames(freshOpenPullRequests, { defaultBranch, repository });
    if (protectedNames.has(candidate.name)) { results.push({ name: candidate.name, status: 'skipped', reason: 'open-pr-created-during-run' }); continue; }

    const issueNumbers = linkedIssueNumbersForBranch(
      candidate.name, freshIssueEntries, [...closedPullRequests, ...freshOpenPullRequests], { repository }
    );
    if (issueNumbers.length) { results.push({ name: candidate.name, status: 'skipped', reason: 'new-issue-link', issueNumbers }); continue; }

    const ref = await branchRef(candidate.name);
    if (!ref) { results.push({ name: candidate.name, status: 'already-absent' }); continue; }
    if (ref.object?.sha !== candidate.sha) { results.push({ name: candidate.name, status: 'skipped', reason: 'branch-moved-during-run' }); continue; }

    results.push(await deleteBranch(candidate.name));
    if (!dryRun) await new Promise((resolve) => { setTimeout(resolve, 400); });
  }

  return {
    policy: branchPolicy,
    plan,
    results,
    deletedBranches: results.filter((result) => result.status === 'deleted').length,
    failedBranches: results.filter((result) => result.status === 'failed').length
  };
}

async function writeReport(report) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

const report = { generatedAt: new Date().toISOString(), repository, trigger: eventName, dryRun, mode: null, policy, plan: null, results: [], branchCleanup: null };

try {
  const runs = await listWorkflowRuns();
  const requested = await requestedMergedPullRequest();
  if (requested) {
    report.mode = 'merged-pull-request';
    report.pullRequest = { number: requested.number, headBranch: requested.head?.ref || null, mergedAt: requested.merged_at || null };
    report.plan = planMergedPullRequestRunDeletions(runs, policy, requested, { currentRunId });
  } else {
    const mergedPullRequests = await listMergedPullRequests();
    const mergedPlan = planMergedPullRequestHistoryDeletions(runs, policy, mergedPullRequests, { currentRunId });
    if (eventName === 'schedule' || eventName === 'workflow_dispatch') {
      report.mode = 'merged-history-and-age-based';
      // A merged PR's latest success remains useful until it exceeds the normal
      // age limit; it must not be protected forever by the merged-history sweep.
      const agePlan = planRunDeletions(runs, policy, { currentRunId });
      report.plan = combinedPlan(mergedPlan, agePlan);
    } else {
      report.mode = 'merged-pull-request-history';
      report.plan = mergedPlan;
    }
  }

  for (const deletion of report.plan.deletions) {
    report.results.push(await deleteWorkflowRun(deletion.id));
    // GitHub DELETE operations cost more API points than reads. Keep sustained
    // deletion traffic under the secondary-rate-limit budget.
    if (!dryRun) await new Promise((resolve) => { setTimeout(resolve, 400); });
  }
  if (eventName === 'schedule' || eventName === 'workflow_dispatch') report.branchCleanup = await cleanupStaleBranches();

  report.completedAt = new Date().toISOString();
  report.deletedRuns = report.results.filter((result) => result.status === 'deleted').length;
  report.alreadyAbsentRuns = report.results.filter((result) => result.status === 'already-absent').length;
  report.failedRuns = report.results.filter((result) => result.status === 'failed').length;
  await writeReport(report);
  if (report.failedRuns > 0) throw new Error(`${report.failedRuns} workflow-run deletion(s) failed`);
  if (report.branchCleanup?.failedBranches > 0) throw new Error(`${report.branchCleanup.failedBranches} branch deletion(s) failed`);
} catch (error) {
  report.completedAt = new Date().toISOString();
  report.error = error instanceof Error ? error.message : String(error);
  await writeReport(report);
  throw error;
}
