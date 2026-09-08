import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getReleaseLineEntries, readReleaseGroups } from "./release-groups.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const documentationCurrentPaths = [
  "README.md",
  "docs/README.md",
  "docs/api/README.md",
  "docs/api/import-and-setup.md",
  "docs/api/ui-behaviors-api.md",
  "docs/api/ui-components-api.md",
  "docs/api/ui-data-grid-api.md",
  "docs/api/ui-elements-api.md",
  "docs/packages/ui-core.md",
  "docs/packages/ui-behaviors.md",
  "docs/packages/ui-components.md",
  "docs/packages/ui-elements.md",
  "docs/packages/ui-angular.md",
  "docs/packages/ui-vue.md",
  "docs/packages/ui-data-grid.md",
  "docs/governance/00-documentation-governance.md",
  "docs/governance/01-project-source-of-truth.md",
  "docs/governance/04-metadata-maintenance.md",
  "docs/architecture/00-system-overview.md",
  "docs/architecture/01-package-boundaries.md",
  "docs/architecture/02-state-and-adapter-ownership.md",
  "docs/architecture/08-semantic-token-contract.md",
  "docs/architecture/adr-004-multi-framework-web-support.md",
  "docs/architecture/09-component-contracts-and-events.md",
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
  ".ai/REPO_MAP.md",
  "AGENTS.md",
];

export const documentationInstallGuidancePaths = [
  "README.md",
  "docs/api/import-and-setup.md",
  "docs/api/ui-components-api.md",
  "docs/api/ui-elements-api.md",
  "docs/packages/ui-angular.md",
  "docs/packages/ui-vue.md",
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
  "docs/README.md",
  "docs/api/README.md",
  "docs/api/import-and-setup.md",
  "docs/api/ui-behaviors-api.md",
  "docs/api/ui-components-api.md",
  "docs/api/ui-data-grid-api.md",
  "docs/api/ui-elements-api.md",
  "docs/packages/ui-core.md",
  "docs/packages/ui-behaviors.md",
  "docs/packages/ui-components.md",
  "docs/packages/ui-elements.md",
  "docs/packages/ui-angular.md",
  "docs/packages/ui-vue.md",
  "docs/packages/ui-data-grid.md",
  "docs/governance/01-project-source-of-truth.md",
  "docs/architecture/00-system-overview.md",
  "docs/architecture/01-package-boundaries.md",
  "docs/architecture/02-state-and-adapter-ownership.md",
  "docs/architecture/08-semantic-token-contract.md",
  "docs/architecture/09-component-contracts-and-events.md",
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
  ".ai/REPO_MAP.md",
  "AGENTS.md",
];

const stalePatterns = [
  [/early alpha/iu, "stale early-alpha wording"],
  [/\bpre-alpha\b/iu, "stale pre-alpha wording"],
  [/planned native renderer/iu, "stale planned-native-renderer wording"],
  [
    /does not yet have a public package entry point/iu,
    "stale unavailable-native-package wording",
  ],
  [/GMF2 remains in progress/iu, "stale behavior-closure wording"],
  [/Still deferred within S5/iu, "stale behavior-deferred wording"],
  [/runtime work begins after/iu, "stale future-runtime wording"],
  [/included after GMF4 evidence/iu, "stale framework-support wording"],
  [
    /until the GMF4 compatibility gate closes/iu,
    "stale compatibility-gate wording",
  ],
  [
    /Vue `v-model` translation remains CF-\d+ work/iu,
    "stale Vue adapter wording",
  ],
  [/\bnpm run quality\b/u, "removed public command: npm run quality"],
  [/\bnpm run verify:ci\b/u, "removed public command: npm run verify:ci"],
];

const frameworkFirstInstallContracts = [
  {
    path: "README.md",
    required: [
      "npm install @vyrnforge/ui-components@beta",
      "npm install @vyrnforge/ui-elements@beta",
      "npm install @vyrnforge/ui-angular@beta",
      "npm install @vyrnforge/ui-vue@beta vue",
    ],
  },
  {
    path: "docs/api/import-and-setup.md",
    required: [
      "npm install @vyrnforge/ui-components@beta",
      "npm install @vyrnforge/ui-elements@beta",
      "npm install @vyrnforge/ui-angular@beta",
      "npm install @vyrnforge/ui-vue@beta vue",
    ],
  },
  {
    path: "packages/ui-components/README.md",
    required: ["npm install @vyrnforge/ui-components@beta"],
  },
  {
    path: "packages/ui-elements/README.md",
    required: ["npm install @vyrnforge/ui-elements@beta"],
  },
  {
    path: "docs/packages/ui-angular.md",
    required: ["npm install @vyrnforge/ui-angular@beta"],
  },
];

const obsoleteFoundationFirstInstalls = [
  "npm install @vyrnforge/ui-core@beta @vyrnforge/ui-components@beta",
  "npm install @vyrnforge/ui-core@beta @vyrnforge/ui-elements@beta",
  "npm install @vyrnforge/ui-core@beta @vyrnforge/ui-elements@beta @vyrnforge/ui-angular@beta",
  "npm install @vyrnforge/ui-core@beta @vyrnforge/ui-elements@beta @vyrnforge/ui-vue@beta vue",
];

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function buildPackageChannelMap(releaseGroups) {
  const channels = new Map();
  for (const [, releaseGroup] of getReleaseLineEntries(releaseGroups)) {
    for (const packageInfo of releaseGroup.packages ?? []) {
      channels.set(packageInfo.name, releaseGroup.distTag);
    }
  }
  return channels;
}

function verifyInstallCommands({ root, channels, failures }) {
  for (const relativePath of documentationInstallGuidancePaths) {
    const content = read(root, relativePath);
    for (const match of content.matchAll(/npm install ([^\r\n]+)/gu)) {
      const tokens = match[1].trim().split(/\s+/u);
      for (const token of tokens) {
        if (!token.startsWith("@vyrnforge/")) continue;
        const packageMatch = token.match(
          /^(@vyrnforge\/[A-Za-z0-9-]+)(?:@([A-Za-z0-9._-]+))?$/u,
        );
        if (!packageMatch) {
          failures.push(
            `${relativePath}: unsupported VyrnForge install token ${token}`,
          );
          continue;
        }

        const [, packageName, channel] = packageMatch;
        const expected = channels.get(packageName);
        if (!expected) {
          failures.push(
            `${relativePath}: install references unknown package ${packageName}`,
          );
          continue;
        }
        if (!channel) {
          failures.push(
            `${relativePath}: ${packageName} install must use explicit @${expected}`,
          );
          continue;
        }
        if (channel !== expected) {
          failures.push(
            `${relativePath}: ${packageName} install uses @${channel}; expected @${expected}`,
          );
        }
      }
    }
  }
}

function verifyFrameworkFirstInstallation({ root, failures }) {
  for (const contract of frameworkFirstInstallContracts) {
    const content = read(root, contract.path);
    for (const marker of contract.required) {
      if (!content.includes(marker)) {
        failures.push(
          `${contract.path}: missing framework-first install guidance ${marker}`,
        );
      }
    }
  }

  for (const relativePath of [
    "README.md",
    "docs/api/import-and-setup.md",
    "packages/ui-components/README.md",
    "packages/ui-elements/README.md",
    "docs/packages/ui-angular.md",
    "docs/packages/ui-vue.md",
  ]) {
    const content = read(root, relativePath);
    for (const obsolete of obsoleteFoundationFirstInstalls) {
      if (content.includes(obsolete)) {
        failures.push(
          `${relativePath}: normal setup must be framework-first instead of exposing the foundation graph`,
        );
      }
    }
  }
}

function verifyPrimaryStructure({ root, failures }) {
  const rootReadme = read(root, "README.md");
  for (const heading of [
    "## Maturity and release channels",
    "## Packages",
    "## Installation",
    "## Minimal usage",
    "## Development",
    "## Documentation",
  ]) {
    if (!rootReadme.includes(heading)) {
      failures.push(`README.md: missing required section ${heading}`);
    }
  }

  for (const link of [
    "docs/api/import-and-setup.md",
    "docs/README.md",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "LICENSE",
  ]) {
    if (!rootReadme.includes(link)) {
      failures.push(`README.md: missing required link ${link}`);
    }
  }

  const docsIndex = read(root, "docs/README.md");
  for (const heading of [
    "## Use VyrnForge",
    "## Build VyrnForge",
    "## Maintain VyrnForge",
    "## Execution and planning",
    "## Historical evidence",
  ]) {
    if (!docsIndex.includes(heading)) {
      failures.push(`docs/README.md: missing audience section ${heading}`);
    }
  }
  for (const link of ["api/import-and-setup.md", "../CONTRIBUTING.md"]) {
    if (!docsIndex.includes(link)) {
      failures.push(`docs/README.md: missing one-click link ${link}`);
    }
  }
}

function verifyVersionPolicy({ root, releaseGroups, failures }) {
  const policy = read(root, "docs/release/versioning-policy.md");
  for (const [releaseGroupId, releaseGroup] of getReleaseLineEntries(
    releaseGroups,
  )) {
    if (!policy.includes(releaseGroupId)) {
      failures.push(
        `docs/release/versioning-policy.md: missing release group id ${releaseGroupId}`,
      );
    }
    if (!policy.includes(releaseGroup.version)) {
      failures.push(
        `docs/release/versioning-policy.md: missing ${releaseGroupId} version ${releaseGroup.version}`,
      );
    }
    if (!policy.includes(`\`${releaseGroup.distTag}\``)) {
      failures.push(
        `docs/release/versioning-policy.md: missing ${releaseGroupId} dist-tag ${releaseGroup.distTag}`,
      );
    }
    for (const packageInfo of releaseGroup.packages ?? []) {
      if (!policy.includes(packageInfo.name)) {
        failures.push(
          `docs/release/versioning-policy.md: missing release package ${packageInfo.name}`,
        );
      }
    }
  }
}

export function verifyDocumentationCurrent({ root = repositoryRoot } = {}) {
  const failures = [];
  const releaseGroups = readReleaseGroups({ root });
  const channels = buildPackageChannelMap(releaseGroups);

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
  }

  const historicalIdPattern =
    /\b(?:CF|MF|EL|BT)-\d{4}\b|\bGMF[1-4]\b|\bS[0-8]\b/gu;
  for (const relativePath of documentationTaskFreePaths) {
    const content = read(root, relativePath);
    const match = content.match(historicalIdPattern);
    if (match) {
      failures.push(
        `${relativePath}: current guidance contains historical task/gate identifier ${match[0]}`,
      );
    }
  }

  verifyInstallCommands({ root, channels, failures });
  verifyFrameworkFirstInstallation({ root, failures });
  verifyPrimaryStructure({ root, failures });
  verifyVersionPolicy({ root, releaseGroups, failures });

  return failures;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const failures = verifyDocumentationCurrent();
  if (failures.length) {
    console.error(
      `Documentation currency verification failed:\n- ${failures.join("\n- ")}`,
    );
    process.exitCode = 1;
  } else {
    console.log("Documentation currency verification passed.");
  }
}
