import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyAllPersistentLanes } from "./verify-lane-drift.mjs";

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const securityManifestPath =
  "docs/metadata/security-workflow-hardening.json";
export const securityDocumentationPath =
  "docs/release/security-workflow-hardening.md";
export const ciWorkflowPath = ".github/workflows/ci.yml";
export const assuranceWorkflowPath = ".github/workflows/assurance.yml";

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8").replaceAll(
    "\r\n",
    "\n",
  );
}

export function readSecurityManifest({ root = repositoryRoot } = {}) {
  return JSON.parse(read(root, securityManifestPath));
}

export function findMissingMarkers(text, markers) {
  return markers.filter((marker) => !text.includes(marker));
}

export function verifySecurityWorkflowContract({ root = repositoryRoot } = {}) {
  const failures = [];
  for (const requiredFile of [
    securityManifestPath,
    securityDocumentationPath,
    ciWorkflowPath,
    assuranceWorkflowPath,
    "scripts/verify-security-workflow-hardening.mjs",
    "scripts/verify-security-workflow-hardening.test.mjs",
    "scripts/verify-lane-drift.mjs",
    "scripts/verify-lane-drift.test.mjs",
    "scripts/write-ci-summary.mjs",
  ]) {
    if (!existsSync(path.join(root, requiredFile))) {
      failures.push(`BT-8006 required file is missing: ${requiredFile}`);
    }
  }
  if (failures.length) return failures;

  const manifest = readSecurityManifest({ root });
  if (manifest.task?.id !== "BT-8006" || manifest.task?.status !== "done") {
    failures.push("security contract must record BT-8006 as done");
  }
  if (
    JSON.stringify(manifest.task?.dependsOn) !== JSON.stringify(["BT-8003"])
  ) {
    failures.push("BT-8006 must depend on BT-8003");
  }
  if (
    JSON.stringify(manifest.task?.unlocksAfterMerge) !==
    JSON.stringify(["BT-8007", "BT-8008"])
  ) {
    failures.push("BT-8006 must unlock BT-8007 and BT-8008 after merge");
  }

  const ci = read(root, ciWorkflowPath);
  for (const marker of [
    "actions/dependency-review-action@a1d282b36b6f3519aa1f3fc636f609c47dddb294 # v5.0.0",
    "github.event_name == 'pull_request'",
    "ACTIONLINT_VERSION: 1.7.12",
    "8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8",
    "shellcheck --version",
    "npm run verify:security-workflow-hardening",
    "npm run verify:workflows",
    "  security-checks:",
    "if: needs.plan.outputs.security == 'true'",
    "name: ci-gate",
  ]) {
    if (!ci.includes(marker)) {
      failures.push(`${ciWorkflowPath}: missing ${marker}`);
    }
  }
  const ciGate = ci.slice(ci.indexOf("  ci-gate:"));
  for (const marker of [
    "- security-checks",
    "SECURITY_RESULT",
    "scripts/write-ci-summary.mjs",
  ]) {
    if (!ciGate.includes(marker)) {
      failures.push(`ci-gate must evaluate ${marker}`);
    }
  }
  if (/continue-on-error:\s*true/u.test(ci)) {
    failures.push("CI security checks must not conceal mandatory failures");
  }

  const ciSummary = read(root, "scripts/write-ci-summary.mjs");
  for (const marker of [
    "verifyCurrentGitHubPullRequestLaneDrift",
    "lane drift:",
    "### Lane freshness",
  ]) {
    if (!ciSummary.includes(marker)) {
      failures.push(`ci-gate reporter must enforce lane freshness via ${marker}`);
    }
  }

  const laneDrift = read(root, "scripts/verify-lane-drift.mjs");
  for (const lane of [
    "integration/foundation",
    "integration/native",
    "integration/react",
    "integration/angular",
    "integration/vue",
    "integration/data-grid",
    "integration/docs",
    "integration/platform",
  ]) {
    if (!laneDrift.includes(`\"${lane}\"`)) {
      failures.push(`lane drift verifier must include ${lane}`);
    }
  }
  for (const marker of [
    "tree-equivalent",
    "contains-main",
    "main-sync-pr",
    "synchronize main ->",
    "does not contain current main",
  ]) {
    if (!laneDrift.includes(marker)) {
      failures.push(`lane drift verifier must preserve ${marker}`);
    }
  }

  const assurance = read(root, assuranceWorkflowPath);
  for (const marker of [
    "npm audit --omit=dev --audit-level=high",
    "github/codeql-action/init@7211b7c8077ea37d8641b6271f6a365a22a5fbfa # v4.36.0",
    "github/codeql-action/analyze@7211b7c8077ea37d8641b6271f6a365a22a5fbfa # v4.36.0",
    "ACTIONLINT_VERSION: 1.7.12",
    "shellcheck --version",
    "name: assurance-gate",
    "- security-drift",
    "- codeql",
  ]) {
    if (!assurance.includes(marker)) {
      failures.push(`${assuranceWorkflowPath}: missing ${marker}`);
    }
  }
  if (/continue-on-error:\s*true/u.test(assurance)) {
    failures.push("weekly assurance must not conceal mandatory failures");
  }

  if (process.env.GITHUB_WORKFLOW === "VyrnForge Weekly Assurance") {
    try {
      verifyAllPersistentLanes({ cwd: root });
    } catch (error) {
      failures.push(`weekly integration-lane drift audit failed: ${error.message}`);
    }
  }

  const release = read(root, ".github/workflows/release.yml");
  const verifyReleaseStart = release.indexOf("  verify-release:");
  const publishPackagesStart = release.indexOf("  publish-packages:");
  if (verifyReleaseStart < 0 || publishPackagesStart <= verifyReleaseStart) {
    failures.push(
      "release.yml is missing the canonical verify-release boundary",
    );
  } else {
    const verifyReleaseSection = release.slice(
      verifyReleaseStart,
      publishPackagesStart,
    );
    for (const marker of [
      "Resolve successful current-main CI run",
      "actions/workflows/ci.yml/runs",
      "gh api --paginate",
      "npm run verify:release-artifact",
      "npm run verify:release-size-budgets",
    ]) {
      if (!verifyReleaseSection.includes(marker)) {
        failures.push(
          `release.yml verify-release is missing current-main release control: ${marker}`,
        );
      }
    }
  }
  if (release.includes("uses: ./.github/workflows/")) {
    failures.push(
      "release.yml must not repeat successful main CI through reusable workflows",
    );
  }

  if (
    JSON.stringify(manifest.controls?.mandatoryAggregates) !==
    JSON.stringify(["ci-gate", "assurance-gate"])
  ) {
    failures.push(
      "security contract mandatory aggregates must be ci-gate and assurance-gate",
    );
  }
  if (
    manifest.controls?.dependencyReview?.workflow !== ciWorkflowPath ||
    manifest.controls?.codeql?.workflow !== assuranceWorkflowPath
  ) {
    failures.push(
      "security contract must map dependency review to CI and CodeQL to weekly assurance",
    );
  }
  if (
    manifest.releasePreflight?.successfulCurrentMainCiRequired !== true ||
    manifest.releasePreflight?.releaseArtifactVerificationRequired !== true ||
    manifest.releasePreflight?.releaseLineSizeBudgetVerificationRequired !==
      true
  ) {
    failures.push(
      "security contract release boundary must trust current-main CI and verify retained release artifacts",
    );
  }

  const documentation = read(root, securityDocumentationPath);
  for (const marker of [
    "BT-8006",
    "CodeQL",
    "dependency-review",
    "actionlint 1.7.12",
    "ShellCheck",
    "ci-gate",
    "assurance-gate",
    "VyrnForge Weekly Assurance",
    "verify-release",
  ]) {
    if (!documentation.includes(marker)) {
      failures.push(`${securityDocumentationPath}: missing ${marker}`);
    }
  }

  return failures.sort();
}
