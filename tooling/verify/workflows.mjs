import { readFile } from 'node:fs/promises';

const contracts = {
  '.github/workflows/ci.yml': ['pull_request:', 'name: ci-gate', 'contents: read', 'concurrency:', 'cancel-in-progress: true', 'actions/checkout@v7', 'actions/setup-node@v7', 'actions/upload-artifact@v7', 'cache: npm', 'npm ci --ignore-scripts --no-audit --no-fund', '--mode pr', 'validation-plan-pr', 'browser-evidence-pr'],
  '.github/workflows/main.yml': ['branches: [main]', 'contents: read', 'concurrency:', 'cancel-in-progress: true', 'actions/checkout@v7', 'actions/setup-node@v7', 'actions/upload-artifact@v7', '--mode main', 'validation-plan-main', 'browser-evidence-main', 'vyrnforge-docs-next'],
  '.github/workflows/scheduled.yml': ['schedule:', 'workflow_dispatch:', 'contents: read', 'actions/checkout@v7', 'actions/setup-node@v7', 'actions/upload-artifact@v7', '--mode scheduled', 'validation-plan-scheduled', 'browser-evidence-scheduled'],
  '.github/workflows/release.yml': ["- 'v*'", 'contents: read', 'actions/checkout@v7', 'actions/setup-node@v7', 'actions/upload-artifact@v7', '--mode release', 'validation-plan-release', 'browser-evidence-release'],
  '.github/workflows/docs-pages.yml': ['pages: write', 'id-token: write', 'actions/checkout@v7', 'actions/setup-node@v7', 'actions/configure-pages@v6', 'actions/upload-pages-artifact@v5', 'actions/deploy-pages@v5', 'npm run build:docs', 'npm run verify:docs-site'],
  '.github/workflows/actions-retention.yml': ['schedule:', 'pull_request_target:', 'types: [closed]', 'workflow_dispatch:', 'contents: read', 'pull-requests: read', 'actions: write', 'concurrency:', 'cancel-in-progress: false', 'github.event.pull_request.merged == true', 'github.event.repository.default_branch', 'actions/checkout@v7', 'actions/setup-node@v7', 'node tooling/actions/retention-cleanup.mjs', 'actions-retention-report', 'retention-days: 14']
};

for (const [file, required] of Object.entries(contracts)) {
  const source = await readFile(file, 'utf8');
  for (const fragment of required) {
    if (!source.includes(fragment)) throw new Error(`${file} is missing required workflow contract fragment: ${fragment}`);
  }
}

const pr = await readFile('.github/workflows/ci.yml', 'utf8');
if (/push:\s*\n\s*branches:\s*\[main\]/.test(pr)) throw new Error('PR workflow must not double as the main validation tier');
if (pr.includes('contents: write')) throw new Error('PR validation must remain read-only');
if (pr.includes('bootstrap-lock-')) throw new Error('temporary bootstrap lock modes must not remain in steady-state CI');
if (!pr.includes('cache: npm')) throw new Error('PR validation must cache npm from the committed lockfile');
if (!pr.includes('npm ci --ignore-scripts --no-audit --no-fund')) throw new Error('PR validation must use npm ci');
if (pr.includes('npm install --')) throw new Error('PR validation must not regenerate its dependency graph');
if (/git\s+push/.test(pr)) throw new Error('PR validation must not mutate its source branch');

const retention = await readFile('.github/workflows/actions-retention.yml', 'utf8');
if (!retention.includes('actions: write')) throw new Error('Retention cleanup requires narrowly scoped Actions write permission');
if (retention.includes('contents: write')) throw new Error('Retention cleanup must not receive repository contents write permission');
if (!retention.includes('ref: ${{ github.event.repository.default_branch }}')) throw new Error('Retention cleanup must execute trusted default-branch code when using pull_request_target');
if (/npm\s+(ci|install)/.test(retention)) throw new Error('Retention cleanup must not install the product toolchain');

for (const file of Object.keys(contracts)) {
  const source = await readFile(file, 'utf8');
  for (const legacyMajor of ['actions/checkout@v4', 'actions/setup-node@v4', 'actions/upload-artifact@v4', 'actions/configure-pages@v5', 'actions/upload-pages-artifact@v3', 'actions/deploy-pages@v4']) {
    if (source.includes(legacyMajor)) throw new Error(`${file} still uses deprecated action major ${legacyMajor}`);
  }
}

process.stdout.write('workflow contracts: ok\n');
