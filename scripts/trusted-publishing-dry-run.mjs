import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

import {
  readReleaseArtifactManifest,
  releaseArtifactDirectory,
  resolveReleaseSelection,
  validateReleaseArtifactManifest,
  verifyReleaseArtifactFiles,
} from "./release-artifact.mjs";
import { repositoryRoot } from "./release-groups.mjs";

export const forbiddenPublishCredentialNames = [
  "NODE_AUTH_TOKEN",
  "NPM_TOKEN",
  "NPM_CONFIG__AUTH",
  "NPM_CONFIG__AUTHTOKEN",
];

export function readArgument(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

export function findConfiguredPublishCredentials(environment) {
  return forbiddenPublishCredentialNames.filter(
    (name) => typeof environment[name] === "string" && environment[name].trim(),
  );
}

export function createCredentialFreeEnvironment(environment) {
  const next = { ...environment };
  for (const name of forbiddenPublishCredentialNames) delete next[name];
  delete next.npm_config__auth;
  delete next.npm_config__authToken;
  next.NPM_CONFIG_PROVENANCE = "false";
  return next;
}

export function createPublishDryRunArgs(tarballPath, distTag) {
  return [
    "publish",
    tarballPath,
    "--dry-run",
    "--json",
    "--access",
    "public",
    "--tag",
    distTag,
  ];
}

function runNpm(args, options = {}) {
  const npmCliPath = process.env.npm_execpath;
  if (npmCliPath) {
    return execFileSync(process.execPath, [npmCliPath, ...args], options);
  }
  return execFileSync(
    process.platform === "win32" ? "npm.cmd" : "npm",
    args,
    options,
  );
}

export function runTrustedPublishingDryRun({
  releaseGroupId,
  version,
  distTag,
  artifactDir = releaseArtifactDirectory,
  environment = process.env,
  root = repositoryRoot,
} = {}) {
  const configuredCredentials = findConfiguredPublishCredentials(environment);
  if (configuredCredentials.length) {
    throw new Error(
      `trusted-publishing dry run requires credential-free environment; found ${configuredCredentials.join(", ")}`,
    );
  }

  resolveReleaseSelection({ releaseGroupId, version, distTag, root });
  const artifactManifest = readReleaseArtifactManifest({ artifactDir, root });
  const failures = [
    ...validateReleaseArtifactManifest({
      artifactManifest,
      releaseGroupId,
      version,
      distTag,
      root,
    }),
    ...verifyReleaseArtifactFiles({ artifactManifest, artifactDir, root }),
  ];
  if (failures.length) {
    throw new Error(
      `trusted-publishing dry run rejected the artifact:\n- ${failures.join("\n- ")}`,
    );
  }

  const childEnvironment = createCredentialFreeEnvironment(environment);
  const packages = [];
  const startedAt = new Date().toISOString();

  for (const packageInfo of artifactManifest.packages) {
    const tarballPath = path.resolve(
      root,
      artifactDir,
      "tarballs",
      packageInfo.filename,
    );
    const args = createPublishDryRunArgs(tarballPath, distTag);
    const output = runNpm(args, {
      cwd: root,
      encoding: "utf8",
      env: childEnvironment,
      stdio: ["ignore", "pipe", "pipe"],
    });
    packages.push({
      name: packageInfo.name,
      version: packageInfo.version,
      filename: packageInfo.filename,
      sha256: packageInfo.sha256,
      command: `npm publish ${packageInfo.filename} --dry-run --json --access public --tag ${distTag}`,
      status: "passed",
      output,
    });
  }

  const report = {
    schemaVersion: 2,
    task: "BT-8007",
    releaseGroup: releaseGroupId,
    version,
    distTag,
    sourceCommit: artifactManifest.sourceCommit,
    ciRunId: artifactManifest.ciRunId,
    credentialFree: true,
    provenanceRequested: false,
    exactTarballs: true,
    startedAt,
    completedAt: new Date().toISOString(),
    packages,
  };
  const reportPath = path.resolve(
    root,
    artifactDir,
    "trusted-publishing-dry-run.json",
  );
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  return { report, reportPath };
}
