import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  getReleaseBuildOrder,
  readArgument,
  releaseArtifactDirectory,
  releaseArtifactManifestName,
  releaseArtifactSchemaVersion,
  resolveReleaseSelection,
  sha256File,
} from "./release-artifact.mjs";
import { repositoryRoot } from "./release-groups.mjs";

const npmCliPath = process.env.npm_execpath;

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function runNpm(args, options = {}) {
  if (npmCliPath) {
    return run(process.execPath, [npmCliPath, ...args], options);
  }
  return run(process.platform === "win32" ? "npm.cmd" : "npm", args, options);
}

const releaseGroupId = readArgument(process.argv, "--release-group");
const version = readArgument(process.argv, "--version");
const distTag = readArgument(process.argv, "--dist-tag");
const sourceCommit = readArgument(process.argv, "--source-commit");
const ciRunId = readArgument(process.argv, "--ci-run-id");

if (!/^[0-9a-f]{40}$/u.test(sourceCommit ?? "")) {
  throw new Error("missing or invalid --source-commit");
}
if (!/^[0-9]+$/u.test(ciRunId ?? "")) {
  throw new Error("missing or invalid --ci-run-id");
}

const { releaseGroup, packageMap } = resolveReleaseSelection({
  releaseGroupId,
  version,
  distTag,
});
const artifactRoot = path.join(repositoryRoot, releaseArtifactDirectory);
const tarballDirectory = path.join(artifactRoot, "tarballs");

rmSync(artifactRoot, { recursive: true, force: true });
mkdirSync(tarballDirectory, { recursive: true });

runNpm(["run", "clean:packages"], { stdio: "inherit" });
for (const packageInfo of getReleaseBuildOrder({ releaseGroup, packageMap })) {
  runNpm(
    ["run", "build", "--ignore-scripts", "--workspace", packageInfo.name],
    {
      stdio: "inherit",
    },
  );
}

const packageArtifacts = [];
for (const packageInfo of releaseGroup.packages) {
  const packageDirectory = path.join(repositoryRoot, packageInfo.directory);
  const output = runNpm(
    [
      "pack",
      "--ignore-scripts",
      "--pack-destination",
      tarballDirectory,
      "--json",
    ],
    { cwd: packageDirectory },
  );
  const [packInfo] = JSON.parse(output);
  const tarballPath = path.join(tarballDirectory, packInfo.filename);

  packageArtifacts.push({
    name: packageInfo.name,
    directory: packageInfo.directory,
    version: packInfo.version,
    filename: packInfo.filename,
    sha256: sha256File(tarballPath),
    integrity: packInfo.integrity,
    shasum: packInfo.shasum,
    packedSize: packInfo.size,
    unpackedSize: packInfo.unpackedSize,
    fileCount: packInfo.files?.length ?? 0,
    files: (packInfo.files ?? []).map(({ path: file }) => file),
  });
}

const artifactManifest = {
  schemaVersion: releaseArtifactSchemaVersion,
  releaseGroup: releaseGroupId,
  version,
  distTag,
  sourceCommit,
  ciRunId: String(ciRunId),
  createdAt: new Date().toISOString(),
  packages: packageArtifacts,
};
writeFileSync(
  path.join(artifactRoot, releaseArtifactManifestName),
  `${JSON.stringify(artifactManifest, null, 2)}\n`,
);

if (releaseGroupId === "non-grid-beta") {
  const betaReportDirectory = path.join(
    repositoryRoot,
    "test-results/beta-package-artifacts",
  );
  mkdirSync(betaReportDirectory, { recursive: true });
  writeFileSync(
    path.join(betaReportDirectory, "tarball-report.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        task: "BT-8003",
        releaseGroup: {
          id: releaseGroupId,
          version,
          packageCount: releaseGroup.packages.length,
        },
        generatedAt: new Date().toISOString(),
        packages: packageArtifacts.map((packageInfo) => ({
          name: packageInfo.name,
          version: packageInfo.version,
          filename: packageInfo.filename,
          integrity: packageInfo.integrity,
          shasum: packageInfo.shasum,
          packedSize: packageInfo.packedSize,
          unpackedSize: packageInfo.unpackedSize,
          fileCount: packageInfo.fileCount,
          files: packageInfo.files,
        })),
      },
      null,
      2,
    )}\n`,
  );
}

console.log(
  `Prepared ${packageArtifacts.length} immutable release tarballs in ${releaseArtifactDirectory}.`,
);
