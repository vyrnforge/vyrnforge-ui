import { readFile } from 'node:fs/promises';

const files = {
  pr: '.github/workflows/ci.yml',
  main: '.github/workflows/main.yml',
  targeted: '.github/workflows/_targeted-validation.yml',
  browser: '.github/workflows/_browser-validation.yml',
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

for (const label of ['pr', 'main', 'targeted', 'browser', 'scheduled', 'release']) {
  requireReadOnlyContents(sources[label], label);
  forbidText(sources[label], 'npm ci', `${label} must not use the retired npm workspace install path`);
  forbidText(sources[label], 'git push', `${label} validation must not mutate source refs`);
  for (const publishCommand of ['changeset publish', 'npm publish', 'pnpm publish']) {
    forbidText(sources[label], publishCommand, `${label} must not publish packages during the private rebuild`);
  }
  forbidText(sources[label], 'paths-ignore:', `${label} must not encode duplicate path-selection truth in workflow YAML`);
}

for (const label of ['targeted', 'browser', 'scheduled', 'release']) {
  requireText(sources[label], 'pnpm install --frozen-lockfile --ignore-scripts', `${label} must install the committed pnpm dependency graph`);
}
for (const label of ['targeted', 'scheduled', 'release']) {
  requireText(sources[label], 'tooling/impact/plan.mjs', `${label} must use the shared semantic-impact model`);
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
requireText(sources.targeted, 'pnpm format:configs:check', 'targeted PR/Main validation must reject configuration-format drift before merge');
requireText(sources.targeted, 'nx affected -t lint,typecheck,test,build', 'generic affected execution must remain owned by Nx');
requireText(sources.targeted, 'pnpm verify:package-contracts', 'repository contracts must enforce private package/public-entrypoint invariants');
requireText(sources.targeted, 'pnpm verify:compatibility', 'repository contracts must enforce compatibility metadata alignment');
requireText(sources.targeted, 'pnpm verify:validation', 'repository contracts must test validation-summary reporting');
requireText(sources.targeted, 'package_artifact_packages', 'packed package selection must come from the semantic plan');
requireText(sources.targeted, 'VF_PACKAGE_SCOPE', 'targeted packed-package verification must consume the planned package roots');
requireText(sources.targeted, 'browser_scopes', 'targeted browser selection must include component-aware scopes');
requireText(sources.targeted, 'uses: ./.github/workflows/_browser-validation.yml', 'targeted browser evidence must use shared prerequisite-aware execution');
requireText(sources.targeted, 'scopes_json: ${{ needs.plan.outputs.browser_scopes }}', 'targeted browser execution must consume component-aware semantic scopes');
requireText(sources.targeted, 'playwright_project: chromium', 'PR/Main browser evidence must remain Chromium-targeted');
requireText(sources.targeted, 'validation-metrics-', 'targeted validation must collect executor timing metrics where available');
requireText(sources.targeted, '--metrics-dir test-results/validation-metrics', 'targeted summaries must retain prerequisite/browser timing data');
requireText(sources.targeted, 'tooling/validation/summarize.mjs', 'targeted validation must emit an execution/evidence summary');
requireText(sources.targeted, 'validation-summary-', 'targeted validation must retain the evidence summary as an artifact');
requireText(sources.targeted, 'vyrnforge-docs-next-${{ inputs.head_sha }}', 'Main-targeted docs must retain exact-head artifact lineage');

requireText(sources.browser, 'workflow_call:', 'browser execution must be a reusable evidence executor');
requireText(sources.browser, 'fromJSON(inputs.scopes_json)', 'browser executor must consume planned component × port scopes');
requireText(sources.browser, 'VF_COMPONENT_PORT', 'browser executor must retain per-port isolation');
requireText(sources.browser, 'VF_COMPONENTS', 'browser executor must pass selected components to Playwright/fixture preparation');
requireText(sources.browser, 'actions/cache@v6', 'browser prerequisite reuse must use the current Node 24 cache action');
requireText(sources.browser, '.cache/ms-playwright', 'browser binaries must use an explicit reusable cache path');
requireText(sources.browser, 'browser-build-${{ inputs.revision }}-', 'shared browser build artifacts must be tied to the exact validated revision');
requireText(sources.browser, 'pnpm exec playwright install ${{ inputs.browsers }}', 'widest selected browser binaries must be prepared once');
requireText(sources.browser, 'pnpm exec playwright install-deps ${{ inputs.browsers }}', 'isolated runners must still provision required OS browser dependencies');
requireText(sources.browser, 'fail-on-cache-miss: true', 'browser lanes must fail closed if prepared prerequisites cannot be restored');
requireText(sources.browser, 'pnpm build', 'shared browser prerequisites must be produced through the Nx build graph');
requireText(sources.browser, 'package-build-outputs.tgz', 'browser lanes must restore immutable package build outputs instead of sharing Nx local cache state');
forbidText(sources.browser, '.nx/cache', 'browser execution must not copy Nx local caches between machines');
requireText(sources.browser, 'validation-metrics-browser-prerequisites-', 'browser prerequisite timing must be retained');
requireText(sources.browser, 'validation-metrics-browser-${{ matrix.scope.port }}-', 'per-port browser timing must be retained');
requireText(sources.browser, 'browser-evidence-${{ matrix.scope.port }}-', 'each browser port must retain independent evidence artifacts');

requireText(sources.scheduled, 'schedule:', 'Scheduled assurance must have a schedule');
requireText(sources.scheduled, 'workflow_dispatch:', 'Scheduled assurance must support manual execution');
requireText(sources.scheduled, '--mode scheduled', 'Scheduled assurance must execute the scheduled broad tier through the shared model');
requireText(sources.scheduled, 'pnpm verify:packages', 'Scheduled assurance must retain exhaustive packed-package/consumer evidence');
requireText(sources.scheduled, 'browser_scopes', 'Scheduled assurance must expose the discovered broad component × port scopes');
requireText(sources.scheduled, 'uses: ./.github/workflows/_browser-validation.yml', 'Scheduled browser evidence must use shared prerequisite-aware execution');
requireText(sources.scheduled, 'chromium firefox webkit', 'Scheduled assurance must retain broad cross-browser evidence');
requireText(sources.scheduled, 'scopes_json: ${{ needs.plan.outputs.browser_scopes }}', 'Scheduled browser execution must consume discovered broad semantic scopes');

requireText(sources.release, 'workflow_dispatch:', 'Release readiness must support manual execution');
requireText(sources.release, "- 'v*'", 'Release readiness must run for release tags');
requireText(sources.release, '--mode release', 'Release readiness must execute the release broad tier through the shared model');
requireText(sources.release, 'pnpm verify:release', 'Release readiness must validate Changesets release intent');
requireText(sources.release, 'pnpm verify:packages', 'Release readiness must retain exhaustive packed-package/API/consumer evidence');
requireText(sources.release, 'pnpm build:docs', 'Release readiness must retain documentation evidence');
requireText(sources.release, 'browser_scopes', 'Release readiness must expose the discovered broad component × port scopes');
requireText(sources.release, 'uses: ./.github/workflows/_browser-validation.yml', 'Release browser evidence must use shared prerequisite-aware execution');
requireText(sources.release, 'chromium firefox webkit', 'Release readiness must retain broad cross-browser evidence');
requireText(sources.release, 'scopes_json: ${{ needs.plan.outputs.browser_scopes }}', 'Release browser execution must consume discovered broad semantic scopes');
requireText(sources.release, 'publication and required human AT/usability acceptance remain separate', 'Release readiness must state the private-rebuild machine/human evidence boundary');

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

process.stdout.write('workflow contracts: reusable targeted/browser validation, scoped evidence, measured prerequisite reuse, pnpm security, private rebuild posture, Nx ownership, broad safety nets, artifact lineage, and mutation boundaries ok\n');
