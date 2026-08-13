import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import {
  getReleaseGroup,
  getReleasePackageMap,
  readReleaseGroups,
  repositoryRoot,
} from "./release-groups.mjs";

export const releaseArtifactDirectory = "test-results/release-artifact";
export const releaseArtifactManifestName = "manifest.json";
export const releaseArtifactSchemaVersion = 2;

const localDependencyPattern =
  /^(?:workspace:|file:|link:|\.{1,2}(?:[\\/]|$)|[A-Za-z]:[\\/]|\/)/u;
const forbiddenPackedFilePatterns = [
  /^src\//u,
  /(?:^|\/)__tests__\//u,
  /\.(?:test|spec|stories)\.[^/]+$/u,
  /\.tsbuildinfo$/u,
  /\.map$/u,
  /(?:^|\/)\.env(?:\.|$)/u,
  /\.(?:log|tgz|zip)$/u,
  /^(?:draft|confidential)(?:\/|$)/iu,
];

export function readArgument(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

export function resolveReleaseSelection({
  releaseGroupId,
  version,
  distTag,
  root = repositoryRoot,
} = {}) {
  if (!releaseGroupId) throw new Error("missing release group");
  if (!version) throw new Error("missing release version");
  if (!distTag) throw new Error("missing release dist-tag");

  const manifest = readReleaseGroups({ root });
  const releaseGroup = getReleaseGroup(releaseGroupId, { root, manifest });
  if (version !== releaseGroup.version) {
    throw new Error(
      `${releaseGroupId} version must be ${releaseGroup.version}`,
    );
  }
  if (distTag !== releaseGroup.distTag) {
    throw new Error(
      `${releaseGroupId} dist-tag must be ${releaseGroup.distTag}`,
    );
  }

  return {
    manifest,
    releaseGroup,
    packageMap: getReleasePackageMap(manifest),
  };
}

export function getReleaseBuildOrder({ releaseGroup, packageMap }) {
  const closure = new Set();

  function include(name) {
    if (closure.has(name)) return;
    const packageInfo = packageMap.get(name);
    if (!packageInfo) {
      throw new Error(`unknown release package dependency: ${name}`);
    }
    for (const dependencyName of Object.keys(packageInfo.dependencies ?? {})) {
      if (packageMap.has(dependencyName)) include(dependencyName);
    }
    closure.add(name);
  }

  for (const { name } of releaseGroup.packages) include(name);
  return [...closure].map((name) => packageMap.get(name));
}

function hashFile(filePath, algorithm, encoding) {
  const hash = createHash(algorithm);
  hash.update(readFileSync(filePath));
  return hash.digest(encoding);
}

export function sha256File(filePath) {
  return hashFile(filePath, "sha256", "hex");
}

export function sha1File(filePath) {
  return hashFile(filePath, "sha1", "hex");
}

export function sha512IntegrityFile(filePath) {
  return `sha512-${hashFile(filePath, "sha512", "base64")}`;
}

function exactOrder(actual, expected) {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

function collectStringTargets(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStringTargets);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStringTargets);
  }
  return [];
}

function normalizeTarget(target) {
  return target.replace(/^\.\//u, "");
}

function validatePackageManifest(packageInfo, packageJson) {
  const failures = [];

  if (packageJson.name !== packageInfo.name) {
    failures.push(`${packageInfo.name}: package name mismatch`);
  }
  if (packageJson.publishConfig?.access !== "public") {
    failures.push(`${packageInfo.name}: publishConfig.access must be public`);
  }
  if (packageJson.private === true) {
    failures.push(
      `${packageInfo.name}: publishable package must not be private`,
    );
  }

  for (const [dependencyName, expectedVersion] of Object.entries(
    packageInfo.dependencies ?? {},
  )) {
    if (packageJson.dependencies?.[dependencyName] !== expectedVersion) {
      failures.push(
        `${packageInfo.name}: ${dependencyName} must equal ${expectedVersion}`,
      );
    }
  }

  for (const dependencyGroup of [
    "dependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    for (const [dependencyName, dependencySpec] of Object.entries(
      packageJson[dependencyGroup] ?? {},
    )) {
      if (
        typeof dependencySpec !== "string" ||
        localDependencyPattern.test(dependencySpec)
      ) {
        failures.push(
          `${packageInfo.name}: ${dependencyName} must not use a local/workspace dependency spec`,
        );
      }
    }
  }

  return failures;
}

export function validatePackedPayload(packageInfo, packageJson, files) {
  const failures = [];
  const exportTargets = collectStringTargets(packageJson.exports ?? {});
  const requiredFiles = [
    "LICENSE",
    "README.md",
    "package.json",
    packageJson.main,
    packageJson.module,
    packageJson.types,
    packageJson.customElements,
    ...exportTargets,
  ]
    .filter((file) => typeof file === "string" && file.length > 0)
    .map(normalizeTarget);
  const uniqueRequiredFiles = [...new Set(requiredFiles)];
  const allowedRootFiles = new Set(
    uniqueRequiredFiles.filter((file) => !file.startsWith("dist/")),
  );
  const declarationFiles = files.filter((file) => file.endsWith(".d.ts"));
  const cssFiles = files.filter((file) => file.endsWith(".css"));

  if (packageJson.types && declarationFiles.length === 0) {
    failures.push(`${packageInfo.name}: declarations are required by package metadata`);
  }
  if (packageInfo.policies?.hasCss === true && cssFiles.length === 0) {
    failures.push(`${packageInfo.name}: CSS payload is required by release metadata`);
  }

  for (const requiredFile of uniqueRequiredFiles) {
    if (!files.includes(requiredFile)) {
      failures.push(`${packageInfo.name}: tarball is missing ${requiredFile}`);
    }
  }

  for (const file of files) {
    if (!file.startsWith("dist/") && !allowedRootFiles.has(file)) {
      failures.push(`${packageInfo.name}: unexpected tarball file ${file}`);
    }
    if (forbiddenPackedFilePatterns.some((pattern) => pattern.test(file))) {
      failures.push(`${packageInfo.name}: forbidden tarball file ${file}`);
    }
    const generatedDeclarationSupport =
      file.startsWith("dist/") && file.endsWith(".d.ts");
    if (
      file !== "LICENSE" &&
      !generatedDeclarationSupport &&
      /(legal|draft|internal|confidential)/iu.test(file)
    ) {
      failures.push(`${packageInfo.name}: internal/legal tarball file ${file}`);
    }
  }

  return failures;
}

export function validateReleaseArtifactManifest({
  artifactManifest,
  releaseGroupId,
  version,
  distTag,
  sourceCommit,
  ciRunId,
  root = repositoryRoot,
} = {}) {
  const failures = [];
  const { releaseGroup, packageMap } = resolveReleaseSelection({
    releaseGroupId,
    version,
    distTag,
    root,
  });
  const expectedNames = releaseGroup.packages.map(({ name }) => name);
  const expectedBuildClosure = getReleaseBuildOrder({
    releaseGroup,
    packageMap,
  }).map(({ name }) => name);

  if (!exactOrder(artifactManifest?.buildClosure ?? [], expectedBuildClosure)) {
    failures.push("release artifact build closure does not match release metadata");
  }

  if (artifactManifest?.schemaVersion !== releaseArtifactSchemaVersion) {
    failures.push("release artifact schemaVersion mismatch");
  }
  if (artifactManifest?.releaseGroup !== releaseGroupId) {
    failures.push("release artifact release-group mismatch");
  }
  if (artifactManifest?.version !== version) {
    failures.push("release artifact version mismatch");
  }
  if (artifactManifest?.distTag !== distTag) {
    failures.push("release artifact dist-tag mismatch");
  }
  if (
    typeof artifactManifest?.sourceCommit !== "string" ||
    !/^[0-9a-f]{40}$/u.test(artifactManifest.sourceCommit)
  ) {
    failures.push("release artifact source commit is invalid");
  }
  if (sourceCommit && artifactManifest?.sourceCommit !== sourceCommit) {
    failures.push("release artifact source commit does not match the workflow");
  }
  if (
    typeof artifactManifest?.ciRunId !== "string" ||
    !/^[0-9]+$/u.test(artifactManifest.ciRunId)
  ) {
    failures.push("release artifact CI run ID is invalid");
  }
  if (ciRunId && artifactManifest?.ciRunId !== String(ciRunId)) {
    failures.push("release artifact CI run ID does not match the workflow");
  }
  if (Number.isNaN(Date.parse(artifactManifest?.createdAt ?? ""))) {
    failures.push("release artifact creation timestamp is invalid");
  }

  const packages = artifactManifest?.packages ?? [];
  if (
    !exactOrder(
      packages.map(({ name }) => name),
      expectedNames,
    )
  ) {
    failures.push(
      "release artifact package order does not match the release group",
    );
  }

  for (const packageInfo of releaseGroup.packages) {
    const artifact = packages.find(({ name }) => name === packageInfo.name);
    if (!artifact) continue;

    const packageJson = JSON.parse(
      readFileSync(
        path.join(root, packageInfo.directory, "package.json"),
        "utf8",
      ),
    );
    failures.push(...validatePackageManifest(packageInfo, packageJson));

    if (artifact.directory !== packageInfo.directory) {
      failures.push(`${packageInfo.name}: artifact directory mismatch`);
    }
    if (artifact.version !== version || packageJson.version !== version) {
      failures.push(`${packageInfo.name}: artifact version mismatch`);
    }
    if (!/^[A-Za-z0-9._-]+\.tgz$/u.test(artifact.filename ?? "")) {
      failures.push(`${packageInfo.name}: invalid tarball filename`);
    }
    if (!/^[0-9a-f]{64}$/u.test(artifact.sha256 ?? "")) {
      failures.push(`${packageInfo.name}: invalid SHA-256 digest`);
    }
    if (!/^sha512-[A-Za-z0-9+/=]+$/u.test(artifact.integrity ?? "")) {
      failures.push(`${packageInfo.name}: invalid npm integrity`);
    }
    if (!/^[0-9a-f]{40}$/u.test(artifact.shasum ?? "")) {
      failures.push(`${packageInfo.name}: invalid npm shasum`);
    }
    if (!Number.isInteger(artifact.packedSize) || artifact.packedSize <= 0) {
      failures.push(`${packageInfo.name}: invalid packed size`);
    }
    if (
      !Number.isInteger(artifact.unpackedSize) ||
      artifact.unpackedSize <= 0
    ) {
      failures.push(`${packageInfo.name}: invalid unpacked size`);
    }

    const files = artifact.files ?? [];
    if (!Array.isArray(files)) {
      failures.push(`${packageInfo.name}: tarball file list is invalid`);
      continue;
    }
    if (artifact.fileCount !== files.length) {
      failures.push(`${packageInfo.name}: tarball file count mismatch`);
    }
    failures.push(...validatePackedPayload(packageInfo, packageJson, files));
  }

  return [...new Set(failures)].sort();
}

export function readReleaseArtifactManifest({
  artifactDir = releaseArtifactDirectory,
  root = repositoryRoot,
} = {}) {
  const filePath = path.resolve(root, artifactDir, releaseArtifactManifestName);
  if (!existsSync(filePath)) {
    throw new Error(`release artifact manifest is missing: ${filePath}`);
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function verifyReleaseArtifactFiles({
  artifactManifest,
  artifactDir = releaseArtifactDirectory,
  root = repositoryRoot,
} = {}) {
  const failures = [];
  for (const packageInfo of artifactManifest.packages ?? []) {
    const tarballPath = path.resolve(
      root,
      artifactDir,
      "tarballs",
      packageInfo.filename,
    );
    if (!existsSync(tarballPath)) {
      failures.push(`${packageInfo.name}: tarball is missing`);
      continue;
    }
    if (statSync(tarballPath).size !== packageInfo.packedSize) {
      failures.push(`${packageInfo.name}: tarball size changed`);
    }
    if (sha256File(tarballPath) !== packageInfo.sha256) {
      failures.push(`${packageInfo.name}: SHA-256 digest changed`);
    }
    if (sha1File(tarballPath) !== packageInfo.shasum) {
      failures.push(`${packageInfo.name}: npm shasum changed`);
    }
    if (sha512IntegrityFile(tarballPath) !== packageInfo.integrity) {
      failures.push(`${packageInfo.name}: npm integrity changed`);
    }
  }
  return failures;
}
