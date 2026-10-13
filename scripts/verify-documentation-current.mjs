import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getReleaseLineEntries, readReleaseGroups } from "./release-groups.mjs";
import { retiredReferencePaths } from "./reference-retired-paths.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const documentationCurrentPaths = [
  "README.md",
  "MIGRATION.md",
  "docs/README.md",
  "docs/api/README.md",
  "docs/api/import-and-setup.md",
  "docs/api/ui-behaviors-api.md",
  "docs/api/ui-components-api.md",
  "docs/api/ui-data-grid-api.md",
  "docs/api/ui-elements-api.md",
  "docs/packages/README.md",
  "docs/governance/documentation.md",
  "docs/governance/01-project-source-of-truth.md",
  "docs/engineering/documentation-system.md",
  "docs/governance/04-metadata-maintenance.md",
  "docs/architecture/00-system-overview.md",
  "docs/architecture/01-package-boundaries.md",
  "docs/architecture/02-state-and-adapter-ownership.md",
  "docs/architecture/03-theming-and-styling.md",
  "docs/architecture/05-accessibility-standards.md",
  "docs/architecture/08-semantic-token-contract.md",
  "docs/architecture/adr-004-multi-framework-web-support.md",
  "docs/architecture/09-component-contracts-and-events.md",
  "docs/architecture/11-canonical-model-and-form-semantics.md",
  "docs/architecture/12-composition-mapping-contract.md",
  "docs/architecture/13-event-ref-mapping-contract.md",
  "docs/architecture/14-non-grid-contract-coverage.md",
  "docs/architecture/15-component-presets-and-aliases.md",
  "docs/architecture/adr-005-canonical-web-implementation.md",
  "docs/architecture/adr-006-framework-package-strategy.md",
  "docs/architecture/adr-008-framework-exception-policy.md",
  "docs/architecture/adr-009-react-canonical-convergence.md",
  "docs/architecture/10-custom-elements-and-form-association.md",
  "docs/quality/00-quality-gates.md",
  "docs/quality/03-known-limitations.md",
  "docs/testing/browser-testing.md",
  "docs/testing/visual-regression.md",
  "docs/release/README.md",
  "docs/release/versioning-policy.md",
  "docs/release/multi-framework-migration-and-limitations.md",
  "docs/testing/multi-framework-consumer-fixtures.md",
  "packages/ui-core/README.md",
  "packages/ui-behaviors/README.md",
  "packages/ui-components/README.md",
  "packages/ui-elements/README.md",
  "packages/ui-angular/README.md",
  "packages/ui-vue/README.md",
  "packages/ui-data-grid/README.md",
  ".ai/AI_CONTEXT.md",
  "AGENTS.md",
];

export const documentationInstallGuidancePaths = [
  "README.md",
  "docs/api/import-and-setup.md",
  "docs/api/ui-components-api.md",
  "docs/api/ui-elements-api.md",
  "docs/release/multi-framework-migration-and-limitations.md",
  "packages/ui-core/README.md",
  "packages/ui-behaviors/README.md",
  "packages/ui-components/README.md",
  "packages/ui-elements/README.md",
  "packages/ui-angular/README.md",
  "packages/ui-vue/README.md",
  "packages/ui-data-grid/README.md",
];

export const documentationTaskFreePaths = [
  "README.md",
  "MIGRATION.md",
  "docs/README.md",
  "docs/api/README.md",
  "docs/api/import-and-setup.md",
  "docs/api/ui-behaviors-api.md",
  "docs/api/ui-components-api.md",
  "docs/api/ui-data-grid-api.md",
  "docs/api/ui-elements-api.md",
  "docs/governance/01-project-source-of-truth.md",
  "docs/architecture/00-system-overview.md",
  "docs/architecture/01-package-boundaries.md",
  "docs/architecture/02-state-and-adapter-ownership.md",
  "docs/architecture/08-semantic-token-contract.md",
  "docs/architecture/09-component-contracts-and-events.md",
  "docs/architecture/11-canonical-model-and-form-semantics.md",
  "docs/architecture/12-composition-mapping-contract.md",
  "docs/architecture/13-event-ref-mapping-contract.md",
  "docs/architecture/14-non-grid-contract-coverage.md",
  "docs/architecture/15-component-presets-and-aliases.md",
  "docs/architecture/adr-005-canonical-web-implementation.md",
  "docs/architecture/adr-006-framework-package-strategy.md",
  "docs/architecture/adr-008-framework-exception-policy.md",
  "docs/architecture/adr-009-react-canonical-convergence.md",
  "docs/quality/00-quality-gates.md",
  "docs/quality/03-known-limitations.md",
  "docs/testing/browser-testing.md",
  "docs/testing/visual-regression.md",
  "docs/release/README.md",
  "docs/release/multi-framework-migration-and-limitations.md",
  "packages/ui-core/README.md",
  "packages/ui-behaviors/README.md",
  "packages/ui-components/README.md",
  "packages/ui-elements/README.md",
  "packages/ui-angular/README.md",
  "packages/ui-vue/README.md",
  "packages/ui-data-grid/README.md",
  ".ai/AI_CONTEXT.md",
  "AGENTS.md",
];

const stalePatterns = [
  [
    /\bimplemented only in React\b/iu,
    "must describe supported framework surfaces from canonical metadata instead of a React-only historical statement",
  ],
  [
    /\bReact is the canonical implementation\b/iu,
    "must not present React as the canonical product implementation",
  ],
  [
    /\bNative is the canonical implementation\b/iu,
    "must not present Native as the canonical product implementation",
  ],
  [
    /\bReact-first\b/iu,
    "must not describe the product as React-first",
  ],
  [
    /\bNative-first\b/iu,
    "must not describe the product as Native-first",
  ],
  [
    /\bframework lane\b/iu,
    "must not describe current framework work using retired persistent-lane terminology",
  ],
  [
    /\blane promotion\b/iu,
    "must not describe current delivery using retired lane-promotion terminology",
  ],
];

const deprecatedAiMirrorPaths = [
  ".ai/COMPONENT_MAP.json",
  ".ai/PACKAGE_MAP.json",
  ".ai/API_MAP.json",
];

function buildPackageChannelMap(releaseGroups) {
  const channels = new Map();
  for (const releaseLine of getReleaseLineEntries(releaseGroups)) {
    for (const packageName of releaseLine.packages ?? []) {
      channels.set(packageName, releaseLine.distTag);
    }
  }
  return channels;
}

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function verifyDeprecatedAiMirrors({ root, failures }) {
  for (const relativePath of deprecatedAiMirrorPaths) {
    if (existsSync(path.join(root, relativePath))) {
      failures.push(
        `${relativePath}: retired AI mirror must stay removed; use generated docs/generated/ai-context outputs`,
      );
    }
  }
}

function verifyPackageReadmeOwnership({ root, failures }) {
  for (const relativePath of documentationCurrentPaths) {
    if (!relativePath.startsWith("packages/") || !relativePath.endsWith("/README.md")) {
      continue;
    }
    const content = read(root, relativePath);
    if (/\bsource of truth for the component catalog\b/iu.test(content)) {
      failures.push(
        `${relativePath}: package README must not claim ownership of the shared component catalog`,
      );
    }
  }
}

function getReaderFacingMarkdownPaths({ root }) {
  const registryPath = path.join(root, "docs/generated/documentation-registry.json");
  if (!existsSync(registryPath)) return [];
  const registry = JSON.parse(readFileSync(registryPath, "utf8"));
  return [
    ...new Set(
      (registry.pages ?? [])
        .filter(
          (page) =>
            page.renderer === "markdown" &&
            typeof page.sourcePath === "string" &&
            page.sourcePath.endsWith(".md"),
        )
        .map((page) => page.sourcePath),
    ),
  ].sort();
}

function verifyReaderFacingMarkdownCoverage({ root, failures }) {
  for (const relativePath of getReaderFacingMarkdownPaths({ root })) {
    if (!documentationCurrentPaths.includes(relativePath)) {
      failures.push(
        `${relativePath}: reader-facing Markdown route must be included in documentationCurrentPaths for currency and link verification`,
      );
    }
  }
}

function verifyRetiredReferenceAuthorityMentions({ root, failures }) {
  for (const relativePath of documentationCurrentPaths) {
    const content = read(root, relativePath);
    for (const retiredPath of retiredReferencePaths) {
      if (content.includes(retiredPath)) {
        failures.push(
          `${relativePath}: current guidance references retired Reference authority ${retiredPath}`,
        );
      }
    }
  }
}

export function verifyDocumentationCurrent({ root = repositoryRoot } = {}) {
  const failures = [];
  const releaseGroups = readReleaseGroups({ root });
  const channels = buildPackageChannelMap(releaseGroups);

  verifyDeprecatedAiMirrors({ root, failures });
  verifyRetiredReferenceAuthorityMentions({ root, failures });
  verifyPackageReadmeOwnership({ root, failures });
  verifyReaderFacingMarkdownCoverage({ root, failures });

  for (const relativePath of documentationCurrentPaths) {
    const content = read(root, relativePath);

    if (
      relativePath !== "docs/release/versioning-policy.md" &&
      /\b\d+\.\d+\.\d+-(?:alpha|beta|rc)\.\d+\b/iu.test(content)
    ) {
      failures.push(
        `${relativePath}: primary guidance must use prerelease channels instead of hardcoded prerelease versions`,
      );
    }

    for (const [pattern, message] of stalePatterns) {
      if (pattern.test(content)) {
        failures.push(`${relativePath}: ${message}`);
      }
    }

    for (const [packageName, distTag] of channels.entries()) {
      const escapedPackageName = packageName.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
      const packagePattern = new RegExp(`${escapedPackageName}@(alpha|beta|rc|latest)`, "giu");
      for (const match of content.matchAll(packagePattern)) {
        const documentedTag = match[1].toLowerCase();
        if (documentedTag !== distTag) {
          failures.push(
            `${relativePath}: ${packageName} must use canonical dist-tag ${distTag}, found ${documentedTag}`,
          );
        }
      }
    }
  }

  return [...new Set(failures)].sort();
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const failures = verifyDocumentationCurrent();
  if (failures.length > 0) {
    console.error("Documentation currentness verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("Documentation currentness verification passed.");
  }
}
