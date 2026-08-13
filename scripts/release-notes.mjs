export function buildReleaseNotes({
  releaseGroupId,
  releaseGroup,
  packageMap,
  version,
  distTag,
  commit,
  activeWaiver,
}) {
  const packageLines = releaseGroup.packages
    .map(
      (packageInfo) =>
        `- \`${packageInfo.name}@${version}\` — ${packageInfo.role}`,
    )
    .join("\n");
  const installPackages = releaseGroup.packages
    .map((packageInfo) => `${packageInfo.name}@${distTag}`)
    .join(" ");
  const cssImports = releaseGroup.packages
    .filter((packageInfo) => packageInfo.policies?.hasCss === true)
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
  const cssSection = cssImports
    ? `\nImport CSS only for packages that declare CSS in release metadata:\n\n\`\`\`ts\n${cssImports}\n\`\`\`\n`
    : "\nNo package in this release line declares a CSS payload.\n";
  const accessibilityExceptionSection = activeWaiver
    ? `\n## Accessibility release exception\n\nManual Windows/NVDA review for ${activeWaiver.scenarioIds.join(", ")} is deferred under \`${activeWaiver.id}\`. No manual screen-reader pass or accessibility-complete status is claimed. The exception is tracked at ${activeWaiver.trackingIssue}, expires on \`${activeWaiver.expiresAt}\`, and blocks stable promotion.\n`
    : "";

  return `# VyrnForge UI ${version}

VyrnForge UI ${version} is the **${releaseGroupId}** ${distTag} release line. It is not a stable or production-readiness claim unless the selected release metadata says otherwise.

## Packages and roles

${packageLines}

Package membership, versions, roles, dependencies, CSS policy, and release identity come from the canonical release-group metadata.
${dependencySection}
## Installation

Install the packages from this release line that your application actually consumes:

\`\`\`bash
npm install ${installPackages}
\`\`\`
${cssSection}${accessibilityExceptionSection}
## Release evidence

- Release group: \`${releaseGroupId}\`
- Source commit: \`${commit}\`
- npm publication: GitHub OIDC trusted publishing
- Package order: ${packageOrder}
- Registry metadata and external consumer verification are release-line policy driven
- npm registry signatures and provenance attestations are verified with the npm CLI when enabled for the release line

See [CHANGELOG.md](https://github.com/vyrnforge/vyrnforge-ui/blob/${commit}/CHANGELOG.md) for the repository change summary and [release governance](https://github.com/vyrnforge/vyrnforge-ui/tree/${commit}/docs/release) for maturity and licensing expectations.
`;
}
