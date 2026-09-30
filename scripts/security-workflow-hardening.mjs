import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
    "\\r\\n",
    "\\n",
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
    "scripts/write-ci-summary.mjs",
  ]) {
    if (!existsSync(path.join(root, requiredFile))) {
      failures.push(
        `security workflow required file is missing: ${requiredFile}`,
      );
    }
  }
  if (failures.length) return failures;

  const manifest = readSecurityManifest({ root });
  if (manifest.schemaVersion !== 3) {
    failures.push("security workflow metadata schemaVersion must be 3");
  }
  if (
    manifest.sourceOfTruth?.canonical !== true ||
    manifest.sourceOfTruth?.documentation !== securityDocumentationPath
  ) {
    failures.push(
      "security workflow metadata must point to canonical documentation",
    );
  }

  const ci = read(root, ciWorkflowPath);
  for (const marker of [
    "pull_request:",
    "- main",
    "actions/dependency-review-action@a1d282b36b6f3519aa1f3fc636f609c47dddb294 # v5.0.0",
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
  if (ci.includes("integration/**")) {
    failures.push(
      "CI must not reintroduce obsolete persistent integration-lane PR targets",
    );
  }
  if (/continue-on-error:\s*true/u.test(ci)) {
    failures.push("CI security checks must not conceal mandatory failures");
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

  const assurance = read(root, assuranceWorkflowPath);
  for (const marker of [
    "npm audit --omit=dev --audit-level=high",
    "github/codeql-action/init@2892aa5e19bbd11bc0cff5427e3b750a04d9e3c2 # v4.38.2",
    "github/codeql-action/analyze@2892aa5e19bbd11bc0cff5427e3b750a04d9e3c2 # v4.38.2",
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
    manifest.protectedGate?.branch !== "main" ||
    manifest.protectedGate?.requiredCheck !== "ci-gate"
  ) {
    failures.push("security contract must protect main with ci-gate");
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
