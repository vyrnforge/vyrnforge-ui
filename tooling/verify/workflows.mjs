import { readFile } from 'node:fs/promises';

const files = {
  pr: '.github/workflows/ci.yml',
  main: '.github/workflows/main.yml',
  scheduled: '.github/workflows/scheduled.yml',
  release: '.github/workflows/release.yml',
  docs: '.github/workflows/docs-pages.yml',
  retention: '.github/workflows/actions-retention.yml',
};

const sources = Object.fromEntries(await Promise.all(
  Object.entries(files).map(async ([key, file]) => [key, await readFile(file, 'utf8')]),
));

function requireText(source, text, message) {
  if (!source.includes(text)) throw new Error(`workflow contract: ${message}`);
}

function forbidText(source, text, message) {
  if (source.includes(text)) throw new Error(`workflow contract: ${message}`);
}

function requireReadOnlyContents(source, label) {
  requireText(source, 'contents: read', `${label} must have read-only repository contents access`);
  forbidText(source, 'contents: write', `${label} must not mutate repository contents`);
}

for (const label of ['pr', 'main', 'scheduled', 'release']) {
  requireReadOnlyContents(sources[label], label);
  requireText(sources[label], 'package-manager-cache: false', `${label} must not implicitly cache a package manager before the pinned pnpm toolchain is activated`);
  requireText(sources[label], 'corepack enable', `${label} must enable Corepack before using pnpm`);
  requireText(sources[label], 'corepack install --global pnpm@12.16.1', `${label} must activate the repository-pinned pnpm version`);
  requireText(sources[label], 'pnpm install --frozen-lockfile --ignore-scripts', `${label} must install the committed dependency graph with a frozen pnpm lockfile`);
  forbidText(sources[label], 'npm ci', `${label} must not use the retired npm workspace install path`);
  forbidText(sources[label], 'git push', `${label} validation must not mutate source refs`);
}

requireText(sources.pr, 'pull_request:', 'PR validation must run for pull requests');
forbidText(sources.pr, '\n  push:', 'PR validation must not double as push validation');
requireText(sources.pr, '--mode pr', 'PR validation must use impact-scoped PR mode');
requireText(sources.pr, 'BASE_SHA', 'PR validation must provide a base SHA');
requireText(sources.pr, 'HEAD_SHA', 'PR validation must provide a head SHA');

requireText(sources.main, 'push:', 'Main validation must run on push');
requireText(sources.main, 'main', 'Main validation must target the main branch');
requireText(sources.main, '--mode main', 'Main validation must use impact-scoped main mode');
forbidText(sources.main, '--mode full', 'Main push validation must not silently become exhaustive validation');
requireText(sources.main, '${{ github.sha }}', 'Main validation evidence must be tied to the validated commit');

requireText(sources.scheduled, 'schedule:', 'Scheduled assurance must have a schedule');
requireText(sources.scheduled, 'workflow_dispatch:', 'Scheduled assurance must support manual execution');
requireText(sources.scheduled, '--mode scheduled', 'Scheduled assurance must execute the scheduled validation tier');

requireText(sources.release, 'workflow_dispatch:', 'Release readiness must support manual execution');
requireText(sources.release, "- 'v*'", 'Release readiness must run for release tags');
requireText(sources.release, '--mode release', 'Release readiness must execute the release validation tier');

requireReadOnlyContents(sources.docs, 'Documentation Pages');
requireText(sources.docs, 'workflow_run:', 'Documentation Pages must promote validated workflow output');
requireText(sources.docs, 'Main Validation', 'Documentation Pages must consume Main Validation output');
requireText(sources.docs, 'types: [completed]', 'Documentation Pages must wait for Main Validation completion');
requireText(sources.docs, "run.conclusion !== 'success'", 'Documentation Pages must reject unsuccessful validation runs');
requireText(sources.docs, 'run.head_sha !== expectedHeadSha', 'Documentation Pages must verify artifact commit lineage');
requireText(sources.docs, 'deploy-pages', 'Documentation Pages must deploy through the Pages deployment action');
forbidText(sources.docs, 'actions/checkout@', 'Documentation Pages promotion must not rebuild from repository source');
forbidText(sources.docs, 'npm ci', 'Documentation Pages promotion must not reinstall the retired npm toolchain');
forbidText(sources.docs, 'pnpm install', 'Documentation Pages promotion must not reinstall the validated pnpm toolchain');
forbidText(sources.docs, 'npm run build:docs', 'Documentation Pages promotion must not rebuild validated docs through npm');
forbidText(sources.docs, 'pnpm build:docs', 'Documentation Pages promotion must not rebuild validated docs through pnpm');

requireReadOnlyContents(sources.retention, 'Actions Retention');
requireText(sources.retention, 'pull_request_target:', 'Actions Retention must react to merged pull requests');
requireText(sources.retention, 'schedule:', 'Actions Retention must have periodic cleanup');
requireText(sources.retention, 'workflow_dispatch:', 'Actions Retention must support manual cleanup');
requireText(sources.retention, 'actions: write', 'Actions Retention needs narrowly scoped Actions write access');
requireText(sources.retention, 'github.event.repository.default_branch', 'Actions Retention must execute trusted default-branch code');
requireText(sources.retention, 'tooling/ci/retention-cleanup.mjs', 'Actions Retention must use the maintained cleanup implementation');
forbidText(sources.retention, 'npm ci', 'Actions Retention must not install the retired npm product dependency graph');
forbidText(sources.retention, 'pnpm install', 'Actions Retention must not install the product dependency graph');

process.stdout.write('workflow contracts: security, trigger, pnpm bootstrap, validation-mode, artifact-lineage, and mutation boundaries ok\n');
