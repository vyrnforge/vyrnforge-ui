import { writeFileSync } from "node:fs";
import path from "node:path";

import { readArgument, releaseArtifactDirectory } from "./release-artifact.mjs";
import { verifyReleaseSizeBudgets } from "./release-size-budgets.mjs";

const releaseGroupId = readArgument(process.argv, "--release-group");
const artifactDir =
  readArgument(process.argv, "--artifact-dir") ?? releaseArtifactDirectory;

if (!releaseGroupId) {
  throw new Error("missing --release-group");
}

const failures = verifyReleaseSizeBudgets({ releaseGroupId, artifactDir });
writeFileSync(
  path.join(artifactDir, "size-report.json"),
  `${JSON.stringify({ schemaVersion: 1, releaseGroup: releaseGroupId, failures }, null, 2)}\n`,
);
if (failures.length) {
  throw new Error(`release size budget verification failed:\n- ${failures.join("\n- ")}`);
}

console.log(`Release size budgets passed: ${releaseGroupId}.`);
