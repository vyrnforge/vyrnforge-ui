import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

import {
  getTrustedPublishingPackages,
  readTrustedPublishingContract,
  verifyTrustedPublishingExternalEvidence,
  verifyTrustedPublishingProvenanceContract,
} from "./trusted-publishing-provenance.mjs";

test("trusted publishing package coverage derives from release metadata", () => {
  const packages = getTrustedPublishingPackages({
    schemaVersion: 2,
    releaseLines: {
      "framework-beta": {
        packages: [
          { name: "@vyrnforge/ui-angular", directory: "packages/ui-angular" },
          { name: "@vyrnforge/ui-vue", directory: "packages/ui-vue" },
        ],
      },
    },
  });

  assert.deepEqual(packages, [
    {
      name: "@vyrnforge/ui-angular",
      directory: "packages/ui-angular",
      releaseGroup: "framework-beta",
    },
    {
      name: "@vyrnforge/ui-vue",
      directory: "packages/ui-vue",
      releaseGroup: "framework-beta",
    },
  ]);
});

function clone(value) {
  return structuredClone(value);
}

test("accepts the BT-8007 trusted-publishing repository contract", () => {
  assert.deepEqual(verifyTrustedPublishingProvenanceContract(), []);
});
test("accepts CRLF release workflow content", () => {
  const workflowText = readFileSync(
    new URL("../.github/workflows/release.yml", import.meta.url),
    "utf8",
  ).replace(/\r?\n/g, "\r\n");

  assert.deepEqual(
    verifyTrustedPublishingProvenanceContract({ workflowText }),
    [],
  );
});

test("rejects long-lived npm credentials in the release workflow", () => {
  const failures = verifyTrustedPublishingProvenanceContract({
    workflowText: `${readTrustedPublishingContract().workflow.name}\nNODE_AUTH_TOKEN: secret`,
  });
  assert(failures.some((failure) => failure.includes("NODE_AUTH_TOKEN")));
});

test("rejects a release workflow that restores a verify/publish mode split", () => {
  const workflowText = readFileSync(
    new URL("../.github/workflows/release.yml", import.meta.url),
    "utf8",
  ).replace(
    "      dist-tag:",
    "      mode:\n        required: true\n        type: string\n      dist-tag:",
  );
  const failures = verifyTrustedPublishingProvenanceContract({ workflowText });
  assert(
    failures.some((failure) =>
      failure.includes("single protected release path"),
    ),
  );
});

test("rejects a trusted publisher bound to the wrong workflow", () => {
  const contract = clone(readTrustedPublishingContract());
  contract.npm.publisher.workflowFilename = "publish.yml";
  const failures = verifyTrustedPublishingProvenanceContract({ contract });
  assert(failures.includes("npm trusted-publisher fields are invalid"));
});

test("does not allow verified status without complete external evidence", () => {
  const contract = clone(readTrustedPublishingContract());
  contract.externalEvidence.status = "verified";
  contract.task.status = "done";
  contract.releaseReadiness = "ready";
  const failures = verifyTrustedPublishingProvenanceContract({ contract });
  assert(failures.includes("BT-8007 verified evidence index is incomplete"));
});

test("accepts reviewed external evidence only when every required record exists", () => {
  const contract = clone(readTrustedPublishingContract());
  contract.externalEvidence.status = "verified";
  contract.task.status = "done";
  contract.releaseReadiness = "ready";
  const capture = "docs/release/evidence/BT-8007/README.md";
  const evidence = {
    schemaVersion: 1,
    task: "BT-8007",
    status: "verified",
    reviewer: "release-owner",
    reviewedAt: "2026-08-04T00:00:00.000Z",
    workflowRun: "https://github.com/vyrnforge/vyrnforge-ui/actions/runs/1",
    dryRunArtifact: "trusted-publishing-dry-run-non-grid-beta",
    packagePublisherSettings: contract.packages.map((packageInfo) => ({
      package: packageInfo.name,
      capture,
    })),
    environmentProtection: { capture },
  };
  assert.deepEqual(
    verifyTrustedPublishingExternalEvidence({ contract, evidence }),
    [],
  );
});
