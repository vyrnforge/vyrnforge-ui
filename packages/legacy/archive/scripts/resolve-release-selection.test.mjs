import assert from "node:assert/strict";
import test from "node:test";
import { resolveReleaseSelection } from "./resolve-release-selection.mjs";

const manifest = {
  schemaVersion: 2,
  sourceOfTruth: {
    canonical: true,
    scope: "release-groups",
    documentation: "docs/release/versioning-policy.md",
  },
  releaseLines: {
    foundation: {
      intent: "foundation",
      channel: "beta",
      version: "1.0.0-beta.1",
      distTag: "beta",
      versioning: { mode: "synchronized" },
      publication: { publishable: true, publishTogether: true },
      tagIdentity: {
        scope: "release-line",
        legacyPolicy: "preserve-only",
        tagTemplate: "{releaseLineId}/v{version}",
        releaseNameTemplate: "{releaseLineId} v{version}",
      },
      validation: {
        artifacts: true,
        provenance: true,
        registry: true,
        consumer: true,
      },
      releaseDependencies: [],
      packages: [
        {
          name: "@vyrnforge/example-core",
          directory: "packages/example-core",
          role: "foundation",
          dependencies: {},
          policies: { hasCss: false, versionExport: null },
        },
        {
          name: "@vyrnforge/example-react",
          directory: "packages/example-react",
          role: "react-renderer",
          dependencies: {
            "@vyrnforge/example-core": "1.0.0-beta.1",
          },
          policies: { hasCss: true, versionExport: null },
        },
      ],
    },
    extension: {
      intent: "extension",
      channel: "alpha",
      version: "2.0.0-alpha.1",
      distTag: "alpha",
      versioning: { mode: "independent" },
      publication: { publishable: true, publishTogether: false },
      tagIdentity: {
        scope: "release-line",
        legacyPolicy: "preserve-only",
        tagTemplate: "{releaseLineId}/v{version}",
        releaseNameTemplate: "{releaseLineId} v{version}",
      },
      validation: {
        artifacts: true,
        provenance: true,
        registry: true,
        consumer: true,
      },
      releaseDependencies: [{ releaseLine: "foundation", policy: "exact" }],
      packages: [
        {
          name: "@vyrnforge/example-extension",
          directory: "packages/example-extension",
          role: "extension",
          dependencies: {
            "@vyrnforge/example-core": "1.0.0-beta.1",
          },
          policies: { hasCss: false, versionExport: null },
        },
      ],
    },
  },
};

test("derives version, dist-tag, and ordered membership from metadata", () => {
  const resolved = resolveReleaseSelection("foundation", { manifest });
  assert.equal(resolved.version, "1.0.0-beta.1");
  assert.equal(resolved.distTag, "beta");
  assert.deepEqual(resolved.packages, [
    "@vyrnforge/example-core",
    "@vyrnforge/example-react",
  ]);
});

test("derives cross-line dependency closure from metadata", () => {
  const resolved = resolveReleaseSelection("extension", { manifest });
  assert.deepEqual(resolved.packages, ["@vyrnforge/example-extension"]);
  assert.deepEqual(resolved.dependencyClosure, ["@vyrnforge/example-core"]);
});

test("rejects an unknown release group", () => {
  assert.throws(
    () => resolveReleaseSelection("missing", { manifest }),
    /unknown release group/,
  );
});

test("release-line identity prevents same-version tag collisions", () => {
  const sameVersionManifest = structuredClone(manifest);
  sameVersionManifest.releaseLines.extension.version =
    sameVersionManifest.releaseLines.foundation.version;
  const foundation = resolveReleaseSelection("foundation", {
    manifest: sameVersionManifest,
  });
  const extension = resolveReleaseSelection("extension", {
    manifest: sameVersionManifest,
  });
  assert.notEqual(foundation.gitTag, extension.gitTag);
  assert.notEqual(foundation.releaseName, extension.releaseName);
  assert.equal(foundation.gitTag, "foundation/v1.0.0-beta.1");
  assert.equal(extension.gitTag, "extension/v1.0.0-beta.1");
});
