import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  getReleaseGroup,
  readReleaseGroups,
  repositoryRoot,
} from "./release-groups.mjs";

export const trustedPublishingReportDirectory =
  "test-results/trusted-publishing";
export const forbiddenPublishCredentialNames = [
  "NODE_AUTH_TOKEN",
  "NPM_TOKEN",
  "NPM_CONFIG__AUTH",
  "NPM_CONFIG__AUTHTOKEN",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

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

export function createPublishDryRunArgs(packageInfo, distTag) {
  return [
    "publish",
    `./${packageInfo.directory}`,
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
  environment = process.env,
  root = repositoryRoot,
} = {}) {
  const configuredCredentials = findConfiguredPublishCredentials(environment);
  assert(
    configuredCredentials.length === 0,
    `trusted-publishing dry run requires credential-free environment; found ${configuredCredentials.join(", ")}`,
  );

  const manifest = readReleaseGroups({ root });
  const releaseGroup = getReleaseGroup(releaseGroupId, { root, manifest });
  assert(
    version === releaseGroup.version,
    `${releaseGroupId} version mismatch`,
  );
  assert(
    distTag === releaseGroup.distTag,
    `${releaseGroupId} dist-tag mismatch`,
  );

  const childEnvironment = createCredentialFreeEnvironment(environment);
  const startedAt = new Date().toISOString();
  const packages = [];

  for (const packageInfo of releaseGroup.packages) {
    const packageJson = JSON.parse(
      readFileSync(
        path.join(root, packageInfo.directory, "package.json"),
        "utf8",
      ),
    );
    assert(
      packageJson.name === packageInfo.name,
      `${packageInfo.directory} package name mismatch`,
    );
    assert(
      packageJson.version === releaseGroup.version,
      `${packageInfo.name} version mismatch`,
    );
    assert(
      packageJson.publishConfig?.access === "public",
      `${packageInfo.name} publishConfig.access must be public`,
    );

    const args = createPublishDryRunArgs(packageInfo, distTag);
    const output = runNpm(args, {
      cwd: root,
      encoding: "utf8",
      env: childEnvironment,
      stdio: ["ignore", "pipe", "pipe"],
    });
    packages.push({
      name: packageInfo.name,
      directory: packageInfo.directory,
      version: packageJson.version,
      command: `npm ${args.join(" ")}`,
      status: "passed",
      output,
    });
  }

  const report = {
    schemaVersion: 1,
    task: "BT-8007",
    releaseGroup: releaseGroupId,
    version,
    distTag,
    credentialFree: true,
    provenanceRequested: false,
    startedAt,
    completedAt: new Date().toISOString(),
    packages,
  };
  const reportDirectory = path.join(root, trustedPublishingReportDirectory);
  mkdirSync(reportDirectory, { recursive: true });
  const reportPath = path.join(reportDirectory, `${releaseGroupId}.json`);
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  return { report, reportPath };
}
