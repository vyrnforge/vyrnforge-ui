import { execFileSync } from "node:child_process";
import path from "node:path";

import {
  readArgument,
  readReleaseArtifactManifest,
  releaseArtifactDirectory,
  resolveReleaseSelection,
  validateReleaseArtifactManifest,
  verifyReleaseArtifactFiles,
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

function npmJson(args) {
  return JSON.parse(
    runNpm([...args, "--json", "--registry=https://registry.npmjs.org"]),
  );
}

function existingVersion(packageName, version) {
  try {
    return npmJson(["view", `${packageName}@${version}`]);
  } catch (error) {
    const output = `${error.stdout ?? ""}\n${error.stderr ?? ""}`;
    if (/\bE404\b|404 Not Found/iu.test(output)) return null;
    throw error;
  }
}

function verifyExistingPublishedPackage(packageInfo, distTag) {
  const metadata = existingVersion(packageInfo.name, packageInfo.version);
  if (!metadata) return false;

  if (metadata.dist?.integrity !== packageInfo.integrity) {
    throw new Error(
      `${packageInfo.name}: registry integrity differs from the verified tarball`,
    );
  }
  if (metadata.dist?.shasum !== packageInfo.shasum) {
    throw new Error(
      `${packageInfo.name}: registry shasum differs from the verified tarball`,
    );
  }

  const tags = npmJson(["view", packageInfo.name, "dist-tags"]);
  if (tags[distTag] !== packageInfo.version) {
    throw new Error(
      `${packageInfo.name}: ${distTag} does not point to ${packageInfo.version}`,
    );
  }
  return true;
}

function sleep(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

const releaseGroupId = readArgument(process.argv, "--release-group");
const version = readArgument(process.argv, "--version");
const distTag = readArgument(process.argv, "--dist-tag");
const sourceCommit = readArgument(process.argv, "--source-commit");
const ciRunId = readArgument(process.argv, "--ci-run-id");
const currentMain = readArgument(process.argv, "--current-main");
const artifactDir =
  readArgument(process.argv, "--artifact-dir") ?? releaseArtifactDirectory;

if (!/^[0-9a-f]{40}$/u.test(currentMain ?? "")) {
  throw new Error("missing or invalid --current-main");
}

resolveReleaseSelection({ releaseGroupId, version, distTag });
const artifactManifest = readReleaseArtifactManifest({ artifactDir });
const failures = [
  ...validateReleaseArtifactManifest({
    artifactManifest,
    releaseGroupId,
    version,
    distTag,
    sourceCommit,
    ciRunId,
  }),
  ...verifyReleaseArtifactFiles({ artifactManifest, artifactDir }),
];
if (failures.length) {
  throw new Error(`refusing publication:\n- ${failures.join("\n- ")}`);
}

/*
 * Preflight every selected package before publishing any new bytes.
 * This prevents discovering a conflicting pre-existing version only after
 * earlier packages in the release group have already been published.
 */
const alreadyPublished = new Map();
for (const packageInfo of artifactManifest.packages) {
  alreadyPublished.set(
    packageInfo.name,
    verifyExistingPublishedPackage(packageInfo, distTag),
  );
}

const publicationAlreadyStarted = [...alreadyPublished.values()].some(Boolean);
if (
  artifactManifest.sourceCommit !== currentMain &&
  !publicationAlreadyStarted
) {
  throw new Error(
    `release commit ${artifactManifest.sourceCommit} is no longer current main ${currentMain}; refusing to start npm publication`,
  );
}
if (
  artifactManifest.sourceCommit !== currentMain &&
  publicationAlreadyStarted
) {
  console.log(
    `SAFE PARTIAL RETRY: current main advanced to ${currentMain}, but exact publication already started; continuing only with the retained verified tarballs.`,
  );
}

for (const packageInfo of artifactManifest.packages) {
  const tarballPath = path.resolve(
    repositoryRoot,
    artifactDir,
    "tarballs",
    packageInfo.filename,
  );

  if (alreadyPublished.get(packageInfo.name)) {
    console.log(
      `SAFE RETRY ${packageInfo.name}@${packageInfo.version}: registry bytes already match the verified tarball.`,
    );
    continue;
  }

  console.log(
    `PUBLISH ${packageInfo.name}@${packageInfo.version}: ${packageInfo.filename}`,
  );
  runNpm(["publish", tarballPath, "--access", "public", "--tag", distTag], {
    stdio: "inherit",
  });

  let propagated = false;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    try {
      if (verifyExistingPublishedPackage(packageInfo, distTag)) {
        propagated = true;
        break;
      }
    } catch (error) {
      if (attempt === 11) throw error;
    }
    sleep(5000);
  }
  if (!propagated) {
    throw new Error(`${packageInfo.name}: publication did not propagate`);
  }
}

console.log(
  `Exact release artifact publication passed: ${releaseGroupId} ${version}.`,
);
