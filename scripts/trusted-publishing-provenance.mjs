import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { readReleaseGroups } from "./release-groups.mjs";

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const trustedPublishingContractPath =
  "docs/metadata/trusted-publishing-provenance.json";

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function jobSection(workflowText, jobId) {
  const marker = `  ${jobId}:\n`;
  const start = workflowText.indexOf(marker);
  if (start === -1) return "";
  const nextJob = workflowText.indexOf("\n  ", start + marker.length);
  let cursor = nextJob;
  while (cursor !== -1) {
    const lineEnd = workflowText.indexOf("\n", cursor + 1);
    const line = workflowText.slice(
      cursor + 1,
      lineEnd === -1 ? workflowText.length : lineEnd,
    );
    if (/^ {2}[A-Za-z0-9_-]+:$/.test(line)) {
      return workflowText.slice(start, cursor + 1);
    }
    cursor = workflowText.indexOf("\n  ", cursor + 1);
  }
  return workflowText.slice(start);
}

function addFailure(failures, condition, message) {
  if (!condition) failures.push(message);
}

function exactMembers(actual, expected) {
  return (
    Array.isArray(actual) &&
    actual.length === expected.length &&
    expected.every((value) => actual.includes(value))
  );
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function verifyTrustedPublishingExternalEvidence({
  root = repositoryRoot,
  contract,
  evidence,
} = {}) {
  const failures = [];
  const evidenceStatus = contract?.externalEvidence?.status;
  const taskStatus = contract?.task?.status;
  const releaseReadiness = contract?.releaseReadiness;

  addFailure(
    failures,
    Array.isArray(contract?.externalEvidence?.required) &&
      contract.externalEvidence.required.length >= 5,
    "BT-8007 external evidence requirements are incomplete",
  );

  if (evidenceStatus === "pending") {
    addFailure(
      failures,
      taskStatus === "in-review" &&
        releaseReadiness === "not-ready" &&
        evidence?.schemaVersion === 1 &&
        evidence?.task === "BT-8007" &&
        evidence?.status === "pending",
      "BT-8007 pending evidence must keep the task in-review and release readiness not-ready",
    );
    return failures;
  }

  if (evidenceStatus !== "verified") {
    failures.push(
      `BT-8007 external evidence status must be pending or verified, received ${String(evidenceStatus)}`,
    );
    return failures;
  }

  addFailure(
    failures,
    taskStatus === "done" && releaseReadiness === "ready",
    "BT-8007 verified evidence must mark the task done and release readiness ready",
  );
  addFailure(
    failures,
    evidence?.schemaVersion === 1 &&
      evidence?.task === "BT-8007" &&
      evidence?.status === "verified" &&
      isNonEmptyString(evidence?.reviewer) &&
      !Number.isNaN(Date.parse(evidence?.reviewedAt ?? "")) &&
      isNonEmptyString(evidence?.workflowRun) &&
      isNonEmptyString(evidence?.dryRunArtifact),
    "BT-8007 verified evidence index is incomplete",
  );

  const expectedPackageNames = (contract?.packages ?? []).map(
    (packageInfo) => packageInfo.name,
  );
  const packageEvidence = evidence?.packagePublisherSettings ?? [];
  addFailure(
    failures,
    exactMembers(
      packageEvidence.map((entry) => entry.package),
      expectedPackageNames,
    ) &&
      packageEvidence.every(
        (entry) =>
          isNonEmptyString(entry.capture) &&
          existsSync(path.join(root, entry.capture)),
      ),
    "BT-8007 verified evidence must include a retained capture for every publishable package",
  );
  addFailure(
    failures,
    isNonEmptyString(evidence?.environmentProtection?.capture) &&
      existsSync(path.join(root, evidence.environmentProtection.capture)),
    "BT-8007 verified evidence must include the protected npm-release environment capture",
  );

  return failures;
}

export function readTrustedPublishingContract({ root = repositoryRoot } = {}) {
  return readJson(root, trustedPublishingContractPath);
}

export function verifyTrustedPublishingProvenanceContract({
  root = repositoryRoot,
  contract = readTrustedPublishingContract({ root }),
  workflowText = readFileSync(
    path.join(root, contract.workflow?.path ?? ""),
    "utf8",
  ),
  registryVerifierText = readFileSync(
    path.join(root, "scripts/verify-registry-release.mjs"),
    "utf8",
  ),
  rootPackage = readJson(root, "package.json"),
  releaseGroups = readReleaseGroups({ root }),
} = {}) {
  const failures = [];
  const normalizedWorkflowText = workflowText.replace(/\r\n?/g, "\n");

  addFailure(
    failures,
    contract.schemaVersion === 1,
    "trusted-publishing contract schemaVersion must be 1",
  );
  addFailure(
    failures,
    contract.sourceOfTruth?.canonical === true &&
      contract.sourceOfTruth?.task === "BT-8007" &&
      contract.sourceOfTruth?.documentation ===
        "docs/release/trusted-publishing-provenance.md",
    "BT-8007 source-of-truth metadata is invalid",
  );
  addFailure(
    failures,
    contract.task?.id === "BT-8007" &&
      contract.task?.title === "Verify trusted publishing and provenance" &&
      exactMembers(contract.task?.dependsOn, ["BT-8003", "BT-8006"]) &&
      exactMembers(contract.task?.unlocksAfterMerge, ["BT-8008", "BT-8013"]),
    "BT-8007 task graph is invalid",
  );
  addFailure(
    failures,
    contract.repository?.owner === "vyrnforge" &&
      contract.repository?.name === "vyrnforge-ui" &&
      contract.repository?.public === true &&
      contract.repository?.url === "https://github.com/vyrnforge/vyrnforge-ui",
    "trusted-publishing repository identity must be the public VyrnForge UI repository",
  );

  for (const requiredPath of [
    contract.sourceOfTruth?.documentation,
    contract.externalEvidence?.evidenceDirectory,
    contract.externalEvidence?.evidenceIndex,
    contract.workflow?.path,
  ]) {
    addFailure(
      failures,
      typeof requiredPath === "string" &&
        existsSync(path.join(root, requiredPath)),
      `trusted-publishing required path is missing: ${String(requiredPath)}`,
    );
  }

  const workflow = contract.workflow ?? {};
  addFailure(
    failures,
    workflow.path === ".github/workflows/release.yml" &&
      workflow.filename === "release.yml" &&
      workflow.name === "Controlled npm Release" &&
      workflow.trigger === "workflow_dispatch" &&
      workflow.runner === "ubuntu-latest" &&
      workflow.environment === "npm-release" &&
      workflow.concurrencyGroup === "vyrnforge-npm-release",
    "trusted-publishing workflow identity is invalid",
  );
  addFailure(
    failures,
    normalizedWorkflowText.startsWith("name: Controlled npm Release\n") &&
      normalizedWorkflowText.includes("  workflow_dispatch:\n") &&
      normalizedWorkflowText.includes("  group: vyrnforge-npm-release\n"),
    "release.yml must remain manually dispatched with the canonical concurrency group",
  );

  const verifySection = jobSection(normalizedWorkflowText, workflow.verifyJob);
  const publishSection = jobSection(
    normalizedWorkflowText,
    workflow.publishJob,
  );
  const registrySection = jobSection(
    normalizedWorkflowText,
    workflow.registryVerificationJob,
  );
  const releaseRecordSection = jobSection(
    normalizedWorkflowText,
    workflow.releaseRecordJob,
  );

  addFailure(failures, Boolean(verifySection), "verify-release job is missing");
  addFailure(
    failures,
    Boolean(publishSection),
    "publish-packages job is missing",
  );
  addFailure(
    failures,
    Boolean(registrySection),
    "verify-registry-release job is missing",
  );
  addFailure(
    failures,
    Boolean(releaseRecordSection),
    "create-release-record job is missing",
  );

  addFailure(
    failures,
    publishSection.includes("if: inputs.mode == 'publish'") &&
      publishSection.includes("runs-on: ubuntu-latest") &&
      publishSection.includes("environment:\n      name: npm-release") &&
      publishSection.includes("contents: read") &&
      publishSection.includes("id-token: write"),
    "publish-packages must use the protected npm-release environment and job-scoped OIDC",
  );
  addFailure(
    failures,
    !verifySection.includes("id-token: write") &&
      !verifySection.includes("name: npm-release"),
    "verify-release must not request OIDC or the publish environment",
  );
  addFailure(
    failures,
    releaseRecordSection.includes("contents: write") &&
      !releaseRecordSection.includes("id-token: write"),
    "create-release-record must have repository write permission without npm OIDC",
  );
  addFailure(
    failures,
    registrySection.includes("node scripts/verify-registry-release.mjs") &&
      !registrySection.includes("id-token: write"),
    "registry verification must remain read-only and invoke the registry verifier",
  );

  addFailure(
    failures,
    verifySection.includes("npm run verify:trusted-publishing-provenance") &&
      verifySection.includes("npm run verify:trusted-publishing-dry-run") &&
      verifySection.includes(
        "trusted-publishing-dry-run-${{ inputs.release-group }}",
      ),
    "verify-release must retain the BT-8007 contract, dry run and evidence artifact",
  );

  const forbiddenMarkers = contract.npm?.forbiddenCredentialMarkers ?? [];
  for (const marker of forbiddenMarkers) {
    addFailure(
      failures,
      !normalizedWorkflowText.includes(marker),
      `release.yml must not contain long-lived credential marker ${marker}`,
    );
  }
  addFailure(
    failures,
    !publishSection.includes("--provenance"),
    "trusted publishing must use automatic provenance without --provenance",
  );

  const publisher = contract.npm?.publisher ?? {};
  addFailure(
    failures,
    publisher.provider === "github-actions" &&
      publisher.organizationOrUser === "vyrnforge" &&
      publisher.repository === "vyrnforge-ui" &&
      publisher.workflowFilename === "release.yml" &&
      publisher.environment === "npm-release" &&
      exactMembers(publisher.allowedActions, ["npm publish"]),
    "npm trusted-publisher fields are invalid",
  );
  addFailure(
    failures,
    contract.npm?.automaticProvenance?.required === true &&
      contract.npm?.automaticProvenance?.publishFlagForbidden ===
        "--provenance" &&
      contract.npm?.automaticProvenance?.metadataPath ===
        "dist.attestations.url" &&
      contract.npm?.automaticProvenance?.signatureCommand ===
        "npm audit signatures",
    "automatic provenance contract is invalid",
  );
  addFailure(
    failures,
    registryVerifierText.includes("dist?.attestations?.url") &&
      registryVerifierText.includes('"audit", "signatures"'),
    "registry verifier must require provenance metadata and npm audit signatures",
  );

  const expectedPackages = Object.entries(releaseGroups.groups ?? {}).flatMap(
    ([releaseGroup, value]) =>
      (value.packages ?? []).map((packageInfo) => ({
        name: packageInfo.name,
        directory: packageInfo.directory,
        releaseGroup,
      })),
  );
  addFailure(
    failures,
    Array.isArray(contract.packages) &&
      contract.packages.length === expectedPackages.length,
    "trusted-publishing package coverage is incomplete",
  );

  for (const expected of expectedPackages) {
    const packageEntry = contract.packages?.find(
      (candidate) => candidate.name === expected.name,
    );
    addFailure(
      failures,
      packageEntry?.directory === expected.directory &&
        packageEntry?.releaseGroup === expected.releaseGroup,
      `${expected.name} trusted-publishing metadata is invalid`,
    );
    const packageJson = readJson(root, `${expected.directory}/package.json`);
    addFailure(
      failures,
      packageJson.name === expected.name &&
        packageJson.publishConfig?.access === "public" &&
        packageJson.repository?.url ===
          "git+https://github.com/vyrnforge/vyrnforge-ui.git" &&
        packageJson.repository?.directory === expected.directory,
      `${expected.name} must remain a public package linked to the exact repository directory`,
    );
    addFailure(
      failures,
      publishSection.includes(
        `npm publish ./${expected.directory} --access public --tag "$RELEASE_TAG"`,
      ),
      `${expected.name} is missing its canonical OIDC publish command`,
    );
  }

  addFailure(
    failures,
    rootPackage.private === true &&
      /^npm@11\./.test(rootPackage.packageManager ?? "") &&
      rootPackage.engines?.node === ">=24.18 <25" &&
      rootPackage.engines?.npm === ">=11.16 <12",
    "repository toolchain must remain compatible with npm trusted publishing",
  );
  const evidence = readJson(root, contract.externalEvidence.evidenceIndex);
  failures.push(
    ...verifyTrustedPublishingExternalEvidence({ root, contract, evidence }),
  );

  return failures.sort();
}
