import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { buildReleaseDryRunPlan } from "./release-dry-run.mjs";
import { readReleaseGroups, repositoryRoot } from "./release-groups.mjs";

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function runNode(script, args = []) {
  return execFileSync(process.execPath, [script, ...args], {
    cwd: repositoryRoot,
    env: process.env,
    stdio: "inherit",
  });
}

function readHeadCommit() {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  }).trim();
}

const sourceCommit = readArgument("--source-commit") ?? readHeadCommit();
const ciRunId = readArgument("--ci-run-id") ?? "0";
const outputRoot =
  readArgument("--output-dir") ?? "test-results/release-dry-run";

if (!/^[0-9a-f]{40}$/u.test(sourceCommit)) {
  throw new Error("release dry-run requires a valid source commit");
}

if (!/^[0-9]+$/u.test(ciRunId)) {
  throw new Error("release dry-run requires a numeric CI run id");
}

const manifest = readReleaseGroups({ root: repositoryRoot });
const plan = buildReleaseDryRunPlan({
  manifest,
  root: repositoryRoot,
});

const absoluteOutputRoot = path.resolve(repositoryRoot, outputRoot);
rmSync(absoluteOutputRoot, { recursive: true, force: true });
mkdirSync(absoluteOutputRoot, { recursive: true });

runNode("scripts/verify-trusted-publishing-provenance.mjs");

const releaseLines = [];

for (const releaseLine of plan) {
  const lineRoot = path.posix.join(outputRoot, releaseLine.releaseGroupId);
  const artifactDir = path.posix.join(lineRoot, "artifact");
  const releaseNotes = path.posix.join(lineRoot, "release-notes.md");

  mkdirSync(path.resolve(repositoryRoot, lineRoot), { recursive: true });

  const selectionArgs = [
    "--release-group",
    releaseLine.releaseGroupId,
    "--version",
    releaseLine.version,
    "--dist-tag",
    releaseLine.distTag,
  ];

  runNode("scripts/prepare-release-artifact.mjs", [
    ...selectionArgs,
    "--source-commit",
    sourceCommit,
    "--ci-run-id",
    ciRunId,
    "--artifact-dir",
    artifactDir,
  ]);

  runNode("scripts/verify-release-artifact.mjs", [
    ...selectionArgs,
    "--source-commit",
    sourceCommit,
    "--ci-run-id",
    ciRunId,
    "--artifact-dir",
    artifactDir,
  ]);

  runNode("scripts/verify-trusted-publishing-dry-run.mjs", [
    ...selectionArgs,
    "--artifact-dir",
    artifactDir,
  ]);

  runNode("scripts/verify-release-size-budgets.mjs", [
    "--release-group",
    releaseLine.releaseGroupId,
    "--artifact-dir",
    artifactDir,
  ]);

  runNode("scripts/create-release-notes.mjs", [
    ...selectionArgs,
    "--commit",
    sourceCommit,
    "--output",
    releaseNotes,
  ]);

  releaseLines.push({
    ...releaseLine,
    artifactDir,
    releaseNotes,
    status: "passed",
  });
}

const consumerMatrixReport = path.posix.join(
  outputRoot,
  "consumer-matrix.json",
);
const consumerTraceDirectory = path.posix.join(outputRoot, "consumer-traces");

runNode("scripts/verify-consumer-foundations-runtime.mjs", [
  "--matrix-report",
  consumerMatrixReport,
  "--trace-dir",
  consumerTraceDirectory,
]);

const report = {
  schemaVersion: 1,
  task: "MFD-1517",
  sourceCommit,
  ciRunId,
  syntheticCiRunId: ciRunId === "0",
  publishingPerformed: false,
  releaseLines,
  consumerMatrixReport,
  consumerTraceDirectory,
  status: "passed",
};

writeFileSync(
  path.join(absoluteOutputRoot, "report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(
  `MFD-1517 release dry run passed for ${releaseLines.length} release lines without publication.`,
);
