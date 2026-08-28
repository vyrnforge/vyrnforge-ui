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
  assert(existsSync(absolutePath), `missing required infrastructure file: ${relativePath}`);
  return readFileSync(absolutePath, "utf8").replaceAll("\r\n", "\n");
}

function assertNoLongLivedToken(text, file) {
  for (const forbidden of ["NPM_TOKEN", "NODE_AUTH_TOKEN", "PERSONAL_ACCESS_TOKEN"]) {
    assert(!text.includes(forbidden), `${file}: forbidden long-lived credential reference ${forbidden}`);
  }
}

function parseActionUses(text) {
  const references = [];
  const pattern = /^\s*(?:-\s*)?uses:\s*([^\s#]+)(?:\s+#\s*(\S+))?\s*$/gm;
  for (const match of text.matchAll(pattern)) {
    const spec = match[1];
    const versionComment = match[2] ?? null;
    if (spec.startsWith("./")) {
      references.push({ type: "local", spec, versionComment });
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

const expectedWorkflowFiles = [
  "assurance.yml",
  "ci.yml",
  "deploy-pages.yml",
  "release.yml",
];
const workflowFiles = readdirSync(workflowsDir)
  .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
  .sort();

assert(
  JSON.stringify(workflowFiles) === JSON.stringify(expectedWorkflowFiles),
  `workflow surface must contain exactly ${expectedWorkflowFiles.join(", ")}; found ${workflowFiles.join(", ")}`,
);

for (const removedWorkflow of [
  "_quality.yml",
  "_integration.yml",
  "_security.yml",
  "_compatibility.yml",
  "nightly.yml",
  "pages.yml",
  "_browser.yml",
  "_packages.yml",
  "_consumer.yml",
  "_docs.yml",
  "finalize-release.yml",
  "release-recovery.yml",
]) {
  assert(
    !existsSync(path.join(workflowsDir, removedWorkflow)),
    `${removedWorkflow} must not exist in the workflow surface`,
  );
}

for (const workflow of workflowFiles) {
  const text = read(`.github/workflows/${workflow}`);
  assertPinnedExternalActions(text, workflow);
  assert(!/continue-on-error:\s*true/.test(text), `${workflow} must not conceal mandatory failures`);
  assert(!text.includes("--if-present"), `${workflow} must not silently skip mandatory scripts`);
  assertNoLongLivedToken(text, workflow);
}

const ci = read(".github/workflows/ci.yml");
for (const marker of [
  "name: VyrnForge CI",
  "push:",
  "- main",
  "pull_request:",
  '- "integration/**"',
  "workflow_dispatch:",
  "scripts/detect-ci-scope.mjs",
  "--delivery",
  "  quality-checks:",
  "  integration-checks:",
  "  security-checks:",
  "name: ci-gate",
  "scripts/write-ci-summary.mjs",
]) {
  assert(ci.includes(marker), `ci.yml must include ${marker}`);
}
assert(
  !ci.includes("uses: ./.github/workflows/"),
  "ci.yml must own CI jobs directly instead of exposing internal reusable workflows",
);
assert(
  !/push:\s*[\s\S]*integration\/\*\*/.test(ci.slice(0, ci.indexOf("pull_request:"))),
  "ci.yml must not run on integration-lane pushes",
);
assert(
  ci.includes("if: needs.plan.outputs.quality == 'true'") &&
    ci.includes("if: needs.plan.outputs.integration == 'true'") &&
    ci.includes("if: needs.plan.outputs.security == 'true'"),
  "ci.yml must keep planner-scoped quality, integration, and security jobs",
);
const ciGate = ci.slice(ci.indexOf("  ci-gate:"));
for (const dependency of ["plan", "quality-checks", "integration-checks", "security-checks"]) {
  assert(ciGate.includes(`- ${dependency}`), `ci-gate must depend on ${dependency}`);
}
for (const marker of [
  "PLAN_RESULT",
  "QUALITY_RESULT",
  "INTEGRATION_RESULT",
  "SECURITY_RESULT",
]) {
  assert(ciGate.includes(marker), `ci-gate must evaluate ${marker}`);
}
for (const marker of [
  "node scripts/run-scoped-quality.mjs",
  "npm run verify:beta-package-artifacts",
  "npm run verify:consumer",
  "npm run test:browser",
  "npm run verify:repository-inventory",
  "pages-site-${{ github.sha }}",
  "actions/dependency-review-action@a1d282b36b6f3519aa1f3fc636f609c47dddb294 # v5.0.0",
  "ACTIONLINT_VERSION: 1.7.12",
  "shellcheck --version",
  "npm run verify:security-workflow-hardening",
]) {
  assert(ci.includes(marker), `ci.yml must directly own ${marker}`);
}
assert(!ci.includes("npm publish"), "ci.yml must never publish packages");

const assurance = read(".github/workflows/assurance.yml");
for (const marker of [
  "name: VyrnForge Weekly Assurance",
  "schedule:",
  'cron: "17 2 * * 1"',
  "workflow_dispatch:",
  "name: full-quality",
  "name: full-integration",
  "name: compatibility-plan",
  "name: compatibility-${{ matrix.id }}",
  "npm run verify:compatibility-release-case",
  "npm audit --omit=dev --audit-level=high",
  "name: codeql-analysis",
  "github/codeql-action/init@7211b7c8077ea37d8641b6271f6a365a22a5fbfa # v4.36.0",
  "github/codeql-action/analyze@7211b7c8077ea37d8641b6271f6a365a22a5fbfa # v4.36.0",
  "name: assurance-gate",
]) {
  assert(assurance.includes(marker), `assurance.yml must include ${marker}`);
}
assert(
  !assurance.includes("uses: ./.github/workflows/"),
  "assurance.yml must own weekly assurance jobs directly",
);
assert(!assurance.includes("pages: write"), "assurance.yml must not deploy Pages");
assert(!assurance.includes("id-token: write"), "assurance.yml must not request OIDC");
assert(!assurance.includes("npm publish"), "assurance.yml must not publish packages");
assert(!assurance.includes("nightly-gate"), "assurance.yml must remove obsolete nightly terminology");

const pages = read(".github/workflows/deploy-pages.yml");
for (const marker of [
  "name: Deploy GitHub Pages",
  "workflow_run:",
  'workflows: ["VyrnForge CI"]',
  "github.event.workflow_run.conclusion == 'success'",
  "github.event.workflow_run.event == 'push'",
  "ci-run-id:",
  "name: prepare-pages",
  'gh api "repos/$GITHUB_REPOSITORY/actions/runs/$RUN_ID"',
  'gh api "repos/$GITHUB_REPOSITORY/commits/main"',
  'test "$HEAD_SHA" = "$CURRENT_MAIN_SHA"',
  'gh run download "${{ steps.candidate.outputs.run-id }}"',
  '--name "pages-site-${{ steps.candidate.outputs.head-sha }}"',
  "test -f site/index.html",
  "test -f site/playground/index.html",
  "test -f site/.nojekyll",
  "pages: write",
  "id-token: write",
]) {
  assert(pages.includes(marker), `deploy-pages.yml must include ${marker}`);
}
for (const forbidden of [
  "actions/checkout@",
  "actions/setup-node@",
  "actions/download-artifact@",
  "npm ci",
  "npm run ",
  "build:packages",
  "npm publish",
]) {
  assert(!pages.includes(forbidden), `deploy-pages.yml must deploy existing artifacts without ${forbidden}`);
}

const release = read(".github/workflows/release.yml");
for (const marker of [
  "workflow_dispatch:",
  "release-group:",
  "name: verify-release",
  "name: publish-packages",
  "name: verify-registry-release",
  "name: create-release-record",
  "Resolve successful current-main CI run",
  "actions/workflows/ci.yml/runs",
  "npm run prepare:release-artifact",
  "npm run verify:release-artifact",
  "npm run verify:trusted-publishing-dry-run",
  "npm run verify:release-size-budgets",
  "environment:\n      name: npm-release",
  "id-token: write",
  "scripts/verify-registry-release.mjs",
  "scripts/create-release-notes.mjs",
]) {
  assert(release.includes(marker), `release.yml must include ${marker}`);
}
assert(
  !/^\s*(push|pull_request|schedule):/m.test(release),
  "release.yml must remain manual-only",
);
assert(
  !release.includes("uses: ./.github/workflows/"),
  "release.yml must not rerun CI through reusable workflows",
);

for (const relativePath of [
  "docs/engineering/ci-cd-architecture.md",
  "docs/release/release-responsibility-matrix.md",
]) {
  assert(existsSync(path.join(root, relativePath)), `missing CI/CD source-of-truth document: ${relativePath}`);
}

console.log(`Workflow contracts passed for four lifecycle workflows in ${workflowsDir}`);
