import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const evidencePath = "docs/metadata/angular-support-evidence.json";
const documentationPath = "docs/testing/angular-support-evidence.md";

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(root, relativePath) {
  return JSON.parse(read(root, relativePath));
}

function includesAll(actual, expected) {
  const values = new Set(actual ?? []);
  return expected.every((value) => values.has(value));
}

export function verifyAngularSupportEvidence({ root = repositoryRoot } = {}) {
  const failures = [];
  const requiredFiles = [
    evidencePath,
    documentationPath,
    "docs/metadata/compatibility-release-matrix.json",
    "docs/metadata/cross-framework-browser-matrix.json",
    "docs/metadata/cross-framework-accessibility-review.json",
    "docs/metadata/angular-forms-adapter.json",
    "docs/quality/assistive-technology-results/cf-7010-cross-framework-nvda.json",
    "packages/ui-angular/package.json",
    "tests/consumers/angular/package.json",
    "tests/consumers/angular/src/app/app.component.ts",
    "scripts/verify-angular-packed-fixture-ownership.mjs",
    ".github/workflows/assurance.yml",
    ".github/workflows/_integration.yml",
  ];
  for (const file of requiredFiles) {
    if (!existsSync(path.join(root, file))) {
      failures.push(`MFD-1214 required evidence is missing ${file}`);
    }
  }
  if (failures.length > 0) return failures.sort();

  const evidence = readJson(root, evidencePath);
  if (
    evidence.schemaVersion !== 1 ||
    evidence.task?.id !== "MFD-1214" ||
    evidence.task?.status !== "evidence-complete"
  ) {
    failures.push("MFD-1214 evidence metadata must be evidence-complete");
  }
  if (
    evidence.supportClaim !== "angular-compatibility-accessibility-verified"
  ) {
    failures.push("MFD-1214 support claim is invalid");
  }
  if ((evidence.unresolvedBlockers ?? []).length !== 0) {
    failures.push("MFD-1214 evidence cannot retain unresolved blockers");
  }
  if (evidence.releaseReadiness !== "evidence-complete-not-release-ready") {
    failures.push("MFD-1214 must not overclaim Angular release readiness");
  }

  const angularPackage = readJson(root, "packages/ui-angular/package.json");
  const peerRange = angularPackage.peerDependencies?.["@angular/core"];
  const formsPeerRange = angularPackage.peerDependencies?.["@angular/forms"];
  if (peerRange !== ">=22 <23" || evidence.package?.peerRange !== peerRange) {
    failures.push(
      "MFD-1214 Angular support must match the >=22 <23 core peer contract",
    );
  }
  if (
    formsPeerRange !== ">=22 <23" ||
    evidence.package?.formsPeerRange !== formsPeerRange
  ) {
    failures.push(
      "MFD-1214 Forms support must match the >=22 <23 Forms peer contract",
    );
  }
  if (
    !includesAll(evidence.package?.entrypoints, [
      "@vyrnforge/ui-angular",
      "@vyrnforge/ui-angular/forms",
    ]) ||
    !angularPackage.exports?.["./forms"]
  ) {
    failures.push(
      "MFD-1214 must cover root and Forms Angular package entrypoints",
    );
  }
  if (evidence.package?.published !== false) {
    failures.push(
      "MFD-1214 must not claim the private Angular package is published",
    );
  }

  const compatibility = readJson(
    root,
    "docs/metadata/compatibility-release-matrix.json",
  );
  const supportedCase = (compatibility.cases ?? []).find(
    (entry) => entry.id === evidence.supportedRuntime?.compatibilityCase,
  );
  if (
    evidence.supportedRuntime?.angular !== "22.0.8" ||
    evidence.supportedRuntime?.node !== "24.18.0" ||
    evidence.supportedRuntime?.browser !== "chromium" ||
    supportedCase?.id !== "angular22-node24-chromium" ||
    supportedCase?.fixture !== "angular" ||
    supportedCase?.node !== "24.18.0" ||
    supportedCase?.browser !== "chromium"
  ) {
    failures.push(
      "MFD-1214 supported Angular 22 compatibility case is incomplete",
    );
  }
  const additionalCase = (compatibility.cases ?? []).find(
    (entry) =>
      entry.id === evidence.additionalCompatibilityProbe?.compatibilityCase,
  );
  if (
    additionalCase?.id !== "angular21-node22-chromium" ||
    evidence.additionalCompatibilityProbe?.supportClaim !== false
  ) {
    failures.push(
      "MFD-1214 must distinguish the Angular 21 probe from supported package range",
    );
  }

  const browserMatrix = readJson(
    root,
    "docs/metadata/cross-framework-browser-matrix.json",
  );
  if (
    browserMatrix.program?.status !== "evidence-complete" ||
    !(browserMatrix.consumers ?? []).includes("angular") ||
    !includesAll(
      (browserMatrix.sharedScenarios ?? []).map(({ id }) => id),
      evidence.packedRuntime?.requiredScenarios ?? [],
    )
  ) {
    failures.push(
      "MFD-1214 packed Angular browser-matrix evidence is incomplete",
    );
  }

  const accessibility = readJson(
    root,
    "docs/metadata/cross-framework-accessibility-review.json",
  );
  if (
    accessibility.program?.status !== "evidence-complete" ||
    !(accessibility.consumers ?? []).includes("angular") ||
    !includesAll(
      (accessibility.automatedReview?.scenarios ?? []).map(({ id }) => id),
      evidence.accessibility?.requiredAutomatedScenarios ?? [],
    ) ||
    accessibility.automatedReview?.report !==
      evidence.accessibility?.automatedReport
  ) {
    failures.push(
      "MFD-1214 automated Angular accessibility evidence is incomplete",
    );
  }

  const manualEvidence = readJson(
    root,
    "docs/quality/assistive-technology-results/cf-7010-cross-framework-nvda.json",
  );
  const angularManual = (manualEvidence.consumers ?? []).find(
    ({ id }) => id === "angular",
  );
  if (
    angularManual?.outcome !== "passed" ||
    (angularManual?.checks ?? []).length < 5 ||
    manualEvidence.environment?.assistiveTechnology !== "NVDA"
  ) {
    failures.push("MFD-1214 Angular NVDA evidence is incomplete");
  }

  const forms = readJson(root, "docs/metadata/angular-forms-adapter.json");
  if (
    forms.status !== "verified" ||
    forms.adapter?.supportClaim !== evidence.forms?.supportClaim ||
    forms.adapter?.version !== "22.0.8" ||
    (forms.adapter?.supportedTags ?? []).length !== 14 ||
    !includesAll(forms.evidence, evidence.forms?.requiredRuntimeEvidence ?? [])
  ) {
    failures.push("MFD-1214 Angular Forms evidence is incomplete");
  }

  const fixturePackage = readJson(
    root,
    "tests/consumers/angular/package.json",
  );
  if (
    !fixturePackage.scripts?.["verify:ownership"]?.includes(
      "verify-angular-packed-fixture-ownership.mjs",
    )
  ) {
    failures.push(
      "MFD-1214 packed Angular fixture must enforce package ownership",
    );
  }
  const component = read(
    root,
    "tests/consumers/angular/src/app/app.component.ts",
  );
  for (const marker of evidence.imperativeAndFocus?.requiredMarkers ?? []) {
    if (!component.includes(marker)) {
      failures.push(`MFD-1214 imperative/focus evidence is missing ${marker}`);
    }
  }
  for (const entrypoint of [
    'from "@vyrnforge/ui-angular"',
    'from "@vyrnforge/ui-angular/forms"',
  ]) {
    if (!component.includes(entrypoint)) {
      failures.push(`MFD-1214 packed Angular consumer is missing ${entrypoint}`);
    }
  }

  return failures.sort();
}
