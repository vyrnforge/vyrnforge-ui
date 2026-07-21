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
  /pull_request:\s*[\s\S]*branches:\s*[\s\S]*- improvement\/controlled-hardening/.test(
    ci,
  ),
  "ci.yml must run for pull requests targeting improvement/controlled-hardening",
);
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
  ci.includes("name: quality"),
  "ci.yml must preserve the legacy quality check during migration",
);
assert(
  ci.includes("name: external-consumer"),
  "ci.yml must preserve the legacy external-consumer check during migration",
);
assert(
  ci.includes("if: always()"),
  "ci.yml aggregate checks must run with always()",
);
const ciGateSection = ci.slice(ci.indexOf("  ci-gate:"));
for (const dependency of [
  "plan",
  "quality-checks",
  "package-checks",
  "consumer-checks",
  "docs-checks",
]) {
  assert(
    ciGateSection.includes(`- ${dependency}`),
    `ci-gate must depend on ${dependency}`,
  );
}
for (const requiredToken of [
  "PLAN_RESULT",
  "QUALITY_REQUIRED",
  "PACKAGES_REQUIRED",
  "CONSUMER_REQUIRED",
  "DOCS_REQUIRED",
  "PLAYGROUND_REQUIRED",
  "failures.length > 0",
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
  "_packages.yml",
  "_consumer.yml",
  "_docs.yml",
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
for (const command of [
  "verify:ci",
  "format:check",
  "lint",
  "lint:css",
  "verify:metadata",
  "verify:component-maturity",
  "test:coverage",
  "typecheck",
]) {
  assert(
    scopedQuality.includes(`"${command}"`),
    `scoped quality must run ${command}`,
  );
}
assert(
  !scopedQuality.includes("--if-present"),
  "scoped quality must not silently skip missing mandatory scripts",
);
for (const workflow of [
  "ci.yml",
  "_quality.yml",
  "_packages.yml",
  "_consumer.yml",
  "_docs.yml",
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
  /permissions:\s*\n\s*contents: read/.test(pages),
  "pages.yml global permissions must be read-only",
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
  pages.includes("git rev-parse origin/main"),
  "pages.yml must reject stale main commits",
);
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
  release.includes("scripts/create-release-notes.mjs"),
  "release.yml must generate a release record from source",
);
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

  assert(
    !text.includes('node-version: "22"') && !text.includes('default: "22"'),
    `${workflow} must not use the retired Node 22 development baseline`,
  );

  for (const match of text.matchAll(
    /node-version:[ \t]*["']?([^\s"']+)["']?/g,
  )) {
    const value = match[1];
    if (value.startsWith("${{")) continue;
    assert(
      value === "24.18.0",
      `${workflow}: explicit Node version must be 24.18.0, received ${value}`,
    );
  }

  if (text.includes("uses: actions/checkout@")) {
    assertPinnedActionVersion(text, workflow, "actions/checkout", "v7");
  }

  if (text.includes("uses: actions/setup-node@")) {
    assertPinnedActionVersion(text, workflow, "actions/setup-node", "v7");
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
