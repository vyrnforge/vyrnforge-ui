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
  repositoryRoot,
  verifyDeveloperDeliveryFoundation,
} from "./developer-delivery-foundation.mjs";

test("current repository satisfies the developer delivery foundation contract", () => {
  assert.deepEqual(verifyDeveloperDeliveryFoundation(), []);
});

test("delivery foundation rejects a missing first-class framework", () => {
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
    "scripts/verify-pages-site.mjs",
    "apps/docs/package.json",
    "apps/docs/src/docsContext.ts",
    "apps/docs/src/ComponentReferencePage.tsx",
    "examples/basic-playground/package.json",
    "examples/basic-playground/src/app/playgroundContext.ts",
    "examples/basic-playground/src/data/referenceMetadata.ts",
  ];
  for (const relativePath of required) {
    cpSync(path.join(repositoryRoot, relativePath), path.join(root, relativePath));
  }

  const manifestPath = path.join(
    root,
    "docs/metadata/developer-delivery-foundation.json",
  );
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.frameworks = manifest.frameworks.filter(
    (framework) => framework !== "vue",
  );
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  assert.ok(
    verifyDeveloperDeliveryFoundation({ root }).some((failure) =>
      failure.includes("frameworks must be"),
    ),
  );
});
