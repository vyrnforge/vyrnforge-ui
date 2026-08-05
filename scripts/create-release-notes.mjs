import { writeFileSync } from "node:fs";
import {
  getReleaseGroup,
  getReleasePackageMap,
  readReleaseGroups,
} from "./release-groups.mjs";

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const releaseGroupId = readArgument("--release-group");
const version = readArgument("--version");
const distTag = readArgument("--dist-tag");
const commit = readArgument("--commit") ?? process.env.GITHUB_SHA ?? "unknown";
const output = readArgument("--output");

if (!releaseGroupId || !version || !distTag || !output) {
  throw new Error(
    "usage: create-release-notes.mjs --release-group <group> --version <version> --dist-tag <tag> --output <file>",
  );
}

const manifest = readReleaseGroups();
const releaseGroup = getReleaseGroup(releaseGroupId, { manifest });
const packageMap = getReleasePackageMap(manifest);
if (version !== releaseGroup.version || distTag !== releaseGroup.distTag) {
  throw new Error(
    `${releaseGroupId} requires ${releaseGroup.version} with the ${releaseGroup.distTag} dist-tag`,
  );
}

const packageLines = releaseGroup.packages
  .map((packageInfo) => `- \`${packageInfo.name}@${version}\``)
  .join("\n");
const installPackages = releaseGroup.packages
  .map((packageInfo) => `${packageInfo.name}@${distTag}`)
  .join(" ");
const cssImports = releaseGroup.packages
  .filter((packageInfo) => packageInfo.hasCss)
  .map((packageInfo) => `import "${packageInfo.name}/styles/index.css";`)
  .join("\n");
const packageOrder = releaseGroup.packages
  .map((packageInfo) => packageInfo.name.replace("@vyrnforge/", ""))
  .join(" → ");
const externalDependencies = releaseGroup.packages.flatMap((packageInfo) =>
  Object.entries(packageInfo.dependencies ?? {})
    .filter(
      ([dependencyName]) =>
        !releaseGroup.packages.some(
          (candidate) => candidate.name === dependencyName,
        ),
    )
    .map(([dependencyName, dependencyVersion]) => {
      const dependencyPackage = packageMap.get(dependencyName);
      return `- \`${dependencyName}@${dependencyVersion}\` (${dependencyPackage?.releaseGroupId ?? "external"})`;
    }),
);
const dependencySection = externalDependencies.length
  ? `\n## Required VyrnForge dependencies\n\n${[...new Set(externalDependencies)].join("\n")}\n`
  : "";

const notes = `# VyrnForge UI ${version}

VyrnForge UI ${version} is the **${releaseGroupId}** ${distTag} prerelease. It is not a stable or production-readiness claim.

## Packages

${packageLines}

Packages in this release group use the versions declared in the canonical BT-8002 release manifest.
${dependencySection}
## Installation

\`\`\`bash
npm install ${installPackages}
\`\`\`

Import package CSS in dependency order:

\`\`\`ts
${cssImports}
\`\`\`

## Release evidence

- Release group: \`${releaseGroupId}\`
- Source commit: \`${commit}\`
- npm publication: GitHub OIDC trusted publishing
- Package order: ${packageOrder}
- Registry metadata and fresh external consumer build verified before this release record was created
- npm registry signatures and provenance attestations verified with the npm CLI
- npm provenance is generated automatically by trusted publishing

See [CHANGELOG.md](https://github.com/vyrnforge/vyrnforge-ui/blob/${commit}/CHANGELOG.md) for the repository change summary and [release governance](https://github.com/vyrnforge/vyrnforge-ui/tree/${commit}/docs/release) for maturity and licensing expectations.
`;

writeFileSync(output, notes);
