import assert from "node:assert/strict";
import test from "node:test";
import {
  migrateReleaseGroupsV1,
  validateReleaseGroupsV2,
} from "./release-groups.mjs";

const legacyManifest = {
  schemaVersion: 1,
  sourceOfTruth: {
    canonical: true,
    task: "legacy-task",
    documentation: "docs/release/versioning-policy.md",
  },
  task: { id: "legacy-task", status: "done" },
  groups: {
    foundation: {
      channel: "beta",
      version: "1.0.0-beta.1",
      distTag: "beta",
      synchronized: true,
      publishTogether: true,
      packages: [
        {
          name: "@vyrnforge/example-core",
          directory: "packages/example-core",
          hasCss: false,
          dependencies: {},
        },
        {
          name: "@vyrnforge/example-react",
          directory: "packages/example-react",
          hasCss: true,
          dependencies: {
            "@vyrnforge/example-core": "1.0.0-beta.1",
          },
        },
      ],
    },
    extension: {
      channel: "alpha",
      version: "1.0.0-alpha.1",
      distTag: "alpha",
      synchronized: false,
      publishTogether: false,
      packages: [
        {
          name: "@vyrnforge/example-extension",
          directory: "packages/example-extension",
          hasCss: false,
          dependencies: {
            "@vyrnforge/example-core": "1.0.0-beta.1",
          },
        },
      ],
    },
  },
  rules: {
    foundationPackageCount: 2,
    extensionPackageCount: 1,
  },
};

function migrate() {
  return migrateReleaseGroupsV1(legacyManifest, {
    releaseLinePolicies: {
      foundation: {
        intent: "foundation prerelease",
        tagTemplate: "{releaseLineId}/v{version}",
        releaseNameTemplate: "{releaseLineId} v{version}",
      },
      extension: {
        intent: "extension prerelease",
        tagTemplate: "{releaseLineId}/v{version}",
        releaseNameTemplate: "{releaseLineId} v{version}",
      },
    },
    classifyPackage(packageInfo) {
      return {
        role: packageInfo.name.endsWith("core")
          ? "foundation"
          : "framework-adapter",
      };
    },
  });
}

test("migrates v1 without historical task or fixed-count semantics", () => {
  const migrated = migrate();
  assert.equal(migrated.schemaVersion, 2);
  assert.equal("task" in migrated, false);
  assert.equal("rules" in migrated, false);
  assert.equal(migrated.sourceOfTruth.scope, "release-groups");
  assert.deepEqual(
    migrated.releaseLines.foundation.packages.map(({ name }) => name),
    ["@vyrnforge/example-core", "@vyrnforge/example-react"],
  );
});

test("derives cross-release dependency declarations from package metadata", () => {
  const migrated = migrate();
  assert.deepEqual(migrated.releaseLines.extension.releaseDependencies, [
    { releaseLine: "foundation", policy: "exact" },
  ]);
});

test("rejects duplicate package classification", () => {
  const migrated = migrate();
  migrated.releaseLines.extension.packages.push(
    migrated.releaseLines.foundation.packages[0],
  );
  assert(
    validateReleaseGroupsV2(migrated).some((failure) =>
      failure.includes("classified more than once"),
    ),
  );
});

test("rejects invalid package ordering", () => {
  const migrated = migrate();
  migrated.releaseLines.foundation.packages.reverse();
  assert(
    validateReleaseGroupsV2(migrated).some((failure) =>
      failure.includes("must appear earlier in release order"),
    ),
  );
});

test("rejects invalid release dependency references", () => {
  const migrated = migrate();
  migrated.releaseLines.extension.releaseDependencies = [
    { releaseLine: "missing", policy: "exact" },
  ];
  assert(
    validateReleaseGroupsV2(migrated).some((failure) =>
      failure.includes("unknown release dependency"),
    ),
  );
});

test("requires explicit package role classification during migration", () => {
  assert.throws(
    () =>
      migrateReleaseGroupsV1(legacyManifest, {
        releaseLinePolicies: {
          foundation: { intent: "foundation prerelease" },
          extension: { intent: "extension prerelease" },
        },
        classifyPackage() {
          return {};
        },
      }),
    /missing package role/,
  );
});
