import { readFile } from 'node:fs/promises';

const files = {
  pr: '.github/workflows/ci.yml',
  main: '.github/workflows/main.yml',
  scheduled: '.github/workflows/scheduled.yml',
  release: '.github/workflows/release.yml',
  docs: '.github/workflows/docs-pages.yml',
  retention: '.github/workflows/actions-retention.yml',
  impact: 'tooling/impact/plan.mjs',
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
  requireText(sources[label], 'pnpm install --frozen-lockfile --ignore-scripts', `${label} must install the committed pnpm dependency graph`);
  forbidText(sources[label], 'npm ci', `${label} must not use the retired npm workspace install path`);
  forbidText(sources[label], 'git push', `${label} validation must not mutate source refs`);
  requireText(sources[label], 'tooling/impact/plan.mjs', `${label} must use the shared semantic-impact model`);
  forbidText(sources[label], 'paths-ignore:', `${label} must not encode duplicate path-selection truth in workflow YAML`);
}

requireText(sources.pr, 'pull_request:', 'PR validation must run for pull requests');
forbidText(sources.pr, '\n  push:', 'PR validation must not double as push validation');
requireText(sources.pr, '--mode pr', 'PR validation must use impact-scoped PR mode');
requireText(sources.pr, 'BASE_SHA', 'PR validation must provide a base SHA');
requireText(sources.pr, 'HEAD_SHA', 'PR validation must provide a head SHA');
requireText(sources.pr, 'nx affected -t lint,typecheck,test,build', 'PR generic affected execution must remain owned by Nx');
requireText(sources.pr, 'package_artifacts_required', 'PR package evidence must be selected from the semantic plan');
requireText(sources.pr, 'browser_ports', 'PR browser ports must be selected from the semantic plan');
requireText(sources.pr, 'fromJSON(needs.plan.outputs.browser_ports)', 'PR browser matrix must consume the plan rather than a hand-maintained component matrix');
requireText(sources.pr, 'ci-gate:', 'PR validation must expose one final selected-evidence gate');

requireText(sources.main, 'push:', 'Main validation must run on push');
requireText(sources.main, 'branches: [main]', 'Main validation must target the main branch');
requireText(sources.main, '--mode main', 'Main validation must use impact-scoped main mode');
forbidText(sources.main, '--mode full', 'Main push validation must not silently become exhaustive validation');
requireText(sources.main, 'nx affected -t lint,typecheck,test,build', 'Main generic affected execution must remain owned by Nx');
requireText(sources.main, 'package_artifacts_required', 'Main package evidence must be selected from the semantic plan');
requireText(sources.main, 'browser_ports', 'Main browser ports must be selected from the semantic plan');
requireText(sources.main, '${{ github.sha }}', 'Main validation evidence must be tied to the validated commit');
requireText(sources.main, 'main-gate:', 'Main validation must aggregate selected evidence');

requireText(sources.scheduled, 'schedule:', 'Scheduled assurance must have a schedule');
requireText(sources.scheduled, 'workflow_dispatch:', 'Scheduled assurance must support manual execution');
requireText(sources.scheduled, '--mode scheduled', 'Scheduled assurance must execute the scheduled broad tier through the shared model');
requireText(sources.scheduled, 'pnpm verify:packages', 'Scheduled assurance must retain packed-package/consumer evidence');
requireText(sources.scheduled, 'chromium firefox webkit', 'Scheduled assurance must retain broad cross-browser evidence');

requireText(sources.release, 'workflow_dispatch:', 'Release readiness must support manual execution');
requireText(sources.release, "- 'v*'", 'Release readiness must run for release tags');
requireText(sources.release, '--mode release', 'Release readiness must execute the release broad tier through the shared model');
requireText(sources.release, 'pnpm verify:release', 'Release readiness must validate Changesets release intent');
requireText(sources.release, 'pnpm verify:packages', 'Release readiness must retain packed-package/API/consumer evidence');
requireText(sources.release, 'pnpm build:docs', 'Release readiness must retain documentation evidence');
requireText(sources.release, 'pnpm test:browser:cross', 'Release readiness must retain broad cross-browser evidence');

for (const command of ["execFileSync('pnpm'", "execFileSync('nx'", "execFileSync('playwright'", 'spawn(', 'spawnSync(']) {
  forbidText(sources.impact, command, 'semantic-impact tooling must classify evidence, not execute generic tasks or browser/package commands');
}
requireText(sources.impact, "orchestration: 'nx'", 'semantic-impact report must declare Nx as generic orchestration owner');
requireText(sources.impact, 'reasons:', 'semantic-impact plans must explain why scopes were selected');
requireText(sources.impact, 'unknownPaths:', 'semantic-impact plans must expose unclassified paths');

requireReadOnlyContents(sources.docs, 'Documentation Pages');
requireText(sources.docs, 'workflow_run:', 'Documentation Pages must promote validated workflow output');
requireText(sources.docs, 'Main Validation', 'Documentation Pages must consume Main Validation output');
requireText(sources.docs, 'types: [completed]', 'Documentation Pages must wait for Main Validation completion');
requireText(sources.docs, "run.conclusion !== 'success'", 'Documentation Pages must reject unsuccessful validation runs');
requireText(sources.docs, 'run.head_sha !== expectedHeadSha', 'Documentation Pages must verify artifact commit lineage');
requireText(sources.docs, 'deploy-pages', 'Documentation Pages must deploy through the Pages deployment action');
forbidText(sources.docs, 'actions/checkout@', 'Documentation Pages promotion must not rebuild from repository source');
forbidText(sources.docs, 'pnpm install', 'Documentation Pages promotion must not reinstall the toolchain');
forbidText(sources.docs, 'pnpm build:docs', 'Documentation Pages promotion must not rebuild validated docs');

requireText(sources.retention, 'contents: write', 'Repository Retention needs repository contents write access to delete stale branch refs');
requireText(sources.retention, 'pull_request_target:', 'Repository Retention must react to merged pull requests');
requireText(sources.retention, 'schedule:', 'Repository Retention must have periodic cleanup');
requireText(sources.retention, 'workflow_dispatch:', 'Repository Retention must support manual cleanup');
requireText(sources.retention, 'actions: write', 'Repository Retention needs narrowly scoped Actions write access');
requireText(sources.retention, 'pull-requests: read', 'Repository Retention needs pull-request read access to protect active branch heads and bases');
requireText(sources.retention, 'github.event.repository.default_branch', 'Repository Retention must execute trusted default-branch code');
requireText(sources.retention, 'tooling/ci/retention-cleanup.mjs', 'Repository Retention must use the maintained cleanup implementation');
forbidText(sources.retention, 'pnpm install', 'Repository Retention must not install the product dependency graph');

process.stdout.write('workflow contracts: pnpm security, shared semantic modes, Nx execution ownership, broad safety nets, artifact lineage, and mutation boundaries ok\n');
