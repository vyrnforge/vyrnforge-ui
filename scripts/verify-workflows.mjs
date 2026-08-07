import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workflowsDir = path.join(root, ".github/workflows");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  assert(
    existsSync(absolutePath),
    `missing required infrastructure file: ${relativePath}`,
  );
  return readFileSync(absolutePath, "utf8").replaceAll("\r\n", "\n");
}

function assertNoLongLivedToken(text, file) {
  for (const forbidden of [
    "NPM_TOKEN",
    "NODE_AUTH_TOKEN",
    "PERSONAL_ACCESS_TOKEN",
  ]) {
    assert(
      !text.includes(forbidden),
      `${file}: forbidden long-lived credential reference ${forbidden}`,
    );
  }
}

/**
 * Parse every GitHub Actions `uses:` reference from a workflow.
 *
 * Supported references:
 * - Local reusable workflows/actions: ./path/to/action
 * - Remote actions/workflows: owner/repository[/path]@ref
 *
 * A human-readable version comment can follow the reference, for example:
 * actions/checkout@<40-character-sha> # v7
 */
function parseActionUses(text) {
  const references = [];
  const pattern = /^\s*(?:-\s*)?uses:\s*([^\s#]+)(?:\s+#\s*(\S+))?\s*$/gm;

  for (const match of text.matchAll(pattern)) {
    const spec = match[1];
    const versionComment = match[2] ?? null;

    if (spec.startsWith("./")) {
      references.push({
        type: "local",
        spec,
        action: spec,
        ref: null,
        versionComment,
      });
      continue;
    }

    const separator = spec.lastIndexOf("@");
    assert(separator > 0, `invalid external action reference: ${spec}`);

    references.push({
      type: "external",
      spec,
      action: spec.slice(0, separator),
      ref: spec.slice(separator + 1),
      versionComment,
    });
  }

  return references;
}

/**
 * Require every external GitHub Action to use an immutable full commit SHA.
 * Local reusable workflows/actions remain valid without SHA pinning.
 */
function assertPinnedExternalActions(text, file) {
  for (const reference of parseActionUses(text)) {
    if (reference.type === "local") continue;

    assert(
      /^[0-9a-f]{40}$/.test(reference.ref),
      `${file}: ${reference.action} must be pinned to a full 40-character commit SHA`,
    );

    assert(
      reference.versionComment,
      `${file}: ${reference.action}@${reference.ref} must preserve a readable version comment`,
    );
  }
}

/**
 * Verify that a specific Action exists, is SHA-pinned, and keeps the expected
 * human-readable version comment used by Dependabot and reviewers.
 */
function assertPinnedActionVersion(text, file, action, expectedVersion) {
  const references = parseActionUses(text).filter(
    (reference) => reference.type === "external" && reference.action === action,
  );

  assert(references.length > 0, `${file} must use ${action}`);

  for (const reference of references) {
    assert(
      /^[0-9a-f]{40}$/.test(reference.ref),
      `${file}: ${action} must be pinned to a full 40-character commit SHA`,
    );

    assert(
      reference.versionComment === expectedVersion,
      `${file}: ${action} must preserve the version comment # ${expectedVersion}`,
    );
  }
}

const ci = read(".github/workflows/ci.yml");
assert(
  /pull_request:\s*[\s\S]*branches:\s*[\s\S]*- main/.test(ci),
  "ci.yml must run for pull requests targeting main",
);
assert(
  /push:\s*[\s\S]*branches:\s*[\s\S]*- main/.test(ci),
  "ci.yml must run for pushes to main",
);
assert(
  ci.includes("workflow_dispatch:"),
  "ci.yml must allow manual full validation",
);
assert(
  !/^\s*paths(?:-ignore)?:/m.test(ci),
  "ci.yml must not use workflow path filters",
);
assert(
  ci.includes("name: ci-gate"),
  "ci.yml must expose the stable ci-gate check",
);
assert(
  !ci.includes("  quality:\n"),
  "ci.yml must remove the temporary quality aggregate job",
);
assert(
  !ci.includes("  external-consumer:\n"),
  "ci.yml must remove the temporary external-consumer aggregate job",
);
assert(
  ci.includes("if: always()"),
  "ci.yml aggregate checks must run with always()",
);
const ciGateSection = ci.slice(ci.indexOf("  ci-gate:"));
for (const dependency of [
  "plan",
  "quality-checks",
  "integration-checks",
  "security-checks",
]) {
  assert(
    ciGateSection.includes(`- ${dependency}`),
    `ci-gate must depend on ${dependency}`,
  );
}
for (const requiredToken of [
  "PLAN_RESULT",
  "QUALITY_RESULT",
  "INTEGRATION_RESULT",
  "SECURITY_RESULT",
  "scripts/write-ci-summary.mjs",
]) {
  assert(
    ciGateSection.includes(requiredToken),
    `ci-gate must evaluate ${requiredToken}`,
  );
}
assert(
  !/continue-on-error:\s*true/.test(ciGateSection),
  "ci-gate must not conceal dependency failures",
);
assert(
  ci.includes("scripts/detect-ci-scope.mjs"),
  "ci.yml must use the native impact planner",
);
assert(
  read("scripts/detect-ci-scope.mjs").includes("--diff-filter=ACDMRTUXB"),
  "CI planner must include deleted files in its impact diff",
);
assert(!ci.includes("npm publish"), "ci.yml must never publish packages");
assertNoLongLivedToken(ci, "ci.yml");

for (const workflow of [
  "_quality.yml",
  "_integration.yml",
  "_compatibility.yml",
  "_security.yml",
]) {
  const text = read(`.github/workflows/${workflow}`);
  assert(
    text.includes("workflow_call:"),
    `${workflow} must be reusable through workflow_call`,
  );
  assert(
    /permissions:\s*\n\s*contents: read/.test(text),
    `${workflow} must default to contents: read`,
  );
  assert(
    !text.includes("npm publish"),
    `${workflow} must not publish packages`,
  );
  assert(!text.includes("pages: write"), `${workflow} must not deploy Pages`);
  assert(
    !text.includes("id-token: write"),
    `${workflow} must not request OIDC`,
  );
  assertNoLongLivedToken(text, workflow);
}

const scopedQuality = read("scripts/run-scoped-quality.mjs");
assert(
  !scopedQuality.includes('"verify:ci"'),
  "scoped quality must not call the removed verify:ci aggregate",
);
assert(
  !scopedQuality.includes('"quality"'),
  "scoped quality must not call the removed quality aggregate",
);
for (const command of [
  "format:check",
  "lint",
  "lint:css",
  "verify:package-boundaries",
  "test:contracts",
  "verify:metadata",
  "verify:validation-model",
  "test:coverage",
  "fixtures:test:prepared",
  "fixtures:build:prepared",
  "typecheck",
]) {
  assert(
    scopedQuality.includes(`"${command}"`),
    `scoped quality must run ${command}`,
  );
}
assert(
  scopedQuality.includes("CI_SCOPE_METADATA"),
  "scoped quality must run repository contracts only for metadata scope or full mode",
);
assert(
  !scopedQuality.includes("--if-present"),
  "scoped quality must not silently skip missing mandatory scripts",
);
assert(
  read("scripts/detect-ci-scope.mjs").includes("apps/regression-fixtures/"),
  "CI planner must classify regression fixture changes explicitly",
);
assert(
  read("scripts/verify-toolchain.mjs").includes(
    "apps/regression-fixtures/package.json",
  ),
  "toolchain verification must include the regression fixture workspace",
);
assert(
  ci.includes("fixtures: ${{ steps.scope.outputs.fixtures }}"),
  "ci.yml must expose the planned fixture scope",
);
assert(
  ci.includes("browser: ${{ steps.scope.outputs.browser }}"),
  "ci.yml must expose the planned browser scope",
);
assert(
  ci.includes("if: needs.plan.outputs.integration == 'true'"),
  "ci.yml must run integration checks only when integration is planned",
);
assert(
  ci.includes("fixtures: ${{ needs.plan.outputs.fixtures == 'true' }}"),
  "ci.yml must pass fixture scope into the reusable quality workflow",
);
assert(
  read(".github/workflows/_quality.yml").includes("CI_SCOPE_FIXTURES"),
  "reusable quality workflow must pass fixture scope to the scoped runner",
);
assert(
  read(".github/workflows/_quality.yml").includes(
    "CI_SCOPE_HISTORICAL_EVIDENCE",
  ),
  "reusable quality workflow must pass historical evidence scope explicitly",
);
assert(
  read("scripts/detect-ci-scope.mjs").includes("tests/browser/"),
  "CI planner must classify browser contract tests explicitly",
);
const integrationWorkflow = read(".github/workflows/_integration.yml");
assert(
  ci.includes(
    "pages-artifact: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}",
  ),
  "ci.yml must create the Pages site artifact only for a main push",
);
for (const marker of [
  "  integration:",
  "selected-integration",
  "Install dependencies once",
  "Prepare selected package outputs once",
  "VYRNFORGE_PACKAGES_PREPARED",
  "npm run test:browser",
  "npm run verify:packages",
  "npm run verify:beta-package-artifacts",
  "npm run verify:consumer",
  "npm run verify:repository-inventory",
  "npm run build --workspace @vyrnforge/ui-docs",
  "npm run build --workspace @vyrnforge/ui-data-grid-basic-playground",
  "playwright-report/",
  "test-results/visual-evidence/",
  "pages-artifact:",
  "RUN_PAGES_ARTIFACT",
  "VITE_BASE_PATH: /vyrnforge-ui/",
  "Assemble Pages site once",
  "pages-site-${{ github.sha }}",
  "include-hidden-files: true",
]) {
  assert(
    integrationWorkflow.includes(marker),
    `_integration.yml must include ${marker}`,
  );
}
assertPinnedActionVersion(
  integrationWorkflow,
  "_integration.yml",
  "actions/upload-artifact",
  "v7.0.1",
);
const integrationJobsSection = integrationWorkflow.slice(
  integrationWorkflow.indexOf("jobs:\n"),
);
assert(
  (integrationJobsSection.match(/^ {2}[a-z][a-z0-9-]+:\s*$/gmu) ?? [])
    .length === 1,
  "integration workflow must contain exactly one job",
);
const playwrightConfig = read("playwright.config.ts");
assert(
  playwrightConfig.includes("VYRNFORGE_PACKAGES_PREPARED"),
  "Playwright must reuse package output prepared by the integration owner",
);

for (const removedWorkflow of [
  "_browser.yml",
  "_packages.yml",
  "_consumer.yml",
  "_docs.yml",
]) {
  assert(
    !existsSync(path.join(workflowsDir, removedWorkflow)),
    `${removedWorkflow} must be consolidated into _integration.yml`,
  );
}

const securityWorkflow = read(".github/workflows/_security.yml");
for (const marker of [
  "dependency-review:",
  "drift:",
  "if: inputs.drift",
  "npm audit --omit=dev --audit-level=high",
  "actionlint -color",
  "shellcheck --version",
  "npm run verify:security-workflow-hardening",
  "npm run verify:workflows",
]) {
  assert(
    securityWorkflow.includes(marker),
    `_security.yml must include ${marker}`,
  );
}
assert(
  ci.includes("if: needs.plan.outputs.security == 'true'"),
  "CI security must run only when the planner selects it",
);
assert(
  !ci.includes("uses: ./.github/workflows/_compatibility.yml"),
  "pull-request and main CI must leave compatibility drift to nightly",
);

const rootPackage = JSON.parse(read("package.json"));
assert(
  rootPackage.scripts["test:visual"] ===
    "playwright test tests/browser/visual-regression.spec.ts --project=chromium",
  "package.json must expose the canonical visual-regression browser command",
);
for (const command of ["check", "test", "build", "ci"]) {
  assert(
    typeof rootPackage.scripts[command] === "string",
    `package.json must expose the public ${command} command`,
  );
}
for (const deprecated of ["quality", "verify:ci"]) {
  assert(
    !(deprecated in rootPackage.scripts),
    `package.json must remove the duplicated ${deprecated} aggregate`,
  );
}
for (const command of [
  "format:check",
  "lint",
  "lint:css",
  "verify:metadata",
  "verify:package-boundaries",
  "verify:workflows",
  "verify:validation-model",
  "typecheck",
]) {
  assert(
    rootPackage.scripts.check.includes(`npm run ${command}`),
    `root check command must include ${command}`,
  );
}
for (const command of [
  "check",
  "test:contracts",
  "test:coverage",
  "build:packages",
  "fixtures:test:prepared",
  "fixtures:build:prepared",
  "test:browser",
  "verify:packages",
  "verify:consumer",
  "verify:consumer-foundations:runtime",
  "build:applications",
]) {
  assert(
    rootPackage.scripts.ci.includes(`npm run ${command}`),
    `root ci command must include ${command}`,
  );
}
for (const workflow of [
  "ci.yml",
  "_quality.yml",
  "_integration.yml",
  "_compatibility.yml",
  "_security.yml",
]) {
  const text = read(`.github/workflows/${workflow}`);
  assert(
    !/continue-on-error:\s*true/.test(text),
    `${workflow} must not conceal mandatory quality failures`,
  );
  assert(
    !text.includes("--if-present"),
    `${workflow} must not silently skip missing mandatory scripts`,
  );
}

const pages = read(".github/workflows/pages.yml");
assert(
  /permissions:\s*\n\s*actions: read\s*\n\s*contents: read/.test(pages),
  "pages.yml must default to Actions and repository read access",
);
assert(
  pages.includes("workflow_run:"),
  "pages.yml must deploy only after the main CI workflow completes",
);
assert(
  pages.includes('workflows: ["VyrnForge CI"]'),
  "pages.yml must be gated by VyrnForge CI",
);
assert(
  !/^\s*push:/m.test(pages),
  "pages.yml must not race CI through an independent push trigger",
);
assert(
  pages.includes("github.event.workflow_run.conclusion == 'success'"),
  "pages.yml must require successful CI",
);
assert(
  pages.includes("github.event.workflow_run.event == 'push'"),
  "pages.yml must accept automatic deployment only from a push CI run",
);
assert(
  pages.includes("ci-run-id:"),
  "manual Pages deployment must require an existing CI run ID",
);
for (const marker of [
  "name: prepare-pages",
  'gh api "repos/$GITHUB_REPOSITORY/actions/runs/$RUN_ID"',
  'gh api "repos/$GITHUB_REPOSITORY/commits/main"',
  'test "$WORKFLOW_NAME" = "VyrnForge CI"',
  'test "$RUN_EVENT" = "push"',
  'test "$HEAD_BRANCH" = "main"',
  'test "$CONCLUSION" = "success"',
  'test "$HEAD_SHA" = "$CURRENT_MAIN_SHA"',
  'gh run download "${{ steps.candidate.outputs.run-id }}"',
  '--name "pages-site-${{ steps.candidate.outputs.head-sha }}"',
  "--dir site",
  "test -f site/index.html",
  "test -f site/playground/index.html",
  "test -f site/.nojekyll",
]) {
  assert(pages.includes(marker), `pages.yml must include ${marker}`);
}
for (const forbidden of [
  "actions/checkout@",
  "actions/setup-node@",
  "actions/download-artifact@",
  "npm ci",
  "npm run ",
  "build:packages",
]) {
  assert(
    !pages.includes(forbidden),
    `pages.yml must deploy the verified CI artifact without ${forbidden}`,
  );
}
assert(
  pages.includes("pages: write"),
  "pages.yml deploy job must have pages: write",
);
assertPinnedActionVersion(
  pages,
  "pages.yml",
  "actions/configure-pages",
  "v6.0.0",
);
assertPinnedActionVersion(
  pages,
  "pages.yml",
  "actions/upload-pages-artifact",
  "v5.0.0",
);
assertPinnedActionVersion(pages, "pages.yml", "actions/deploy-pages", "v5.0.0");
assert(!pages.includes("npm publish"), "pages.yml must not publish packages");
assertNoLongLivedToken(pages, "pages.yml");

const release = read(".github/workflows/release.yml");
assert(
  release.includes("workflow_dispatch:"),
  "release.yml must be manually dispatched",
);
assert(
  release.includes("release-group:"),
  "release.yml must require an explicit BT-8002 release group",
);
for (const releaseGroup of ["non-grid-beta", "data-grid-alpha"]) {
  assert(
    release.includes(releaseGroup),
    `release.yml must expose the ${releaseGroup} release group`,
  );
}
assert(
  release.includes('--release-group "$RELEASE_GROUP"'),
  "release.yml must pass the selected release group to release tooling",
);
assert(
  !/^\s*(push|pull_request|schedule):/m.test(release),
  "release.yml must not publish from automatic triggers",
);
assert(
  release.includes("name: verify-release"),
  "release.yml must separate candidate verification",
);
assert(
  release.includes("name: publish-packages"),
  "release.yml must separate npm publication",
);
assert(
  release.includes("name: verify-registry-release"),
  "release.yml must verify registry artifacts after publication",
);
assert(
  release.includes("name: create-release-record"),
  "release.yml must separate GitHub release recording",
);
assert(
  release.includes("environment:\n      name: npm-release"),
  "release publish job must use npm-release environment",
);
const publishSection = release.slice(
  release.indexOf("  publish-packages:"),
  release.indexOf("  verify-registry-release:"),
);
const releaseRecordSection = release.slice(
  release.indexOf("  create-release-record:"),
);
assert(
  publishSection.includes("id-token: write"),
  "release publish job must request OIDC",
);
assert(
  !publishSection.includes("contents: write"),
  "release publish job must not write repository contents",
);
assert(
  releaseRecordSection.includes("contents: write"),
  "release record job must receive repository write permission",
);
assert(
  !releaseRecordSection.includes("id-token: write"),
  "release record job must not request npm OIDC",
);
assert(
  release.includes("scripts/verify-registry-release.mjs"),
  "release.yml must run fresh registry-consumer verification",
);
for (const packageName of ["ui-behaviors", "ui-elements"]) {
  assert(
    publishSection.includes(`Publish ${packageName} through npm OIDC`),
    `non-grid beta publication must include ${packageName}`,
  );
}
assert(
  publishSection.includes("if: inputs.release-group == 'non-grid-beta'"),
  "beta package publication must be guarded by the non-grid release group",
);
assert(
  publishSection.includes("if: inputs.release-group == 'data-grid-alpha'"),
  "ui-data-grid publication must be guarded by the independent alpha group",
);
const registryVerifier = read("scripts/verify-registry-release.mjs");
assert(
  registryVerifier.includes("dist?.attestations?.url"),
  "registry release verification must require npm provenance attestations",
);
assert(
  registryVerifier.includes('["audit", "signatures"'),
  "registry release verification must cryptographically verify registry signatures and attestations",
);
assert(
  release.includes("playwright install --with-deps chromium"),
  "release verification must install Chromium before the authoritative quality command",
);
assert(
  release.includes("npm run verify:assistive-technology:release"),
  "beta release verification must require complete manual assistive-technology evidence",
);
assert(
  release.includes("scripts/create-release-notes.mjs"),
  "release.yml must generate a release record from source",
);
for (const marker of [
  "uses: ./.github/workflows/_compatibility.yml",
  "uses: ./.github/workflows/_security.yml",
  "- compatibility-checks",
  "- security-checks",
  "npm run verify:beta-package-artifacts",
  "npm run verify:beta-package-size-budgets",
]) {
  assert(release.includes(marker), `release.yml must include ${marker}`);
}
assertNoLongLivedToken(release, "release.yml");

const nightly = read(".github/workflows/nightly.yml");
assert(nightly.includes("schedule:"), "nightly.yml must define a schedule");
assert(
  nightly.includes("workflow_dispatch:"),
  "nightly.yml must allow manual execution",
);
assert(
  !nightly.includes('node-version: "22"'),
  "nightly.yml must not use the retired Node 22 development baseline",
);
assert(
  nightly.includes('node-version: "24.18.0"'),
  "nightly.yml must use the pinned Node 24 LTS baseline",
);
assert(
  nightly.includes("uses: ./.github/workflows/_integration.yml"),
  "nightly.yml must execute full integration and build checks",
);
assert(
  nightly.includes("pages-artifact: false"),
  "nightly.yml must not create a deployable Pages artifact",
);
assert(
  nightly.includes("uses: ./.github/workflows/_compatibility.yml"),
  "nightly.yml must execute the compatibility release matrix",
);
assert(
  nightly.includes("uses: ./.github/workflows/_security.yml"),
  "nightly.yml must execute security validation",
);
assert(
  nightly.includes("name: nightly-gate"),
  "nightly.yml must expose a final gate",
);
assert(
  !nightly.includes("npm publish"),
  "nightly.yml must not publish packages",
);
assert(
  !nightly.includes("id-token: write"),
  "nightly.yml must not request OIDC",
);
assertNoLongLivedToken(nightly, "nightly.yml");

// Validate every workflow file, including future workflows added to this directory.
const workflowFiles = readdirSync(workflowsDir)
  .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
  .sort();

for (const workflow of workflowFiles) {
  const text = read(`.github/workflows/${workflow}`);

  assertPinnedExternalActions(text, workflow);

  const isCompatibilityWorkflow = workflow === "_compatibility.yml";
  if (!isCompatibilityWorkflow) {
    assert(
      !text.includes('node-version: "22"') && !text.includes('default: "22"'),
      `${workflow} must not use Node 22 outside the compatibility matrix`,
    );
  }

  for (const match of text.matchAll(
    /node-version:[ \t]*["']?([^\s"']+)["']?/g,
  )) {
    const value = match[1];
    if (value.startsWith("${{")) continue;
    const allowed = isCompatibilityWorkflow
      ? ["22.12.0", "24.18.0"]
      : ["24.18.0"];
    assert(
      allowed.includes(value),
      `${workflow}: explicit Node version must be ${allowed.join(" or ")}, received ${value}`,
    );
  }

  if (text.includes("uses: actions/checkout@")) {
    assertPinnedActionVersion(text, workflow, "actions/checkout", "v7");
  }

  if (text.includes("uses: actions/setup-node@")) {
    assertPinnedActionVersion(text, workflow, "actions/setup-node", "v7");
  }

  if (text.includes("uses: actions/upload-artifact@")) {
    assertPinnedActionVersion(
      text,
      workflow,
      "actions/upload-artifact",
      "v7.0.1",
    );
  }
}

for (const relativePath of [
  "docs/engineering/ci-cd-architecture.md",
  "docs/release/release-responsibility-matrix.md",
]) {
  assert(
    existsSync(path.join(root, relativePath)),
    `missing CI/CD source-of-truth document: ${relativePath}`,
  );
}

console.log(`Workflow contracts passed for ${workflowsDir}`);
