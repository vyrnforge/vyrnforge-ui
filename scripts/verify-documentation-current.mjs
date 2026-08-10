import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  "docs/packages/ui-data-grid.md",
  "docs/governance/00-documentation-governance.md",
  "docs/governance/01-project-source-of-truth.md",
  "docs/governance/04-metadata-maintenance.md",
  "docs/architecture/00-system-overview.md",
  "docs/architecture/01-package-boundaries.md",
  "docs/architecture/02-state-and-adapter-ownership.md",
  "docs/architecture/adr-004-multi-framework-web-support.md",
  "docs/architecture/09-component-contracts-and-events.md",
  "docs/architecture/10-custom-elements-and-form-association.md",
  "docs/roadmap/00-master-roadmap.md",
  "docs/roadmap/01-component-inventory.md",
  "docs/roadmap/02-gap-analysis.md",
  "docs/roadmap/03-do-not-build-yet.md",
  "docs/quality/03-known-limitations.md",
  "docs/release/README.md",
  "docs/release/versioning-policy.md",
  "docs/release/multi-framework-migration-and-limitations.md",
  "docs/testing/multi-framework-consumer-fixtures.md",
  "packages/ui-core/README.md",
  "packages/ui-behaviors/README.md",
  "packages/ui-components/README.md",
  "packages/ui-elements/README.md",
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
  "docs/release/multi-framework-migration-and-limitations.md",
  "packages/ui-core/README.md",
  "packages/ui-behaviors/README.md",
  "packages/ui-components/README.md",
  "packages/ui-elements/README.md",
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
  "docs/packages/ui-data-grid.md",
  "docs/governance/01-project-source-of-truth.md",
  "docs/architecture/00-system-overview.md",
  "docs/architecture/01-package-boundaries.md",
  "docs/architecture/02-state-and-adapter-ownership.md",
  "docs/architecture/09-component-contracts-and-events.md",
  "docs/quality/03-known-limitations.md",
  "docs/release/README.md",
  "docs/release/multi-framework-migration-and-limitations.md",
  "packages/ui-core/README.md",
  "packages/ui-behaviors/README.md",
  "packages/ui-components/README.md",
  "packages/ui-elements/README.md",
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

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function buildPackageChannelMap(releaseGroups) {
  const channels = new Map();
  for (const releaseGroup of Object.values(releaseGroups.groups ?? {})) {
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
    "## Project planning",
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

  const componentInventory = read(
    root,
    "docs/roadmap/01-component-inventory.md",
  );
  for (const marker of [
    "../metadata/components.json",
    "../generated/component-reference.json",
  ]) {
    if (!componentInventory.includes(marker)) {
      failures.push(
        `docs/roadmap/01-component-inventory.md: missing canonical pointer ${marker}`,
      );
    }
  }
  if (
    /^\|\s*(?:Button|TextInput|UniversalDataGrid)\s*\|/mu.test(
      componentInventory,
    )
  ) {
    failures.push(
      "docs/roadmap/01-component-inventory.md: manual component table must not duplicate canonical metadata",
    );
  }
}

function verifyVersionPolicy({ root, releaseGroups, failures }) {
  const policy = read(root, "docs/release/versioning-policy.md");
  for (const [releaseGroupId, releaseGroup] of Object.entries(
    releaseGroups.groups ?? {},
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

function verifyRoadmapContracts({ root, failures }) {
  const roadmap = read(root, "docs/roadmap/00-master-roadmap.md");

  for (const marker of ["RS-9006", "RS-9007"]) {
    if (!roadmap.includes(marker)) {
      failures.push(`docs/roadmap/00-master-roadmap.md: missing ${marker}`);
    }
  }

  for (let task = 5001; task <= 5016; task += 1) {
    const marker = `MF-${task}`;
    if (!roadmap.includes(marker)) {
      failures.push(
        `docs/roadmap/00-master-roadmap.md: missing historical behavior marker ${marker}`,
      );
    }
  }
}

export function verifyDocumentationCurrent({ root = repositoryRoot } = {}) {
  const failures = [];
  const releaseGroups = JSON.parse(
    read(root, "docs/metadata/release-groups.json"),
  );
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
  verifyPrimaryStructure({ root, failures });
  verifyVersionPolicy({ root, releaseGroups, failures });
  verifyRoadmapContracts({ root, failures });

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
