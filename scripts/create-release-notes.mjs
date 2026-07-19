import { writeFileSync } from "node:fs";

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const version = readArgument("--version");
const distTag = readArgument("--dist-tag");
const commit = readArgument("--commit") ?? process.env.GITHUB_SHA ?? "unknown";
const output = readArgument("--output");

if (!version || !distTag || !output) {
  throw new Error("usage: create-release-notes.mjs --version <version> --dist-tag <tag> --output <file>");
}

const notes = `# VyrnForge UI ${version}

VyrnForge UI ${version} is a coordinated **${distTag} prerelease** of the source-available VyrnForge UI packages. It is not a stable or production-readiness claim.

## Packages

- \`@vyrnforge/ui-core@${version}\`
- \`@vyrnforge/ui-components@${version}\`
- \`@vyrnforge/ui-data-grid@${version}\`

All internal VyrnForge dependencies use the exact coordinated version.

## Installation

\`\`\`bash
npm install @vyrnforge/ui-core@${distTag} @vyrnforge/ui-components@${distTag} @vyrnforge/ui-data-grid@${distTag}
\`\`\`

Import package CSS in this order:

\`\`\`ts
import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-components/styles/index.css";
import "@vyrnforge/ui-data-grid/styles/index.css";
\`\`\`

## Release evidence

- Source commit: \`${commit}\`
- npm publication: GitHub OIDC trusted publishing
- Package order: ui-core → ui-components → ui-data-grid
- Registry metadata and fresh external consumer build verified before this release record was created
- npm registry signatures and provenance attestations verified with the npm CLI
- npm provenance is generated automatically by trusted publishing

See [CHANGELOG.md](https://github.com/vyrnforge/vyrnforge-ui/blob/${commit}/CHANGELOG.md) for the repository change summary and [release governance](https://github.com/vyrnforge/vyrnforge-ui/tree/${commit}/docs/release) for maturity and licensing expectations.
`;

writeFileSync(output, notes);
