import test from "node:test";
import assert from "node:assert/strict";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  deliveryFoundationManifestPath,
  repositoryRoot,
  verifyDeveloperDeliveryFoundation,
} from "./developer-delivery-foundation.mjs";
import {
  verifyDeveloperDeliveryGate,
  verifyGateManifest,
} from "./verify-developer-delivery-gate.mjs";

const required = [
  ".github/workflows/assurance.yml",
  ".github/workflows/ci.yml",
  ".github/workflows/deploy-pages.yml",
  ".github/workflows/release.yml",
  "docs/engineering/developer-delivery-foundation.md",
  "docs/engineering/ci-cd-architecture.md",
  "docs/engineering/documentation-system.md",
  "docs/governance/05-trunk-delivery.md",
  "docs/metadata/developer-delivery-foundation.json",
  "docs/metadata/component-contracts.json",
  "docs/metadata/components.json",
  "docs/metadata/packages.json",
  "docs/metadata/multi-framework.json",
  "docs/metadata/release-groups.json",
  "docs/generated/framework-api-reference.json",
  "docs/generated/consumer-knowledge.json",
  "scripts/generate-framework-api-reference.mjs",
  "scripts/assemble-versioned-pages.mjs",
  "scripts/reference-artifact.mjs",
  "scripts/verify-pages-site.mjs",
  "apps/docs/package.json",
  "apps/docs/src/docsContext.ts",
  "apps/docs/src/ComponentReferencePage.tsx",
  "examples/basic-playground/package.json",
  "examples/basic-playground/src/app/playgroundContext.ts",
  "examples/basic-playground/src/data/referenceMetadata.ts",
];

function createFoundationFixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "vf-delivery-foundation-"));
  for (const relativePath of [
    ".github/workflows",
    "docs/engineering",
    "docs/governance",
    "docs/metadata",
    "docs/generated",
    "scripts",
    "apps/docs/src",
    "examples/basic-playground/src/app",
    "examples/basic-playground/src/data",
  ]) {
    mkdirSync(path.join(root, relativePath), { recursive: true });
  }

  for (const relativePath of required) {
    cpSync(
      path.join(repositoryRoot, relativePath),
      path.join(root, relativePath),
    );
  }

  return root;
}

function mutateManifest(root, mutate) {
  const manifestPath = path.join(root, deliveryFoundationManifestPath);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  mutate(manifest);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

test("current repository satisfies the developer delivery foundation contract", () => {
  assert.deepEqual(verifyDeveloperDeliveryFoundation(), []);
});

test("current repository satisfies the G17 developer delivery gate contract", () => {
  assert.deepEqual(verifyDeveloperDeliveryGate(), []);
});

test("delivery foundation rejects a missing first-class framework", () => {
  const root = createFoundationFixture();
  mutateManifest(root, (manifest) => {
    manifest.frameworks = manifest.frameworks.filter(
      (framework) => framework !== "vue",
    );
  });

  assert.ok(
    verifyDeveloperDeliveryFoundation({ root }).some((failure) =>
      failure.includes("frameworks must be"),
    ),
  );
});

test("delivery foundation rejects an open release reference refresh gap", () => {
  const root = createFoundationFixture();
  mutateManifest(root, (manifest) => {
    const gap = manifest.gaps.find(
      (candidate) => candidate.id === "release-reference-refresh",
    );
    gap.status = "open";
  });

  assert.ok(
    verifyDeveloperDeliveryFoundation({ root }).some((failure) =>
      failure.includes(
        "release reference refresh gap must be recorded as closed",
      ),
    ),
  );
});

test("G17 rejects a reopened cross-framework example gap", () => {
  const manifest = JSON.parse(
    readFileSync(
      path.join(repositoryRoot, deliveryFoundationManifestPath),
      "utf8",
    ),
  );
  const gap = manifest.gaps.find(
    (candidate) => candidate.id === "cross-framework-examples",
  );
  gap.status = "open";

  assert.ok(
    verifyGateManifest(manifest).some((failure) =>
      failure.includes("cross-framework-examples"),
    ),
  );
});
