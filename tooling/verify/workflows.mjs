import { readFile } from 'node:fs/promises';

const workflowFiles = {
  pr: '.github/workflows/ci.yml',
  main: '.github/workflows/main.yml',
  scheduled: '.github/workflows/scheduled.yml',
  release: '.github/workflows/release.yml',
  docs: '.github/workflows/docs-pages.yml',
  retention: '.github/workflows/actions-retention.yml'
};

const sources = Object.fromEntries(await Promise.all(
  Object.entries(workflowFiles).map(async ([key, file]) => [key, await readFile(file, 'utf8')])
));

function fail(message) {
  throw new Error(`workflow contract: ${message}`);
}

function requireMatch(source, pattern, message) {
  if (!pattern.test(source)) fail(message);
}

function forbidMatch(source, pattern, message) {
  if (pattern.test(source)) fail(message);
}

function topLevelBlock(source, key) {
  const lines = source.split('\n');
  const start = lines.findIndex((line) => line === `${key}:`);
  if (start < 0) fail(`missing top-level ${key}: block`);
  const body = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^[^\s#][^:]*:/.test(line)) break;
    body.push(line);
  }
  return body.join('\n');
}

function jobBlock(source, jobName) {
  const jobs = topLevelBlock(source, 'jobs');
  const lines = jobs.split('\n');
  const start = lines.findIndex((line) => line === `  ${jobName}:`);
  if (start < 0) fail(`missing job ${jobName}`);
  const body = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^  [A-Za-z0-9_-]+:\s*$/.test(line)) break;
    body.push(line);
  }
  return body.join('\n');
}

function requireReadOnlyContents(source, label) {
  const permissions = topLevelBlock(source, 'permissions');
  requireMatch(permissions, /^  contents: read$/m, `${label} must grant contents: read`);
  forbidMatch(permissions, /^  contents: write$/m, `${label} must not grant contents: write`);
}

function requireLockedToolchain(job, label) {
  requireMatch(job, /actions\/checkout@v7/, `${label} must use checkout@v7`);
  requireMatch(job, /actions\/setup-node@v7/, `${label} must use setup-node@v7`);
  requireMatch(job, /cache: npm/, `${label} must use npm cache`);
  requireMatch(job, /npm ci --ignore-scripts --no-audit --no-fund/, `${label} must install the committed toolchain with npm ci`);
  forbidMatch(job, /npm install --/, `${label} must not regenerate dependency resolution`);
}

function requireBrowserEvidencePaths(job, label) {
  for (const path of [
    'test-results/playwright-report',
    'test-results/playwright-results',
    'test-results/*-playwright-report',
    'test-results/*-playwright-results'
  ]) {
    if (!job.includes(path)) fail(`${label} browser evidence is missing ${path}`);
  }
}

const prOn = topLevelBlock(sources.pr, 'on');
requireMatch(prOn, /^  pull_request:\s*$/m, 'PR Validation must trigger from pull_request');
forbidMatch(prOn, /^  push:/m, 'PR Validation must not double as a push gate');
requireReadOnlyContents(sources.pr, 'PR Validation');
const prConcurrency = topLevelBlock(sources.pr, 'concurrency');
requireMatch(prConcurrency, /pr-validation-\$\{\{ github\.event\.pull_request\.number \}\}/, 'PR Validation concurrency must be keyed by pull request');
requireMatch(prConcurrency, /cancel-in-progress: true/, 'PR Validation must cancel superseded runs');
const prJob = jobBlock(sources.pr, 'ci-gate');
requireLockedToolchain(prJob, 'PR Validation');
requireMatch(prJob, /--mode pr --base "\$BASE_SHA" --head "\$HEAD_SHA"/, 'PR Validation must execute the impact-scoped PR range');
requireBrowserEvidencePaths(prJob, 'PR Validation');
forbidMatch(prJob, /git\s+push/, 'PR Validation must not mutate its source branch');
forbidMatch(sources.pr, /bootstrap-lock-/, 'temporary bootstrap lock modes must not remain in steady-state CI');

const mainOn = topLevelBlock(sources.main, 'on');
requireMatch(mainOn, /^  push:\s*$/m, 'Main Validation must trigger from push');
requireMatch(mainOn, /branches: \[main\]/, 'Main Validation must target main');
requireReadOnlyContents(sources.main, 'Main Validation');
const mainConcurrency = topLevelBlock(sources.main, 'concurrency');
requireMatch(mainConcurrency, /group: main-validation/, 'Main Validation concurrency group is missing');
requireMatch(mainConcurrency, /cancel-in-progress: true/, 'Main Validation must cancel superseded main runs');
const mainJob = jobBlock(sources.main, 'main-gate');
requireLockedToolchain(mainJob, 'Main Validation');
requireMatch(mainJob, /github\.event\.before/, 'Main Validation must use the pushed base SHA');
requireMatch(mainJob, /--mode main --base "\$BASE_SHA" --head "\$HEAD_SHA"/, 'Main Validation must execute an impact-scoped pushed range');
forbidMatch(mainJob, /Execute broader main validation graph/, 'push-triggered Main must not silently run the exhaustive tier');
requireBrowserEvidencePaths(mainJob, 'Main Validation');
for (const artifact of ['validation-plan-main-${{ github.sha }}', 'browser-evidence-main-${{ github.sha }}', 'vyrnforge-docs-next-${{ github.sha }}']) {
  if (!mainJob.includes(artifact)) fail(`Main Validation artifact must be SHA-bound: ${artifact}`);
}

const scheduledOn = topLevelBlock(sources.scheduled, 'on');
requireMatch(scheduledOn, /^  schedule:\s*$/m, 'Scheduled Assurance must have a schedule trigger');
requireMatch(scheduledOn, /^  workflow_dispatch:\s*$/m, 'Scheduled Assurance must support manual execution');
requireReadOnlyContents(sources.scheduled, 'Scheduled Assurance');
const scheduledConcurrency = topLevelBlock(sources.scheduled, 'concurrency');
requireMatch(scheduledConcurrency, /group: scheduled-assurance/, 'Scheduled Assurance concurrency group is missing');
requireMatch(scheduledConcurrency, /cancel-in-progress: true/, 'Scheduled Assurance must cancel a superseded scheduled run');
const scheduledJob = jobBlock(sources.scheduled, 'scheduled-gate');
requireLockedToolchain(scheduledJob, 'Scheduled Assurance');
requireMatch(scheduledJob, /--mode scheduled/, 'Scheduled Assurance must execute the broad scheduled tier');
requireBrowserEvidencePaths(scheduledJob, 'Scheduled Assurance');

const releaseOn = topLevelBlock(sources.release, 'on');
requireMatch(releaseOn, /^  workflow_dispatch:\s*$/m, 'Release Readiness must support manual execution');
requireMatch(releaseOn, /^  push:\s*$/m, 'Release Readiness must trigger from release tags');
requireMatch(releaseOn, /- 'v\*'/, 'Release Readiness must target v* tags');
requireReadOnlyContents(sources.release, 'Release Readiness');
requireMatch(sources.release, /^name: Release Readiness$/m, 'release.yml must describe readiness rather than imply publication');
const releaseConcurrency = topLevelBlock(sources.release, 'concurrency');
requireMatch(releaseConcurrency, /group: release-readiness-\$\{\{ github\.ref \}\}/, 'Release Readiness must serialize by release ref');
requireMatch(releaseConcurrency, /cancel-in-progress: false/, 'Release Readiness must not cancel an in-flight release validation');
const releaseJob = jobBlock(sources.release, 'release-gate');
requireLockedToolchain(releaseJob, 'Release Readiness');
requireMatch(releaseJob, /--mode release/, 'Release Readiness must execute the broad release tier');
requireBrowserEvidencePaths(releaseJob, 'Release Readiness');

const docsOn = topLevelBlock(sources.docs, 'on');
requireMatch(docsOn, /^  workflow_run:\s*$/m, 'Documentation Pages must promote from workflow_run');
requireMatch(docsOn, /workflows: \["Main Validation"\]/, 'Documentation Pages must consume Main Validation');
requireMatch(docsOn, /types: \[completed\]/, 'Documentation Pages must wait for Main Validation completion');
requireMatch(docsOn, /^  workflow_dispatch:\s*$/m, 'Documentation Pages must support explicit manual promotion');
forbidMatch(docsOn, /^  push:/m, 'Documentation Pages must not independently rebuild on main push');
const docsPermissions = topLevelBlock(sources.docs, 'permissions');
requireMatch(docsPermissions, /^  contents: read$/m, 'Documentation Pages needs read-only contents access');
requireMatch(docsPermissions, /^  actions: read$/m, 'Documentation Pages needs Actions read access for validated artifacts');
forbidMatch(sources.docs, /actions\/checkout@/, 'Documentation Pages must not checkout repository source');
forbidMatch(sources.docs, /npm\s+(ci|install|run\s+build:docs|run\s+verify:docs-site)/, 'Documentation Pages must not rebuild or reverify docs independently');
const docsPrepare = jobBlock(sources.docs, 'prepare');
for (const lineage of ["run.path !== '.github/workflows/main.yml'", "run.conclusion !== 'success'", "run.head_branch !== 'main'", 'run.head_sha !== expectedHeadSha', 'vyrnforge-docs-next-${expectedHeadSha}']) {
  if (!docsPrepare.includes(lineage)) fail(`Documentation Pages lineage check is missing: ${lineage}`);
}
requireMatch(docsPrepare, /actions\/configure-pages@v6/, 'Documentation Pages must configure Pages before artifact upload');
requireMatch(docsPrepare, /actions\/upload-pages-artifact@v5/, 'Documentation Pages must upload the validated docs as the Pages artifact');
const docsDeploy = jobBlock(sources.docs, 'deploy');
requireMatch(docsDeploy, /needs\.prepare\.outputs\.found == 'true'/, 'Documentation Pages deploy must require a resolved validated artifact');
requireMatch(docsDeploy, /pages: write/, 'Documentation Pages deploy needs Pages write permission');
requireMatch(docsDeploy, /id-token: write/, 'Documentation Pages deploy needs OIDC permission');
requireMatch(docsDeploy, /actions\/deploy-pages@v5/, 'Documentation Pages must deploy through deploy-pages');

const retentionOn = topLevelBlock(sources.retention, 'on');
requireMatch(retentionOn, /^  schedule:\s*$/m, 'Actions Retention must have a schedule trigger');
requireMatch(retentionOn, /^  pull_request_target:\s*$/m, 'Actions Retention must react to merged pull requests');
requireMatch(retentionOn, /^  workflow_dispatch:/m, 'Actions Retention must support explicit manual execution');
const retentionPermissions = topLevelBlock(sources.retention, 'permissions');
requireMatch(retentionPermissions, /^  contents: read$/m, 'Actions Retention needs read-only contents access');
requireMatch(retentionPermissions, /^  pull-requests: read$/m, 'Actions Retention needs pull-request read access');
requireMatch(retentionPermissions, /^  actions: write$/m, 'Actions Retention needs narrowly scoped Actions write access');
forbidMatch(retentionPermissions, /^  contents: write$/m, 'Actions Retention must not receive contents write access');
const retentionConcurrency = topLevelBlock(sources.retention, 'concurrency');
requireMatch(retentionConcurrency, /cancel-in-progress: false/, 'Actions Retention cleanup must not cancel an active cleanup');
const retentionJob = jobBlock(sources.retention, 'cleanup');
requireMatch(retentionJob, /ref: \$\{\{ github\.event\.repository\.default_branch \}\}/, 'Actions Retention must execute trusted default-branch code');
requireMatch(retentionJob, /node tooling\/actions\/retention-cleanup\.mjs/, 'Actions Retention must use the repository cleanup implementation');
forbidMatch(retentionJob, /npm\s+(ci|install)/, 'Actions Retention must not install the product toolchain');

for (const [label, source] of Object.entries(sources)) {
  for (const legacyMajor of ['actions/checkout@v4', 'actions/setup-node@v4', 'actions/upload-artifact@v4', 'actions/configure-pages@v5', 'actions/upload-pages-artifact@v3', 'actions/deploy-pages@v4']) {
    if (source.includes(legacyMajor)) fail(`${label} still uses deprecated action major ${legacyMajor}`);
  }
}

process.stdout.write('workflow contracts: ok\n');
