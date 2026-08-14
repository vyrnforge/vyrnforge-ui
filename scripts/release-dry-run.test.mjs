import assert from "node:assert/strict";
import test from "node:test";

import { buildReleaseDryRunPlan } from "./release-dry-run.mjs";

function releaseLine({
  version,
  distTag,
  publishable = true,
  dependencies = [],
  packages,
}) {
  return {
    intent: "synthetic release dry-run test",
    channel: distTag,
    version,
    distTag,
    versioning: { mode: "independent" },
    publication: {
      publishable,
      publishTogether: false,
    },
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
    releaseDependencies: dependencies,
    packages,
  };
}

test("release dry-run orders publishable release lines by dependencies", () => {
  const manifest = {
    schemaVersion: 2,
    sourceOfTruth: {
      canonical: true,
      scope: "release-groups",
      documentation: "docs/release/versioning-policy.md",
    },
    releaseLines: {
      "data-grid-alpha": releaseLine({
        version: "0.1.0-alpha.1",
        distTag: "alpha",
        dependencies: [
          {
            releaseLine: "foundation-beta",
            policy: "exact",
          },
        ],
        packages: [
          {
            name: "@vyrnforge/ui-data-grid",
            directory: "packages/ui-data-grid",
            role: "react-data-grid",
            dependencies: {
              "@vyrnforge/ui-core": "0.2.0-beta.1",
            },
            policies: {
              hasCss: true,
              versionExport: null,
            },
          },
        ],
      }),
      "foundation-beta": releaseLine({
        version: "0.2.0-beta.1",
        distTag: "beta",
        packages: [
          {
            name: "@vyrnforge/ui-core",
            directory: "packages/ui-core",
            role: "framework-neutral-foundation",
            dependencies: {},
            policies: {
              hasCss: true,
              versionExport: null,
            },
          },
        ],
      }),
      "internal-preview": releaseLine({
        version: "0.0.1",
        distTag: "preview",
        publishable: false,
        packages: [
          {
            name: "@vyrnforge/ui-preview",
            directory: "packages/ui-preview",
            role: "internal-preview",
            dependencies: {},
            policies: {
              hasCss: false,
              versionExport: null,
            },
          },
        ],
      }),
    },
  };

  const plan = buildReleaseDryRunPlan({ manifest });

  assert.deepEqual(
    plan.map((releaseLine) => releaseLine.releaseGroupId),
    ["foundation-beta", "data-grid-alpha"],
  );

  assert.equal(plan[0].gitTag, "foundation-beta/v0.2.0-beta.1");

  assert.equal(plan[1].releaseName, "data-grid-alpha v0.1.0-alpha.1");

  assert.deepEqual(plan[1].releaseDependencies, ["foundation-beta"]);
});
