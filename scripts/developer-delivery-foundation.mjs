import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const deliveryFoundationManifestPath =
  "docs/metadata/developer-delivery-foundation.json";
export const deliveryFoundationDocumentationPath =
  "docs/engineering/developer-delivery-foundation.md";

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8").replaceAll(
    "\r\n",
    "\n",
  );
}

function requireFile(root, relativePath, failures) {
  if (!existsSync(path.join(root, relativePath))) {
    failures.push(
      `delivery foundation required file is missing: ${relativePath}`,
    );
    return false;
  }
  return true;
}

function requireMarkers(text, relativePath, markers, failures) {
  for (const marker of markers) {
    if (!text.includes(marker)) {
      failures.push(`${relativePath}: missing ${marker}`);
    }
  }
}

export function verifyDeveloperDeliveryFoundation({
  root = repositoryRoot,
} = {}) {
  const failures = [];
  const requiredFiles = [
    deliveryFoundationManifestPath,
    deliveryFoundationDocumentationPath,
    "docs/engineering/ci-cd-architecture.md",
    "docs/engineering/documentation-system.md",
    "docs/governance/05-trunk-delivery.md",
    "docs/metadata/component-contracts.json",
    "docs/metadata/components.json",
    "docs/metadata/packages.json",
    "docs/metadata/multi-framework.json",
    "docs/metadata/release-groups.json",
    "docs/generated/framework-api-reference.json",
    "docs/generated/consumer-knowledge.json",
    "docs/generated/reference-model.json",
    "docs/reference/referenceRuntime.ts",
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
  for (const file of requiredFiles) requireFile(root, file, failures);
  if (failures.length) return failures.sort();

  const manifest = JSON.parse(read(root, deliveryFoundationManifestPath));
  if (manifest.schemaVersion !== 1) {
    failures.push("developer delivery foundation schemaVersion must be 1");
  }
  if (
    manifest.program?.id !== "developer-delivery-foundation" ||
    !["in-progress", "complete"].includes(manifest.program?.status)
  ) {
    failures.push(
      "developer delivery foundation program must be recorded as in-progress or complete",
    );
  }

  const frameworkIds = manifest.frameworks ?? [];
  const expectedFrameworks = ["native-html", "react", "angular", "vue"];
  if (JSON.stringify(frameworkIds) !== JSON.stringify(expectedFrameworks)) {
    failures.push(
      `developer delivery foundation frameworks must be ${expectedFrameworks.join(", ")}`,
    );
  }

  const lifecycleIds = new Set(
    (manifest.lifecycle ?? []).map((stage) => stage.id),
  );
  for (const id of [
    "task-pr",
    "promotion-pr",
    "exact-main-delivery",
    "production-reference-deploy",
    "weekly-assurance",
    "controlled-release",
  ]) {
    if (!lifecycleIds.has(id)) {
      failures.push(`developer delivery lifecycle is missing ${id}`);
    }
  }

  const artifacts = new Map(
    (manifest.artifacts ?? []).map((artifact) => [artifact.id, artifact]),
  );
  const previewArtifact = artifacts.get("reference-preview");
  if (
    previewArtifact?.mutable !== false ||
    previewArtifact?.deployable !== false
  ) {
    failures.push(
      "reference-preview artifact must be immutable and explicitly non-deployable",
    );
  }
  const pagesArtifact = artifacts.get("pages-site");
  if (pagesArtifact?.mutable !== false || pagesArtifact?.deployable !== true) {
    failures.push(
      "pages-site artifact must be immutable and explicitly deployable",
    );
  }
  const previewGap = (manifest.gaps ?? []).find(
    (gap) => gap.id === "pr-reference-preview",
  );
  if (previewGap?.status !== "closed") {
    failures.push("PR reference preview gap must be recorded as closed");
  }
  const releaseRefreshGap = (manifest.gaps ?? []).find(
    (gap) => gap.id === "release-reference-refresh",
  );
  if (releaseRefreshGap?.status !== "closed") {
    failures.push("release reference refresh gap must be recorded as closed");
  }

  if (
    manifest.gate?.id !== "G17" ||
    manifest.gate?.blocksComponentExpansion !== true
  ) {
    failures.push(
      "developer delivery foundation must record G17 as blocking component expansion",
    );
  }

  const workflowsDirectory = path.join(root, ".github/workflows");
  const workflowFiles = readdirSync(workflowsDirectory)
    .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
    .sort();
  const expectedWorkflows = [
    "assurance.yml",
    "ci.yml",
    "deploy-pages.yml",
    "release.yml",
  ];
  if (JSON.stringify(workflowFiles) !== JSON.stringify(expectedWorkflows)) {
    failures.push(
      `delivery lifecycle must remain four workflows: ${expectedWorkflows.join(", ")}`,
    );
  }

  const ci = read(root, ".github/workflows/ci.yml");
  requireMarkers(
    ci,
    ".github/workflows/ci.yml",
    [
      "scripts/detect-ci-scope.mjs",
      "  quality-checks:",
      "  integration-checks:",
      "  security-checks:",
      "name: ci-gate",
      "RUN_REFERENCE_PREVIEW:",
      "Assemble immutable reference preview",
      "reference-preview-pr-${{ github.event.pull_request.number }}-${{ github.sha }}",
      "mode:",
      "- delivery",
      "DISPATCH_MODE: ${{ inputs.mode }}",
      '[[ "$EVENT_NAME" == "workflow_dispatch" && "$DISPATCH_MODE" == "delivery" ]]',
      "RUN_PAGES_ARTIFACT:",
      "inputs.mode == 'delivery'",
      "node scripts/assemble-versioned-pages.mjs",
      "write-production-manifest",
      "node scripts/verify-pages-site.mjs",
      "node scripts/reference-artifact.mjs verify --kind production",
      "pages-site-${{ github.sha }}",
    ],
    failures,
  );
  if (ci.includes("npm publish")) {
    failures.push("CI must not publish npm packages");
  }

  const pages = read(root, ".github/workflows/deploy-pages.yml");
  requireMarkers(
    pages,
    ".github/workflows/deploy-pages.yml",
    [
      'workflows: ["VyrnForge CI"]',
      '"$RUN_EVENT" != "push" && "$RUN_EVENT" != "workflow_dispatch"',
      "gh run download",
      "pages-site-${{ steps.candidate.outputs.head-sha }}",
      "site/reference-artifact.json",
      "EXPECTED_CI_RUN_ID",
      'artifact.artifact?.kind !== "production"',
      "pages: write",
      "id-token: write",
    ],
    failures,
  );
  for (const forbidden of ["npm ci", "npm run ", "npm publish"]) {
    if (pages.includes(forbidden)) {
      failures.push(
        `Pages deployment must consume artifacts without ${forbidden}`,
      );
    }
  }

  const release = read(root, ".github/workflows/release.yml");
  requireMarkers(
    release,
    ".github/workflows/release.yml",
    [
      "workflow_dispatch:",
      "name: verify-release",
      "name: publish-packages",
      "name: verify-registry-release",
      "name: create-release-record",
      "name: refresh-release-reference",
      "Resolve successful current-main CI run",
      "Dispatch exact-main reference delivery after tag creation",
      '"repos/$GITHUB_REPOSITORY/actions/workflows/ci.yml/dispatches"',
      "pages-site-$GITHUB_SHA",
      "Dispatch Pages deployment for release-bound artifact",
      '"repos/$GITHUB_REPOSITORY/actions/workflows/deploy-pages.yml/dispatches"',
      "gh run watch",
      "actions: write",
      "id-token: write",
    ],
    failures,
  );
  if (/^\s*(push|pull_request|schedule):/mu.test(release)) {
    failures.push("controlled npm release must remain manual-only");
  }
  const refreshStart = release.indexOf("  refresh-release-reference:");
  if (refreshStart < 0) {
    failures.push("controlled release must include release reference refresh");
  } else {
    const refresh = release.slice(refreshStart);
    if (
      refresh.includes("pages: write") ||
      refresh.includes("id-token: write")
    ) {
      failures.push(
        "release reference refresh must dispatch Pages without direct Pages deployment permissions",
      );
    }
    if (refresh.includes("npm publish")) {
      failures.push("release reference refresh must not publish npm packages");
    }
  }

  const docsPackage = JSON.parse(read(root, "apps/docs/package.json"));
  if (
    docsPackage.name !== "@vyrnforge/ui-docs" ||
    docsPackage.private !== true
  ) {
    failures.push(
      "apps/docs must remain the private VyrnForge documentation application",
    );
  }
  const playgroundPackage = JSON.parse(
    read(root, "examples/basic-playground/package.json"),
  );
  if (playgroundPackage.private !== true) {
    failures.push(
      "playground must remain a private consumer/reference surface",
    );
  }

  const docsContext = read(root, "apps/docs/src/docsContext.ts");
  const playgroundContext = read(
    root,
    "examples/basic-playground/src/app/playgroundContext.ts",
  );
  const referenceModel = JSON.parse(
    read(root, "docs/generated/reference-model.json"),
  );
  const referenceRuntime = read(root, "docs/reference/referenceRuntime.ts");
  const referenceFrameworks = (referenceModel.frameworks ?? []).map(
    (framework) => framework.id,
  );
  if (
    JSON.stringify(referenceFrameworks) !== JSON.stringify(expectedFrameworks)
  ) {
    failures.push(
      `generated Reference frameworks must be ${expectedFrameworks.join(", ")}`,
    );
  }
  for (const framework of expectedFrameworks) {
    if (!referenceRuntime.includes(`"${framework}"`)) {
      failures.push(`shared Reference runtime is missing ${framework}`);
    }
  }
  for (const [relativePath, context] of [
    ["apps/docs/src/docsContext.ts", docsContext],
    ["examples/basic-playground/src/app/playgroundContext.ts", playgroundContext],
  ]) {
    requireMarkers(
      context,
      relativePath,
      ["generated/reference-model.json?raw", "reference/referenceRuntime"],
      failures,
    );
  }
  if (referenceModel.versionContext?.catalog !== "vyrnforge-versions.json") {
    failures.push(
      "generated Reference version context must use vyrnforge-versions.json",
    );
  }
  requireMarkers(
    playgroundContext,
    "examples/basic-playground/src/app/playgroundContext.ts",
    ["schemaVersion !== 2", "playgroundPath"],
    failures,
  );

  const referenceMetadata = read(
    root,
    "examples/basic-playground/src/data/referenceMetadata.ts",
  );
  requireMarkers(
    referenceMetadata,
    "examples/basic-playground/src/data/referenceMetadata.ts",
    [
      "docs/generated/consumer-knowledge.json?raw",
      "docs/generated/framework-api-reference.json?raw",
      "referenceFrameworkSurfaces",
    ],
    failures,
  );

  const generator = read(root, "scripts/generate-framework-api-reference.mjs");
  requireMarkers(
    generator,
    "scripts/generate-framework-api-reference.mjs",
    [
      "docs/generated/framework-api-reference.json",
      "loadCanonicalComponentContracts",
      "createFrameworkApiReference",
      "--check",
    ],
    failures,
  );

  const assembler = read(root, "scripts/assemble-versioned-pages.mjs");
  requireMarkers(
    assembler,
    "scripts/assemble-versioned-pages.mjs",
    [
      "refs/tags",
      "vyrnforge-versions.json",
      "docs-versions.json",
      "playgroundPath",
      "currentCommit",
    ],
    failures,
  );

  const referenceArtifact = read(root, "scripts/reference-artifact.mjs");
  requireMarkers(
    referenceArtifact,
    "scripts/reference-artifact.mjs",
    [
      'kind === "preview" || kind === "production"',
      'deployable: kind === "production"',
      "sourceCommit",
      "ciRunId",
      "assembleReferencePreview",
      "verifyReferenceArtifact",
    ],
    failures,
  );

  const documentation = read(root, deliveryFoundationDocumentationPath);
  requireMarkers(
    documentation,
    deliveryFoundationDocumentationPath,
    [
      "Generated API reference rule",
      "Example contract",
      "Version and deployment contract",
      "release-bound delivery",
      "reference-artifact.json",
      "G17 exit",
      "Native HTML",
      "React",
      "Angular",
      "Vue",
    ],
    failures,
  );

  return failures.sort();
}
