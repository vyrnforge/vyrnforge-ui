import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const metadataPath = "docs/metadata/multi-framework-migration-guide.json";

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}
function readJson(root, relativePath) {
  return JSON.parse(read(root, relativePath));
}
function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function isoDate(value) {
  return nonEmpty(value) && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function verifyMultiFrameworkMigrationGuide({
  root = repositoryRoot,
} = {}) {
  const failures = [];
  if (!existsSync(path.join(root, metadataPath))) {
    return [`required CF-7013 file is missing: ${metadataPath}`];
  }
  const metadata = readJson(root, metadataPath);
  for (const file of [
    metadata.guide,
    "MIGRATION.md",
    "docs/release/README.md",
  ]) {
    if (!nonEmpty(file) || !existsSync(path.join(root, file))) {
      failures.push(`required CF-7013 file is missing: ${String(file)}`);
    }
  }
  if (failures.length > 0) return failures.sort();

  if (
    metadata.schemaVersion !== 1 ||
    metadata.program?.task !== "CF-7013" ||
    metadata.program?.sprint !== "S7" ||
    metadata.program?.gate !== "GMF4"
  ) {
    failures.push(
      "multi-framework migration guide program must be S7 / CF-7013 / GMF4",
    );
  }
  if (
    !["review-required", "evidence-complete", "blocked"].includes(
      metadata.program?.status,
    )
  ) {
    failures.push(
      "CF-7013 status must be review-required, evidence-complete, or blocked",
    );
  }
  const expectedClaim =
    metadata.program?.status === "evidence-complete"
      ? "multi-framework-migration-guide-verified"
      : metadata.program?.status === "blocked"
        ? "multi-framework-migration-guide-blocked"
        : "multi-framework-migration-guide-review-ready";
  if (metadata.supportClaim !== expectedClaim) {
    failures.push(`CF-7013 support claim must be ${expectedClaim}`);
  }

  const guide = read(root, metadata.guide);
  for (const marker of [
    "## Choose React components or native elements",
    "## React migration",
    "## Native HTML migration",
    "## Angular integration",
    "## Vue integration",
    "## Beta guarantees",
    "## Current exclusions and limitations",
    "## Data-grid scope",
    "## Migrating existing one-off wrappers",
    "## Versioning and upgrade path",
    "@vyrnforge/ui-components",
    "@vyrnforge/ui-elements",
    "CUSTOM_ELEMENTS_SCHEMA",
    "v-model",
    "Redux",
    "NgRx",
    "Pinia",
    "Zustand",
    "React alpha track",
  ]) {
    if (!guide.includes(marker)) {
      failures.push(`CF-7013 guide is missing ${marker}`);
    }
  }
  const rootMigration = read(root, "MIGRATION.md");
  if (!rootMigration.includes(metadata.guide)) {
    failures.push("root MIGRATION.md must link to the canonical CF-7013 guide");
  }
  const releaseIndex = read(root, "docs/release/README.md");
  if (!releaseIndex.includes("multi-framework-migration-and-limitations.md")) {
    failures.push("release index must publish the CF-7013 guide");
  }

  if (metadata.program?.status === "evidence-complete") {
    const reviewPath = metadata.reviewEvidence;
    if (!nonEmpty(reviewPath) || !existsSync(path.join(root, reviewPath))) {
      failures.push(
        `CF-7013 review evidence is missing: ${String(reviewPath)}`,
      );
    } else {
      const review = readJson(root, reviewPath);
      if (review.schemaVersion !== 1 || review.task !== "CF-7013") {
        failures.push(
          "CF-7013 review evidence must use schema version 1 and task CF-7013",
        );
      }
      if (!nonEmpty(review.reviewer) || !isoDate(review.reviewedAt)) {
        failures.push(
          "CF-7013 review evidence requires reviewer and reviewedAt",
        );
      }
      if (review.outcome !== "passed") {
        failures.push(
          "CF-7013 evidence-complete requires a passed documentation review",
        );
      }
      if (
        !Array.isArray(review.confirmedTopics) ||
        review.confirmedTopics.length !== metadata.requiredTopics.length
      ) {
        failures.push("CF-7013 review must confirm every required topic");
      }
      if (!nonEmpty(review.notes)) {
        failures.push("CF-7013 review evidence requires notes");
      }
    }
    if ((metadata.unresolvedBlockers ?? []).length !== 0) {
      failures.push(
        "CF-7013 evidence-complete cannot retain unresolved blockers",
      );
    }
  } else if ((metadata.unresolvedBlockers ?? []).length === 0) {
    failures.push(
      "incomplete CF-7013 metadata must preserve an explicit blocker",
    );
  }

  return failures.sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifyMultiFrameworkMigrationGuide();
  if (failures.length > 0) {
    console.error("Multi-framework migration guide verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("Multi-framework migration guide verification passed.");
  }
}
