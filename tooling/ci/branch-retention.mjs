import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const DAY_MS = 86_400_000;

export function protectedBranchNames(openPullRequests, { defaultBranch, repository }) {
  const names = new Set([defaultBranch]);
  for (const pullRequest of openPullRequests) {
    if (pullRequest?.base?.repo?.full_name === repository && pullRequest?.base?.ref) names.add(pullRequest.base.ref);
    if (pullRequest?.head?.repo?.full_name === repository && pullRequest?.head?.ref) names.add(pullRequest.head.ref);
  }
  return names;
}

function matchesPrefix(name, prefixes) {
  return prefixes.some((prefix) => name.startsWith(prefix));
}

export function planBranchDeletions(branches, openPullRequests, policy, {
  now = new Date(),
  defaultBranch = 'main',
  repository,
} = {}) {
  if (!repository) throw new Error('repository is required');
  const protectedNames = protectedBranchNames(openPullRequests, { defaultBranch, repository });
  const explicitNames = new Set(policy.protectedBranches ?? []);
  const protectedPrefixes = policy.protectedPrefixes ?? [];
  const staleBefore = now.getTime() - policy.staleDays * DAY_MS;
  const candidates = [];
  const skipped = [];

  for (const branch of branches) {
    const name = branch.name;
    if (protectedNames.has(name) || explicitNames.has(name)) {
      skipped.push({ name, reason: 'protected-name-or-open-pr' });
      continue;
    }
    if (branch.protected) {
      skipped.push({ name, reason: 'github-protected' });
      continue;
    }
    if (matchesPrefix(name, protectedPrefixes)) {
      skipped.push({ name, reason: 'protected-prefix' });
      continue;
    }
    const commitTime = Date.parse(branch.commitDate ?? '');
    if (!Number.isFinite(commitTime)) {
      skipped.push({ name, reason: 'unknown-commit-date' });
      continue;
    }
    if (commitTime > staleBefore) {
      skipped.push({ name, reason: 'not-stale' });
      continue;
    }
    candidates.push({ name, sha: branch.sha, commitDate: branch.commitDate, reason: 'stale' });
  }

  candidates.sort((left, right) =>
    Date.parse(left.commitDate) - Date.parse(right.commitDate) || left.name.localeCompare(right.name));
  const maxDeletions = Math.max(0, policy.maxDeletionsPerRun ?? 0);
  return {
    deletions: candidates.slice(0, maxDeletions),
    deferredByCap: Math.max(0, candidates.length - maxDeletions),
    candidateCount: candidates.length,
    skipped,
    protectedBranches: [...protectedNames].sort(),
  };
}

function encodeRef(name) {
  return name.split('/').map(encodeURIComponent).join('/');
}

async function runCleanup() {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  const apiBase = process.env.GITHUB_API_URL ?? 'https://api.github.com';
  const reportPath = process.env.BRANCH_CLEANUP_REPORT ?? 'test-results/branch-cleanup.json';
  if (!token) throw new Error('GITHUB_TOKEN is required');
  if (!repository) throw new Error('GITHUB_REPOSITORY is required');
  const [owner, repo] = repository.split('/');
  if (!owner || !repo) throw new Error(`Invalid GITHUB_REPOSITORY: ${repository}`);

  async function github(apiPath, { method = 'GET', expected = [200] } = {}) {
    const response = await fetch(`${apiBase}${apiPath}`, {
      method,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'vyrnforge-branch-retention',
      },
    });
    if (!expected.includes(response.status)) {
      const detail = await response.text();
      throw new Error(`${method} ${apiPath} failed with ${response.status}: ${detail}`);
    }
    if (response.status === 204 || response.status === 404) return null;
    return response.json();
  }

  async function listAll(apiPath) {
    const results = [];
    for (let page = 1; ; page += 1) {
      const separator = apiPath.includes('?') ? '&' : '?';
      const items = await github(`${apiPath}${separator}per_page=100&page=${page}`);
      results.push(...items);
      if (items.length < 100) return results;
    }
  }

  async function loadOpenPullRequests() {
    return listAll(`/repos/${owner}/${repo}/pulls?state=open`);
  }

  const policy = JSON.parse(await fs.readFile(new URL('./branch-retention-policy.json', import.meta.url), 'utf8'));
  const repositoryInfo = await github(`/repos/${owner}/${repo}`);
  const defaultBranch = repositoryInfo.default_branch;
  const branchRecords = await listAll(`/repos/${owner}/${repo}/branches`);
  const branches = await Promise.all(branchRecords.map(async (branch) => {
    const commit = await github(`/repos/${owner}/${repo}/commits/${branch.commit.sha}`);
    return {
      name: branch.name,
      sha: branch.commit.sha,
      protected: branch.protected === true,
      commitDate: commit.commit?.committer?.date ?? commit.commit?.author?.date ?? null,
    };
  }));
  const openPullRequests = await loadOpenPullRequests();
  const plan = planBranchDeletions(branches, openPullRequests, policy, { defaultBranch, repository });
  const report = {
    generatedAt: new Date().toISOString(), repository, defaultBranch, staleDays: policy.staleDays,
    candidateCount: plan.candidateCount, deferredByCap: plan.deferredByCap,
    deleted: [], skipped: [...plan.skipped], failed: [],
  };

  for (const candidate of plan.deletions) {
    try {
      const freshOpenPullRequests = await loadOpenPullRequests();
      const freshProtectedNames = protectedBranchNames(freshOpenPullRequests, { defaultBranch, repository });
      if (freshProtectedNames.has(candidate.name)) {
        report.skipped.push({ name: candidate.name, reason: 'open-pr-created-during-run' });
        continue;
      }
      const ref = await github(`/repos/${owner}/${repo}/git/ref/heads/${encodeRef(candidate.name)}`, { expected: [200, 404] });
      if (!ref) {
        report.skipped.push({ name: candidate.name, reason: 'already-deleted' });
        continue;
      }
      if (ref.object?.sha !== candidate.sha) {
        report.skipped.push({ name: candidate.name, reason: 'branch-moved-during-run' });
        continue;
      }
      await github(`/repos/${owner}/${repo}/git/refs/heads/${encodeRef(candidate.name)}`, { method: 'DELETE', expected: [204] });
      report.deleted.push({ name: candidate.name, sha: candidate.sha, commitDate: candidate.commitDate });
      console.log(`Removed stale branch: ${candidate.name}`);
    } catch (error) {
      report.failed.push({ name: candidate.name, error: error instanceof Error ? error.message : String(error) });
      console.error(`Failed to remove ${candidate.name}:`, error);
    }
  }

  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, [
      '# Stale branch cleanup', '',
      `- Stale threshold: ${policy.staleDays} days`,
      `- Candidates: ${plan.candidateCount}`,
      `- Removed: ${report.deleted.length}`,
      `- Deferred by cap: ${plan.deferredByCap}`,
      `- Failed: ${report.failed.length}`, '',
    ].join('\n'));
  }
  if (report.failed.length) process.exitCode = 1;
}

if (fileURLToPath(import.meta.url) === process.argv[1] && process.argv.includes('--apply')) {
  await runCleanup();
}
