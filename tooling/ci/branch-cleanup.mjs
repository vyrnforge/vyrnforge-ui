import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { planBranchDeletions, protectedBranchNames } from './branch-retention.mjs';

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const apiBase = process.env.GITHUB_API_URL ?? 'https://api.github.com';
const policyPath = new URL('./branch-retention-policy.json', import.meta.url);
const reportPath = process.env.BRANCH_CLEANUP_REPORT ?? 'test-results/branch-cleanup.json';

if (!token) throw new Error('GITHUB_TOKEN is required');
if (!repository) throw new Error('GITHUB_REPOSITORY is required');

const [owner, repo] = repository.split('/');
if (!owner || !repo) throw new Error(`Invalid GITHUB_REPOSITORY: ${repository}`);

async function github(apiPath, { method = 'GET', expected = [200], body } = {}) {
  const response = await fetch(`${apiBase}${apiPath}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'vyrnforge-branch-cleanup',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!expected.includes(response.status)) {
    const detail = await response.text();
    throw new Error(`${method} ${apiPath} failed with ${response.status}: ${detail}`);
  }

  if (response.status === 204) return null;
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

function encodeRef(name) {
  return name.split('/').map(encodeURIComponent).join('/');
}

async function loadBranches() {
  const branches = await listAll(`/repos/${owner}/${repo}/branches`);
  return Promise.all(branches.map(async (branch) => {
    const commit = await github(`/repos/${owner}/${repo}/commits/${branch.commit.sha}`);
    return {
      name: branch.name,
      sha: branch.commit.sha,
      protected: branch.protected === true,
      commitDate: commit.commit?.committer?.date ?? commit.commit?.author?.date ?? null,
    };
  }));
}

async function loadOpenPullRequests() {
  return listAll(`/repos/${owner}/${repo}/pulls?state=open`);
}

async function currentRef(name) {
  return github(`/repos/${owner}/${repo}/git/ref/heads/${encodeRef(name)}`, { expected: [200, 404] });
}

async function main() {
  const policy = JSON.parse(await fs.readFile(policyPath, 'utf8'));
  const repositoryInfo = await github(`/repos/${owner}/${repo}`);
  const defaultBranch = repositoryInfo.default_branch;
  const [branches, openPullRequests] = await Promise.all([loadBranches(), loadOpenPullRequests()]);

  const plan = planBranchDeletions(branches, openPullRequests, policy, {
    defaultBranch,
    repository,
  });

  const report = {
    generatedAt: new Date().toISOString(),
    repository,
    defaultBranch,
    staleDays: policy.staleDays,
    candidateCount: plan.candidateCount,
    deferredByCap: plan.deferredByCap,
    deleted: [],
    skipped: [...plan.skipped],
    failed: [],
  };

  for (const candidate of plan.deletions) {
    try {
      const freshOpenPullRequests = await loadOpenPullRequests();
      const freshProtectedNames = protectedBranchNames(freshOpenPullRequests, { defaultBranch, repository });
      if (freshProtectedNames.has(candidate.name)) {
        report.skipped.push({ name: candidate.name, reason: 'open-pr-created-during-run' });
        continue;
      }

      const ref = await currentRef(candidate.name);
      if (!ref) {
        report.skipped.push({ name: candidate.name, reason: 'already-deleted' });
        continue;
      }
      if (ref.object?.sha !== candidate.sha) {
        report.skipped.push({ name: candidate.name, reason: 'branch-moved-during-run' });
        continue;
      }

      await github(`/repos/${owner}/${repo}/git/refs/heads/${encodeRef(candidate.name)}`, {
        method: 'DELETE',
        expected: [204],
      });
      report.deleted.push({ name: candidate.name, sha: candidate.sha, commitDate: candidate.commitDate });
      console.log(`Deleted stale branch: ${candidate.name}`);
    } catch (error) {
      report.failed.push({ name: candidate.name, error: error instanceof Error ? error.message : String(error) });
      console.error(`Failed to delete ${candidate.name}:`, error);
    }
  }

  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    const lines = [
      '# Stale branch cleanup',
      '',
      `- Stale threshold: ${policy.staleDays} days`,
      `- Candidates: ${plan.candidateCount}`,
      `- Deleted: ${report.deleted.length}`,
      `- Deferred by cap: ${plan.deferredByCap}`,
      `- Failed: ${report.failed.length}`,
      '',
    ];
    if (report.deleted.length) {
      lines.push('## Deleted branches', '', ...report.deleted.map((item) => `- \`${item.name}\``), '');
    }
    if (report.failed.length) {
      lines.push('## Failures', '', ...report.failed.map((item) => `- \`${item.name}\`: ${item.error}`), '');
    }
    await fs.appendFile(summaryPath, `${lines.join('\n')}\n`);
  }

  if (report.failed.length) process.exitCode = 1;
}

await main();
