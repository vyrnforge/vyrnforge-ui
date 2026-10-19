import { readFile } from 'node:fs/promises';

const contracts = {
  '.github/workflows/ci.yml': ['pull_request:', 'name: ci-gate', '--mode pr', 'validation-plan-pr'],
  '.github/workflows/main.yml': ['branches: [main]', '--mode main', 'validation-plan-main', 'vyrnforge-docs-next'],
  '.github/workflows/scheduled.yml': ['schedule:', 'workflow_dispatch:', '--mode scheduled', 'validation-plan-scheduled'],
  '.github/workflows/release.yml': ["- 'v*'", '--mode release', 'validation-plan-release'],
  '.github/workflows/docs-pages.yml': ['pages: write', 'id-token: write', 'npm run build:docs', 'npm run verify:docs-site', 'actions/deploy-pages@v4']
};

for (const [file, required] of Object.entries(contracts)) {
  const source = await readFile(file, 'utf8');
  for (const fragment of required) {
    if (!source.includes(fragment)) throw new Error(`${file} is missing required workflow contract fragment: ${fragment}`);
  }
}

const pr = await readFile('.github/workflows/ci.yml', 'utf8');
const committingLock = pr.includes('bootstrap-lock-commit');
if (/push:\s*\n\s*branches:\s*\[main\]/.test(pr)) throw new Error('PR workflow must not double as the main validation tier');
if (committingLock) {
  if (!pr.includes('contents: write') || !pr.includes('git push origin')) throw new Error('temporary lock commit mode must be explicit and complete');
} else {
  if (!pr.includes('contents: read')) throw new Error('steady-state PR validation must remain read-only');
  if (pr.includes('contents: write')) throw new Error('steady-state PR validation must remain read-only');
  if (!pr.includes('cache: npm')) throw new Error('steady-state PR validation must cache npm from the committed lockfile');
  if (!pr.includes('npm ci --ignore-scripts --no-audit --no-fund')) throw new Error('steady-state PR validation must use npm ci');
  if (pr.includes('npm install --')) throw new Error('steady-state PR validation must not regenerate its dependency graph');
  if (/git\s+push/.test(pr)) throw new Error('steady-state PR validation must not mutate its source branch');
}
process.stdout.write(`workflow contracts: ok${committingLock ? ' (temporary lock commit)' : ''}\n`);
