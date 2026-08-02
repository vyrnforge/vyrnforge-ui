import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const metadataPath = "docs/metadata/cross-framework-accessibility-review.json";
const consumerManifestPath = "tests/consumers/manifest.json";
const runtimePath = "scripts/verify-consumer-foundations-runtime.mjs";
const manualEvidenceDirectory = "docs/quality/assistive-technology-results/";
const supportedStatuses = new Set([
  "manual-review-required",
  "evidence-complete",
  "blocked",
]);
const supportedOutcomes = new Set(["passed", "failed", "blocked"]);

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(root, relativePath) {
  return JSON.parse(read(root, relativePath));
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoDate(value) {
  return isNonEmptyString(value) && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function validateCompletedManualEvidence(root, metadata, failures) {
  const evidencePath = metadata.manualReview?.evidence;
  if (!isNonEmptyString(evidencePath)) {
    failures.push("CF-7010 completed metadata requires a manual evidence path");
    return;
  }
  if (!evidencePath.startsWith(manualEvidenceDirectory)) {
    failures.push(
      `CF-7010 manual evidence must live under ${manualEvidenceDirectory}`,
    );
    return;
  }
  if (!existsSync(path.join(root, evidencePath))) {
    failures.push(`CF-7010 manual evidence is missing: ${evidencePath}`);
    return;
  }

  const evidence = readJson(root, evidencePath);
  if (evidence.schemaVersion !== 1 || evidence.task !== "CF-7010") {
    failures.push(
      "CF-7010 manual evidence must use schema version 1 and task CF-7010",
    );
  }
  const environment = evidence.environment;
  for (const [label, value] of [
    ["reviewer", environment?.reviewer],
    ["operatingSystemVersion", environment?.operatingSystemVersion],
    ["browserVersion", environment?.browserVersion],
    ["nvdaVersion", environment?.nvdaVersion],
  ]) {
    if (!isNonEmptyString(value) || value === "pending") {
      failures.push(`CF-7010 manual evidence requires ${label}`);
    }
  }
  if (!isIsoDate(environment?.testedAt)) {
    failures.push(
      "CF-7010 manual evidence requires testedAt in YYYY-MM-DD format",
    );
  }
  if (!isNonEmptyString(evidence.approval?.approvedBy)) {
    failures.push("CF-7010 manual evidence requires Accessibility approval");
  }
  if (!isIsoDate(evidence.approval?.approvedAt)) {
    failures.push(
      "CF-7010 manual evidence requires approvedAt in YYYY-MM-DD format",
    );
  }

  const expectedConsumers = new Set(metadata.consumers ?? []);
  const recordedConsumers = new Map();
  for (const result of evidence.consumers ?? []) {
    if (!expectedConsumers.has(result?.id)) {
      failures.push(
        `CF-7010 manual evidence has unknown consumer '${result?.id}'`,
      );
      continue;
    }
    if (recordedConsumers.has(result.id)) {
      failures.push(`CF-7010 manual evidence duplicates '${result.id}'`);
    }
    recordedConsumers.set(result.id, result);
    if (!supportedOutcomes.has(result?.outcome)) {
      failures.push(`CF-7010 ${result.id} has unsupported outcome`);
    }
    if (result?.outcome !== "passed") {
      failures.push(`CF-7010 evidence-complete requires ${result.id} to pass`);
    }
    if (!Array.isArray(result?.checks) || result.checks.length < 5) {
      failures.push(`CF-7010 ${result.id} must record all manual checks`);
    }
    if (!isNonEmptyString(result?.notes)) {
      failures.push(`CF-7010 ${result.id} requires review notes`);
    }
  }
  for (const consumer of expectedConsumers) {
    if (!recordedConsumers.has(consumer)) {
      failures.push(`CF-7010 manual evidence is missing ${consumer}`);
    }
  }
}

export function verifyCrossFrameworkAccessibility({
  root = repositoryRoot,
} = {}) {
  const failures = [];
  for (const file of [
    metadataPath,
    consumerManifestPath,
    runtimePath,
    "docs/testing/cross-framework-accessibility-review.md",
    "scripts/serve-cross-framework-accessibility-review.mjs",
    "packages/ui-elements/src/components/inputs.ts",
    "packages/ui-elements/src/components/actions.ts",
    "packages/ui-elements/src/components/navigation.ts",
    "packages/ui-components/src/styles/feedback/alert.css",
    "packages/ui-elements/src/styles/feedback/alert.css",
    ".github/workflows/_consumer.yml",
  ]) {
    if (!existsSync(path.join(root, file))) {
      failures.push(`required CF-7010 file is missing: ${file}`);
    }
  }
  if (failures.length > 0) return failures.sort();

  const metadata = readJson(root, metadataPath);
  if (
    metadata.schemaVersion !== 1 ||
    metadata.program?.task !== "CF-7010" ||
    metadata.program?.sprint !== "S7" ||
    metadata.program?.gate !== "GMF4"
  ) {
    failures.push(
      "cross-framework accessibility program must be S7 / CF-7010 / GMF4",
    );
  }
  if (!supportedStatuses.has(metadata.program?.status)) {
    failures.push(
      "CF-7010 status must be manual-review-required, evidence-complete, or blocked",
    );
  }

  const expectedClaim =
    metadata.program?.status === "evidence-complete"
      ? "cross-framework-accessibility-verified"
      : metadata.program?.status === "blocked"
        ? "cross-framework-accessibility-blocked"
        : "cross-framework-accessibility-review-ready";
  if (metadata.supportClaim !== expectedClaim) {
    failures.push(`CF-7010 support claim must be ${expectedClaim}`);
  }

  const manifest = readJson(root, consumerManifestPath);
  const manifestConsumers = new Set(
    (manifest.fixtures ?? []).map((fixture) => fixture.id),
  );
  for (const consumer of ["native-html", "react", "angular", "vue"]) {
    if (!(metadata.consumers ?? []).includes(consumer)) {
      failures.push(`CF-7010 metadata is missing ${consumer}`);
    }
    if (!manifestConsumers.has(consumer)) {
      failures.push(`CF-7010 consumer manifest is missing ${consumer}`);
    }
  }
  if ((metadata.automatedReview?.scenarios ?? []).length < 4) {
    failures.push(
      "CF-7010 must define Axe and representative keyboard scenarios",
    );
  }
  if (metadata.manualReview?.required !== true) {
    failures.push("CF-7010 must require a manual assistive-technology review");
  }
  if (metadata.manualReview?.assistiveTechnology !== "NVDA") {
    failures.push("CF-7010 manual review must require NVDA evidence");
  }

  const runtime = read(root, runtimePath);
  for (const marker of [
    "--accessibility-report",
    "--accessibility-smoke",
    'const accessibilityTabs = page.getByRole("tab")',
    "assertTabKeyboardState",
    "{ timeout: 3000 }",
    "preserveGeneratedOutput = preserveBuiltFixtures",
    "axeSource",
    "verifySharedAccessibilityScenario",
    "axe-serious-critical",
    "keyboard-action-activation",
    "keyboard-tabs-navigation",
    "text-input-accessible-name",
  ]) {
    if (!runtime.includes(marker)) {
      failures.push(
        `consumer runtime accessibility review is missing ${marker}`,
      );
    }
  }

  const inputs = read(root, "packages/ui-elements/src/components/inputs.ts");
  for (const marker of [
    'label: { reflect: true, type: "string" }',
    "const accessibleLabel =",
    'control.setAttribute("aria-label", accessibleLabel)',
  ]) {
    if (!inputs.includes(marker)) {
      failures.push(
        `text-input accessible-name forwarding is missing ${marker}`,
      );
    }
  }

  for (const [file, hostPrefix] of [
    ["packages/ui-components/src/styles/feedback/alert.css", ""],
    ["packages/ui-elements/src/styles/feedback/alert.css", "vf-inline-message"],
  ]) {
    const css = read(root, file);
    for (const variant of ["success", "warning", "danger", "info"]) {
      const marker = `${hostPrefix}.vf-inline-message--${variant} .vf-inline-message__content`;
      if (!css.includes(marker)) {
        failures.push(
          `${file} must apply status text contrast to ${variant} inline-message content`,
        );
      }
    }
  }

  const nativeTabs = read(
    root,
    "packages/ui-elements/src/components/navigation.ts",
  );
  for (const marker of [
    "#pendingFocusValue",
    "const pendingFocusValue = this.#pendingFocusValue",
    "this.#pendingFocusValue = next",
  ]) {
    if (!nativeTabs.includes(marker)) {
      failures.push(
        `native tabs must restore keyboard focus after automatic activation: missing ${marker}`,
      );
    }
  }

  const nativeActions = read(
    root,
    "packages/ui-elements/src/components/actions.ts",
  );
  for (const marker of [
    "#contentObserver",
    "this.observeExternalContent();",
    "this.#contentObserver.observe(this, { childList: true })",
    "this.syncExternalContent();",
  ]) {
    if (!nativeActions.includes(marker)) {
      failures.push(
        `native action elements must synchronize late light-DOM content for accessible names: missing ${marker}`,
      );
    }
  }

  const rootPackage = readJson(root, "package.json");
  for (const script of [
    "verify:cross-framework-accessibility",
    "test:cross-framework-accessibility",
    "verify:cross-framework-accessibility:runtime",
    "review:cross-framework-accessibility",
  ]) {
    if (!rootPackage.scripts?.[script]) {
      failures.push(`root package scripts are missing ${script}`);
    }
  }

  const workflow = read(root, ".github/workflows/_consumer.yml");
  if (!workflow.includes("accessibility-report.json")) {
    failures.push(
      "consumer CI workflow must verify the CF-7010 accessibility report",
    );
  }

  if (metadata.program?.status === "evidence-complete") {
    if (metadata.manualReview?.status !== "complete") {
      failures.push(
        "CF-7010 evidence-complete requires manualReview.status complete",
      );
    }
    if ((metadata.unresolvedBlockers ?? []).length !== 0) {
      failures.push(
        "CF-7010 evidence-complete cannot retain unresolved blockers",
      );
    }
    validateCompletedManualEvidence(root, metadata, failures);
  } else if ((metadata.unresolvedBlockers ?? []).length === 0) {
    failures.push(
      "incomplete CF-7010 metadata must preserve an explicit blocker",
    );
  }

  return failures.sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifyCrossFrameworkAccessibility();
  if (failures.length > 0) {
    console.error("Cross-framework accessibility verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("Cross-framework accessibility verification passed.");
  }
}
