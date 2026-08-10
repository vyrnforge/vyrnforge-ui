import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  getReleaseBuildOrder,
  resolveReleaseSelection,
  sha1File,
  sha256File,
  sha512IntegrityFile,
  validateReleaseArtifactManifest,
} from "./release-artifact.mjs";

test("data-grid release build order contains its VyrnForge dependency closure once", () => {
  const { releaseGroup, packageMap } = resolveReleaseSelection({
    releaseGroupId: "data-grid-alpha",
    version: "0.1.0-alpha.2",
    distTag: "alpha",
  });
  assert.deepEqual(
    getReleaseBuildOrder({ releaseGroup, packageMap }).map(({ name }) => name),
    [
      "@vyrnforge/ui-core",
      "@vyrnforge/ui-behaviors",
      "@vyrnforge/ui-components",
      "@vyrnforge/ui-data-grid",
    ],
  );
});

test("release artifact manifest rejects reordered packages", () => {
  const artifactManifest = {
    schemaVersion: 1,
    releaseGroup: "non-grid-beta",
    version: "0.2.0-beta.2",
    distTag: "beta",
    sourceCommit: "a".repeat(40),
    ciRunId: "123",
    createdAt: "2026-08-10T00:00:00.000Z",
    packages: [
      "@vyrnforge/ui-elements",
      "@vyrnforge/ui-components",
      "@vyrnforge/ui-behaviors",
      "@vyrnforge/ui-core",
    ].map((name) => ({
      name,
      directory: "invalid",
      version: "0.2.0-beta.2",
      filename: "package.tgz",
      sha256: "b".repeat(64),
      integrity: `sha512-${Buffer.from("test").toString("base64")}`,
      shasum: "c".repeat(40),
      packedSize: 1,
      unpackedSize: 1,
      fileCount: 0,
      files: [],
    })),
  };
  const failures = validateReleaseArtifactManifest({
    artifactManifest,
    releaseGroupId: "non-grid-beta",
    version: "0.2.0-beta.2",
    distTag: "beta",
    sourceCommit: "a".repeat(40),
    ciRunId: "123",
  });
  assert(
    failures.includes(
      "release artifact package order does not match the release group",
    ),
  );
});

test("release byte bindings change with tarball content", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "vyrnforge-release-hash-"));
  try {
    const file = path.join(directory, "artifact.tgz");
    writeFileSync(file, "first");
    const first = {
      sha1: sha1File(file),
      sha256: sha256File(file),
      integrity: sha512IntegrityFile(file),
    };
    writeFileSync(file, "second");
    const second = {
      sha1: sha1File(file),
      sha256: sha256File(file),
      integrity: sha512IntegrityFile(file),
    };

    assert.match(first.sha1, /^[0-9a-f]{40}$/u);
    assert.match(first.sha256, /^[0-9a-f]{64}$/u);
    assert.match(first.integrity, /^sha512-/u);
    assert.notDeepEqual(first, second);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
