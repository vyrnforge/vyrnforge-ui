import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  verifyReferenceArtifact,
  writeReferenceArtifactManifest,
} from "./reference-artifact.mjs";

function createSurface(directory) {
  mkdirSync(path.join(directory, "playground"), { recursive: true });
  writeFileSync(path.join(directory, "index.html"), "<html></html>");
  writeFileSync(
    path.join(directory, "playground", "index.html"),
    "<html></html>",
  );
  writeFileSync(path.join(directory, ".nojekyll"), "");
}

test("preview artifacts are immutable, non-deployable, and commit-bound", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "vf-preview-artifact-"));
  createSurface(directory);
  writeReferenceArtifactManifest({
    directory,
    kind: "preview",
    sourceCommit: "abcdef1234567890",
    ciRunId: "12345",
    eventName: "pull_request",
  });

  const manifest = verifyReferenceArtifact({
    directory,
    expectedKind: "preview",
    expectedCommit: "abcdef1234567890",
    expectedCiRunId: "12345",
  });

  assert.equal(manifest.artifact.deployable, false);
  assert.equal(manifest.artifact.immutable, true);
});

test("production artifacts require matching version-catalog lineage", () => {
  const directory = mkdtempSync(
    path.join(os.tmpdir(), "vf-production-artifact-"),
  );
  createSurface(directory);
  writeFileSync(
    path.join(directory, "vyrnforge-versions.json"),
    `${JSON.stringify({ current: { commit: "abcdef1234567890" } })}\n`,
  );
  writeReferenceArtifactManifest({
    directory,
    kind: "production",
    sourceCommit: "abcdef1234567890",
    ciRunId: "999",
    eventName: "push",
  });

  assert.doesNotThrow(() =>
    verifyReferenceArtifact({
      directory,
      expectedKind: "production",
      expectedCommit: "abcdef1234567890",
      expectedCiRunId: "999",
    }),
  );

  assert.throws(
    () =>
      verifyReferenceArtifact({
        directory,
        expectedKind: "production",
        expectedCommit: "deadbeef12345678",
        expectedCiRunId: "999",
      }),
    /source commit does not match/u,
  );
});
