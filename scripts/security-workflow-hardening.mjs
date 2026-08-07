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
export const securityWorkflowPath = ".github/workflows/_security.yml";

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
    securityWorkflowPath,
    "scripts/verify-security-workflow-hardening.mjs",
    "scripts/verify-security-workflow-hardening.test.mjs",
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

  const securityWorkflow = read(root, securityWorkflowPath);
  for (const marker of [
    "workflow_call:",
    "actions/dependency-review-action@a1d282b36b6f3519aa1f3fc636f609c47dddb294 # v5.0.0",
    "github/codeql-action/init@7211b7c8077ea37d8641b6271f6a365a22a5fbfa # v4.36.0",
    "github/codeql-action/analyze@7211b7c8077ea37d8641b6271f6a365a22a5fbfa # v4.36.0",
    "npm audit --omit=dev --audit-level=high",
    "ACTIONLINT_VERSION: 1.7.12",
    "8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8",
    "shellcheck --version",
    "npm run verify:security-workflow-hardening",
    "npm run verify:workflows",
  ]) {
    if (!securityWorkflow.includes(marker)) {
      failures.push(`${securityWorkflowPath}: missing ${marker}`);
    }
  }
  if (!securityWorkflow.includes("github.event_name == 'pull_request'")) {
    failures.push("dependency review must be scoped to pull requests");
  }
  if (/continue-on-error:\s*true/u.test(securityWorkflow)) {
    failures.push("security workflow must not conceal mandatory failures");
  }

  const ci = read(root, ".github/workflows/ci.yml");
  const ciGate = ci.slice(ci.indexOf("  ci-gate:"));
  if (ci.includes("  compatibility-checks:")) {
    failures.push("ci.yml must leave compatibility drift to nightly");
  }
  if (!ci.includes("  security-checks:")) {
    failures.push("ci.yml is missing scoped security-checks");
  }
  if (!ci.includes("if: needs.plan.outputs.security == 'true'")) {
    failures.push("security-checks must be selected by the CI planner");
  }
  if (!ciGate.includes("- security-checks")) {
    failures.push("ci-gate must depend on security-checks");
  }
  for (const marker of ["SECURITY_RESULT", "scripts/write-ci-summary.mjs"]) {
    if (!ciGate.includes(marker)) {
      failures.push(`ci-gate must evaluate ${marker}`);
    }
  }

  const nightly = read(root, ".github/workflows/nightly.yml");
  for (const marker of [
    "uses: ./.github/workflows/_compatibility.yml",
    "uses: ./.github/workflows/_security.yml",
    "- compatibility",
    "- security",
  ]) {
    if (!nightly.includes(marker)) {
      failures.push(`nightly.yml is missing ${marker}`);
    }
  }

  const release = read(root, ".github/workflows/release.yml");
  const verifyReleaseSection = release.slice(
    release.indexOf("  verify-release:"),
    release.indexOf("  publish-packages:"),
  );
  for (const marker of [
    "uses: ./.github/workflows/_compatibility.yml",
    "uses: ./.github/workflows/_security.yml",
    "needs:",
    "- compatibility-checks",
    "- security-checks",
    "npm run verify:beta-package-artifacts",
    "npm run verify:beta-package-size-budgets",
  ]) {
    if (!release.includes(marker)) {
      failures.push(`release.yml is missing ${marker}`);
    }
  }
  if (!verifyReleaseSection.includes("needs:")) {
    failures.push("verify-release must depend on release security preflight");
  }

  const documentation = read(root, securityDocumentationPath);
  for (const marker of [
    "BT-8006",
    "CodeQL",
    "dependency-review",
    "actionlint 1.7.12",
    "ShellCheck",
    "ci-gate",
    "nightly-gate",
    "verify-release",
  ]) {
    if (!documentation.includes(marker)) {
      failures.push(`${securityDocumentationPath}: missing ${marker}`);
    }
  }

  return failures.sort();
}
