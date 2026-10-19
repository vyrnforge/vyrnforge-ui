import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { planRunDeletions } from './retention.mjs';

const policy = JSON.parse(await readFile('tooling/actions/retention-policy.json', 'utf8'));
const repository = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const currentRunId = process.env.GITHUB_RUN_ID;
const outputPath = process.env.RETENTION_REPORT || 'test-results/actions-retention.json';

if (!repository || !token) throw new Error('GITHUB_REPOSITORY and GITHUB_TOKEN are required');
const [owner, repo] = repository.split('/');
const headers = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'vyrnforge-actions-retention'
};

const runs = [];
for (let page = 1; page <= 20; page += 1) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=100&page=${page}`, { headers });
  if (!response.ok) throw new Error(`Failed to list workflow runs: ${response.status} ${await response.text()}`);
  const data = await response.json();
  const pageRuns = data.workflow_runs || [];
  runs.push(...pageRuns);
  if (pageRuns.length < 100) break;
}

const plan = planRunDeletions(runs, policy, { currentRunId });
const report = {
  generatedAt: new Date().toISOString(),
  repository,
  mode: 'dry-run',
  policy,
  plan
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
