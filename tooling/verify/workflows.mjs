import { readFile } from 'node:fs/promises';

const files = {
  pr: '.github/workflows/ci.yml',
  main: '.github/workflows/main.yml',
  targeted: '.github/workflows/_targeted-validation.yml',
  scheduled: '.github/workflows/scheduled.yml',
  release: '.github/workflows/release.yml',
  docs: '.github/workflows/docs-pages.yml',
  retention: '.github/workflows/actions-retention.yml',
  impact: 'tooling/impact/plan.mjs',
  impactClassify: 'tooling/impact/classify.mjs',
  impactHelpers: 'tooling/impact/helpers.mjs',
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

for (const label of ['pr', 'main', 'targeted', 'scheduled', 'release']) {
  requireReadOnlyContents(sources[label], label);
  forbidText(sources[label], 'npm ci', `${label} must not use the retired npm workspace install path`);
  forbidText(sources[label], 'git push', `${label} validation must not mutate source refs`);
  for (const publishCommand of ['changeset publish', 'npm publish', 'pnpm publish']) {
    forbidText(sources[label], publishCommand, `${label} must not publish packages during the private rebuild`);
  }
  forbidText(sources[label], 'paths-ignore:', `${label} must not encode duplicate path-selection truth in workflow YAML`);
}

for (const label of ['targeted', 'scheduled', 'release']) {
  requireText(sources[label], 'pnpm install --frozen-lockfile --ignore-scripts', `${label} must install the committed pnpm dependency graph`);
  requireText(sources[label], 'tooling/impact/plan.mjs', `${label} must use the shared semantic-impact modelg);
}

requireText(sources.pr, 'pull_request:', 'PR validation must run for pull requests');
forbidText(sources.pr, '\n  push:', 'PR validation must not double as push validation');
requireText(sources.pr, 'uses: ./.github/workflows/_targeted-validation.yml', 'PR validation must delegate shared execution to the reusable targeted workflow');
requireText(sources.pr, 'mode: pr', 'PR validation must request impact-scoped PR mode');
requireText(sources.pr, 'github.event.pull_request.base.sha', 'PR validation must provide a base SHA');
requireText(sources.pr, 'github.sha', 'PR validation must provide a head SHA');
requireText(sources.pr, 'ci-gate:', 'PR validation must preserve the protected ci-gate identity');

requireText(sources.main, 'push:', 'Main validation must run on push');
requireText(sources.main, 'branches: [main]', 'Main validation must target the main branch');
requireText(sources.main, 'uses: ./.github/workflows/_targeted-validation.yml', 'Main validation must delegate shared execution to the reusable targeted workflow');
requireText(sources.main, 'mode: main', 'Main validation must request impact-scoped main mode');
requireText(sources.main, 'github.event.before', 'Main validation must provide the merged-change base SHA');
requireText(sources.main, 'github.sha', 'Main validation must tie evidence to the validated commit');
requireText(sources.main, 'main-gate:', 'Main validation must preserve the main-gate identity');

requireText(sources.targeted, 'workflow_call:', 'shared targeted validation must be reusable from PR/Main wrappers');
requireText(sources.targeted, 'nx affected -t lint,typecheck,test,build', 'generic affected execution must remain owned by Nx');
requireText(sources.targeted, 'pnpm verify:package-contracts', 'repository contracts must enforce private package/public-entrypoint invariants');
requireText(sources.targeted, 'pnpm verify:compatibility', 'repository contracts must enforce compatibility metadata alignment');
requireText(sources.targeted, 'package_artifact_packages', 'packed package selection must come from the semantic plan');
requireText(sources.targeted, 'VF_PACKAGE_SCOPE', 'targeted packed-package verification must consume the planned package roots');
requireText(sources.targeted, 'browser_scopes', 'targeted browser selection must include component-aware scopes');
requireText(sources.targeted, 'fromJSON(needs.plan.outputs.browser_scopes)', 'targeted browser matrix must consume component-aware semantic scopes');
requireText(sources.targeted, 'VF_COMPONENTS', 'targeted browser execution must pass the selected component scope to Playwright/fixtures');
requireText(sources.targeted, 'tooling/validation/summarize.mjs', 'targeted validation must emit an execution/evidence summary');
requireText(sources.targeted, 'validation-summary-', 'targeted validation must retain the evidence summary as an artifact');
requireText(sources.targeted, 'vyrnforge-docs-next-${{ inputs.head_sha }}', 'Main-targeted docs must retain exact-head artifact lineage');

requireText(sources.scheduled, 'schedule:', 'Scheduled assurance must have a schedule');
requireText(sources.scheduled, 'workflow_dispatch:', 'Scheduled assurance must support manual execution');
requireText(sources.scheduled, '--mode scheduled', 'Scheduled assurance must execute the scheduled broad tier through the shared model');
requireText(sources.scheduled, 'pnpm verify:packages', 'Scheduled assurance must retain exhaustive packed-package/consumer evidence');
requireText(sources.scheduled, 'chromium firefox webkit', 'Scheduled assurance must retain broad cross-browser evidence');
requireText(sources.scheduled, 'fromJSON(needs.plan.outputs.browser_ports)', 'Scheduled browser matrix must consume discovered broad ports from the semantic plan');

requireText(sources.release, 'workflow_dispatch:', 'Release readiness must support manual execution');
requireText(sources.release, "- 'v*'", 'Release readiness must run for release tags');
requireText(sources.release, '--mode release', 'Release readiness must execute the release broad tier through the shared model');
requireText(sources.release, 'pnpm verify:release', 'Release readiness must validate Changesets release intent');
requireText(sources.release, 'pnpm verify:packages', 'Release readiness must retain exhaustive packed-package/API/consumer evidence');
requireText(sources.release, 'pnpm build:docs', 'Release readiness must retain documentation evidence');
requireText(sources.release, 'pnpm test:browser:cross', 'Release readiness must retain broad cross-browser evidence');
requireText(sources.release, 'fromJSON(needs.plan.outputs.browser_ports)', 'Release browser matrix must consume discovered broad ports from the semantic plan');

const impactSource = [sources.impact, sources.impactClassify, sources.impactHelpers].join('\n');
for (const command of ["execFileSync('pnpm'", "execFileSync('nx'", "execFileSync('playwright'", 'spawn(', 'spawnSync(']) {
  forbidText(impactSource, command, 'semantic-impact tooling must classify evidence, not execute generic tasks or browser/package commands');
}
requireText(impactSource, "orchestration: 'nx'", 'semantic-impact report must declare Nx as generic orchestration owner');
requireText(impactSource, 'validationScopes:', 'semantic-impact plans must expose logical validation scopes');
requireText(impactSource, 'executionPrerequisites:', 'semantic-impact plans must distinguish execution prerequisites from evidence');
requireText(impactSource, 'browserScopes,', 'semantic-impact plans must expose component-aware browser scopes');
requireText(impactSource, 'packageArtifactPackages,', 'semantic-impact plans must expose targeted packed-package roots');
requireText(impactSource, 'reasons:', 'semantic-impact plans must explain why scopes were selected');
requireText(impactSource, 'unknownPaths:', 'semantic-impact plans must expose unclassified paths');

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

process.stdout.write('workflow contracts: reusable targeted validation, scoped evidence, pnpm security, private rebuild posture, Nx ownership, broad safety nets, artifact lineage, and mutation boundaries ok\n');
