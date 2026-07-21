import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const evidenceStatuses = new Set(["complete", "pending", "not-applicable"]);
const complexCategories = new Set([
  "composite",
  "navigation",
  "overlay",
  "data-grid",
  "grid-feature",
]);
const interactiveCategories = new Set([
  "form-control",
  "composite",
  "navigation",
  "overlay",
  "data-grid",
  "grid-feature",
]);
const categories = new Set([
  "primitive",
  "form-control",
  "composite",
  "navigation",
  "overlay",
  "feedback",
  "data-display",
  "data-grid",
  "grid-feature",
  "internal",
]);
const baselineFields = [
  "owner",
  "publicApiReview",
  "publicExportVerification",
  "logicUnitTests",
  "automatedAccessibility",
  "lightThemeValidation",
  "darkThemeValidation",
  "densityValidation",
  "documentation",
  "playgroundExample",
  "knownLimitations",
];

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function evidenceFailure(failures, key, maturity, field, reason) {
  failures.push(`${key} (${maturity}): ${reason} evidence '${field}'`);
}

function requireEvidence(
  failures,
  key,
  maturity,
  evidence,
  field,
  allowedStatuses = ["complete"],
) {
  const record = evidence[field];
  if (!record) {
    evidenceFailure(failures, key, maturity, field, "missing");
    return;
  }
  if (typeof record !== "object" || !evidenceStatuses.has(record.status)) {
    evidenceFailure(failures, key, maturity, field, "invalid");
    return;
  }
  if (!allowedStatuses.includes(record.status)) {
    evidenceFailure(failures, key, maturity, field, record.status);
    return;
  }
  if (record.status === "complete" && typeof record.reference !== "string") {
    evidenceFailure(failures, key, maturity, field, "missing reference for");
  }
  if (record.status !== "complete" && typeof record.rationale !== "string") {
    evidenceFailure(failures, key, maturity, field, "missing rationale for");
  }
}

function verifyEvidenceEntry(failures, key, maturity, evidence) {
  if (evidence.maturityState !== maturity) {
    failures.push(
      `${key} (${maturity}): maturityState must match the component status`,
    );
  }
  if (!categories.has(evidence.category)) {
    failures.push(
      `${key} (${maturity}): missing or unsupported component category`,
    );
    return;
  }
  if (maturity === "planned") return;
  if (maturity === "experimental") {
    for (const field of [
      "owner",
      "implementationLocation",
      "documentationLocation",
    ]) {
      requireEvidence(failures, key, maturity, evidence, field);
    }
    return;
  }
  if (maturity === "deprecated") {
    for (const field of [
      "replacementOrReason",
      "deprecationVersion",
      "migrationGuidance",
    ]) {
      requireEvidence(failures, key, maturity, evidence, field);
    }
    requireEvidence(
      failures,
      key,
      maturity,
      evidence,
      "intendedRemovalWindow",
      ["complete", "not-applicable"],
    );
    return;
  }

  for (const field of baselineFields)
    requireEvidence(failures, key, maturity, evidence, field);
  if (interactiveCategories.has(evidence.category)) {
    requireEvidence(failures, key, maturity, evidence, "domInteractionTests");
    requireEvidence(failures, key, maturity, evidence, "keyboardContract");
  }

  const browserRequired =
    complexCategories.has(evidence.category) ||
    evidence.browserEvidenceRequired === true;
  if (browserRequired) {
    requireEvidence(
      failures,
      key,
      maturity,
      evidence,
      "browserTests",
      maturity === "stable" ? ["complete"] : ["complete", "pending"],
    );
  }

  if (maturity === "alpha-stable") return;
  for (const field of [
    "consumingApplication",
    "compatibilityEvidence",
    "criticalDefects",
  ]) {
    requireEvidence(failures, key, maturity, evidence, field);
  }
  requireEvidence(failures, key, maturity, evidence, "migrationInformation", [
    "complete",
    "not-applicable",
  ]);
  if (evidence.criticalDefects?.unresolved === true) {
    failures.push(
      `${key} (${maturity}): unresolved critical defects block maturity`,
    );
  }
  if (maturity === "beta-stable") return;
  for (const field of [
    "supportedBrowserEvidence",
    "acceptedAccessibilityReview",
    "releaseApiStability",
    "deprecationPolicyCompliance",
    "maintainerCommitment",
  ]) {
    requireEvidence(failures, key, maturity, evidence, field);
  }
}

export function verifyMaturityMetadata(catalog) {
  const failures = [];
  const model = catalog.maturityEvidence;
  if (
    !model ||
    model.schemaVersion !== 2 ||
    !model.transitionPolicy ||
    !model.entries
  ) {
    return ["components.json: missing maturityEvidence schema version 2"];
  }
  if (model.transitionPolicy.mode !== "new-promotions-only") {
    failures.push(
      "components.json: unsupported maturity evidence transition policy",
    );
  }
  const legacyList = model.transitionPolicy.legacyUnverifiedEntries ?? [];
  const legacyEntries = new Set(legacyList);
  if (legacyList.length > 0) {
    for (const field of ["closureTask", "verificationDeadlineGate", "releaseBlock"]) {
      if (!model.transitionPolicy[field]) {
        failures.push(
          `components.json: legacy maturity transition requires ${field}`,
        );
      }
    }
  }
  if (legacyEntries.size !== legacyList.length) {
    failures.push("components.json: duplicate legacyUnverifiedEntries values");
  }
  const componentsById = new Map(
    (catalog.components ?? []).map((component) => [component.id, component]),
  );
  for (const legacyKey of legacyEntries) {
    const component = componentsById.get(legacyKey);
    if (!component) {
      failures.push(`components.json: unknown legacy maturity entry ${legacyKey}`);
      continue;
    }
    if (!["alpha-stable", "beta-stable", "stable", "deprecated"].includes(component.maturity)) {
      failures.push(
        `${legacyKey} (${component.maturity}): lower-maturity entries must not use the legacy evidence exception`,
      );
    }
  }
  for (const component of catalog.components ?? []) {
    const key = component.id;
    const maturity = component.maturity;
    if (maturity === "internal") continue;
    const evidence = model.entries[key];
    if (!evidence) {
      if (legacyEntries.has(key) || maturity === "planned" || maturity === "experimental") continue;
      failures.push(`${key} (${maturity}): missing maturity evidence record`);
      continue;
    }
    verifyEvidenceEntry(failures, key, maturity, evidence);
  }
  return failures.sort();
}

export function verifyComponentMaturity({ root = repositoryRoot } = {}) {
  return verifyMaturityMetadata(
    readJson(root, "docs/metadata/components.json"),
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const failures = verifyComponentMaturity();
  if (failures.length > 0) {
    throw new Error(
      `Component maturity verification failed:\n- ${failures.join("\n- ")}`,
    );
  }
  const catalog = readJson(repositoryRoot, "docs/metadata/components.json");
  const transition = catalog.maturityEvidence.transitionPolicy;
  const legacyCount = transition.legacyUnverifiedEntries?.length ?? 0;
  console.log(
    legacyCount > 0
      ? `Component maturity verification passed with ${legacyCount} explicitly unverified legacy entries; closure is required by ${transition.verificationDeadlineGate} through ${transition.closureTask} and before ${transition.releaseBlock}.`
      : "Component maturity verification passed with no legacy evidence exceptions.",
  );
}
