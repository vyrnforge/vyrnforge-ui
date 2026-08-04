import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getReleaseGroup, readReleaseGroups } from "./release-groups.mjs";

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const betaReleaseGroupId = "non-grid-beta";
export const betaPackageContractPath =
  "docs/metadata/beta-package-artifacts.json";
export const betaPackageDocumentationPath =
  "docs/release/beta-package-artifact-verification.md";
export const betaPackageConsumerPath = "tests/beta-package-consumer";
export const betaPackageReportDirectory =
  "test-results/beta-package-artifacts";

const conditionOrder = ["types", "import", "require", "default"];
const localDependencyPattern =
  /^(?:workspace:|file:|link:|\.{1,2}(?:[\\/]|$)|[A-Za-z]:[\\/]|\/)/;
const forbiddenPackedFilePatterns = [
  /^src\//u,
  /(?:^|\/)__tests__\//u,
  /\.(?:test|spec|stories)\.[^/]+$/u,
  /\.tsbuildinfo$/u,
  /\.map$/u,
  /(?:^|\/)\.env(?:\.|$)/u,
  /\.(?:log|tgz|zip)$/u,
  /^(?:draft|confidential)(?:\/|$)/iu,
];

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function normalizeTarget(target) {
  return target.replace(/^\.\//u, "");
}

function exportSpecifier(packageName, exportKey) {
  return exportKey === "."
    ? packageName
    : `${packageName}/${exportKey.replace(/^\.\//u, "")}`;
}

function classifyStringExport(target) {
  if (target.endsWith(".css")) return "css";
  if (target.endsWith(".json")) return "json";
  return "runtime";
}

export function collectExportEntries(packageName, exportsMap = {}) {
  return Object.keys(exportsMap)
    .sort((left, right) => left.localeCompare(right))
    .map((exportKey) => {
      const value = exportsMap[exportKey];
      const base = {
        exportKey,
        specifier: exportSpecifier(packageName, exportKey),
      };

      if (typeof value === "string") {
        return {
          ...base,
          kind: classifyStringExport(value),
          target: value,
        };
      }

      const targets = Object.fromEntries(
        Object.keys(value ?? {})
          .sort((left, right) => {
            const leftIndex = conditionOrder.indexOf(left);
            const rightIndex = conditionOrder.indexOf(right);
            if (leftIndex === -1 && rightIndex === -1) {
              return left.localeCompare(right);
            }
            if (leftIndex === -1) return 1;
            if (rightIndex === -1) return -1;
            return leftIndex - rightIndex;
          })
          .map((condition) => [condition, value[condition]]),
      );

      return {
        ...base,
        kind: "conditional",
        targets,
      };
    });
}

export function exportTargets(entryPoints) {
  return entryPoints.flatMap((entryPoint) => {
    if (entryPoint.target) return [entryPoint.target];
    return Object.values(entryPoint.targets ?? {});
  });
}

export function buildBetaPackageContract({ root = repositoryRoot } = {}) {
  const releaseManifest = readReleaseGroups({ root });
  const releaseGroup = getReleaseGroup(betaReleaseGroupId, {
    root,
    manifest: releaseManifest,
  });

  const packages = releaseGroup.packages.map((releasePackage) => {
    const packageJson = readJson(
      root,
      path.join(releasePackage.directory, "package.json"),
    );
    const entryPoints = collectExportEntries(packageJson.name, packageJson.exports);
    const requiredPayload = [
      "LICENSE",
      "README.md",
      "package.json",
      ...entryPoints.map((entryPoint) =>
        entryPoint.target
          ? normalizeTarget(entryPoint.target)
          : Object.values(entryPoint.targets ?? {}).map(normalizeTarget),
      ),
    ].flat();

    return {
      name: packageJson.name,
      directory: releasePackage.directory,
      version: packageJson.version,
      files: packageJson.files,
      sideEffects: packageJson.sideEffects,
      main: packageJson.main,
      module: packageJson.module,
      types: packageJson.types,
      ...(packageJson.customElements
        ? { customElements: packageJson.customElements }
        : {}),
      entryPoints,
      requiredPayload: [...new Set(requiredPayload)].sort((left, right) =>
        left.localeCompare(right),
      ),
    };
  });

  return {
    schemaVersion: 1,
    sourceOfTruth: {
      canonical: true,
      task: "BT-8003",
      documentation: betaPackageDocumentationPath,
      releaseGroups: "docs/metadata/release-groups.json",
    },
    task: {
      id: "BT-8003",
      title: "Verify package exports and tarballs",
      status: "done",
      dependsOn: ["BT-8002", "CF-7008"],
      unlocksAfterMerge: ["BT-8004", "BT-8005", "BT-8006"],
    },
    releaseGroup: {
      id: betaReleaseGroupId,
      channel: releaseGroup.channel,
      version: releaseGroup.version,
      distTag: releaseGroup.distTag,
      packageCount: packages.length,
      excludes: ["@vyrnforge/ui-data-grid"],
    },
    packages,
    verification: {
      command: "npm run verify:beta-package-artifacts",
      contractCommand: "npm run verify:beta-package-contract",
      testCommand: "npm run test:beta-package-contract",
      consumerFixture: betaPackageConsumerPath,
      reportDirectory: betaPackageReportDirectory,
      reportFiles: ["tarball-report.json", "consumer-report.json", "consumer.log"],
      actualTarballsRequired: true,
      offlineVyrnForgeInstallRequired: true,
      workspaceLinksForbidden: true,
      allPublicEntryPointsRequired: true,
      typecheckRequired: true,
      productionBuildRequired: true,
      cleanupRequired: true,
    },
    releaseReadiness: "not-ready",
  };
}

export function writeBetaPackageContract({ root = repositoryRoot } = {}) {
  const output = path.join(root, betaPackageContractPath);
  writeFileSync(
    output,
    `${JSON.stringify(buildBetaPackageContract({ root }), null, 2)}\n`,
  );
  return output;
}

export function validatePackageManifest(packageRecord, packageJson) {
  const failures = [];

  if (packageJson.name !== packageRecord.name) {
    failures.push(`${packageRecord.directory}: package name mismatch`);
  }
  if (packageJson.version !== packageRecord.version) {
    failures.push(`${packageRecord.name}: version must be ${packageRecord.version}`);
  }
  if (!packageJson.exports || !Object.keys(packageJson.exports).length) {
    failures.push(`${packageRecord.name}: exports map is required`);
  }

  for (const entryPoint of collectExportEntries(
    packageJson.name,
    packageJson.exports,
  )) {
    for (const target of exportTargets([entryPoint])) {
      if (typeof target !== "string" || !target.startsWith("./")) {
        failures.push(
          `${entryPoint.specifier}: export target must be a relative package path`,
        );
      }
      if (target.includes("/src/") || target.startsWith("./src")) {
        failures.push(`${entryPoint.specifier}: export must not point to source`);
      }
    }
  }

  for (const dependencyGroup of [
    "dependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    for (const [dependencyName, dependencySpec] of Object.entries(
      packageJson[dependencyGroup] ?? {},
    )) {
      if (
        typeof dependencySpec !== "string" ||
        localDependencyPattern.test(dependencySpec)
      ) {
        failures.push(
          `${packageRecord.name}: ${dependencyName} must not use a workspace or local dependency spec`,
        );
      }
    }
  }

  return failures;
}

export function validatePackedFiles(packageRecord, packedFiles) {
  const failures = [];
  const files = packedFiles.map((file) =>
    typeof file === "string" ? file : file.path,
  );
  const allowedRootFiles = new Set([
    "LICENSE",
    "README.md",
    "package.json",
    ...(packageRecord.customElements ? [normalizeTarget(packageRecord.customElements)] : []),
  ]);

  for (const requiredFile of packageRecord.requiredPayload) {
    if (!files.includes(requiredFile)) {
      failures.push(`${packageRecord.name}: tarball is missing ${requiredFile}`);
    }
  }

  for (const file of files) {
    const allowed = file.startsWith("dist/") || allowedRootFiles.has(file);
    if (!allowed) {
      failures.push(`${packageRecord.name}: unexpected tarball file ${file}`);
    }
    if (forbiddenPackedFilePatterns.some((pattern) => pattern.test(file))) {
      failures.push(`${packageRecord.name}: forbidden tarball file ${file}`);
    }
  }

  return failures;
}

export function verifyBetaPackageContract({ root = repositoryRoot } = {}) {
  const failures = [];
  const contractFile = path.join(root, betaPackageContractPath);
  if (!existsSync(contractFile)) {
    return [`BT-8003 evidence is missing: ${betaPackageContractPath}`];
  }

  const actual = buildBetaPackageContract({ root });
  const committed = readJson(root, betaPackageContractPath);
  if (JSON.stringify(actual) !== JSON.stringify(committed)) {
    failures.push(
      `${betaPackageContractPath} is stale; run npm run generate:beta-package-contract`,
    );
  }

  if (
    actual.releaseGroup.packageCount !== 4 ||
    actual.packages.some((packageRecord) =>
      packageRecord.name.includes("ui-data-grid"),
    )
  ) {
    failures.push("BT-8003 must verify exactly four non-grid beta packages");
  }

  for (const packageRecord of actual.packages) {
    if (packageRecord.version !== actual.releaseGroup.version) {
      failures.push(
        `${packageRecord.name}: version must be ${actual.releaseGroup.version}`,
      );
    }
    const packageJson = readJson(
      root,
      path.join(packageRecord.directory, "package.json"),
    );
    failures.push(...validatePackageManifest(packageRecord, packageJson));
  }

  const documentationFile = path.join(root, betaPackageDocumentationPath);
  if (!existsSync(documentationFile)) {
    failures.push(`BT-8003 documentation is missing: ${betaPackageDocumentationPath}`);
  } else {
    const documentation = readFileSync(documentationFile, "utf8");
    for (const packageRecord of actual.packages) {
      for (const entryPoint of packageRecord.entryPoints) {
        if (!documentation.includes(`\`${entryPoint.specifier}\``)) {
          failures.push(
            `${betaPackageDocumentationPath}: missing ${entryPoint.specifier}`,
          );
        }
      }
    }
  }

  const requiredFiles = [
    "scripts/verify-beta-package-artifacts.mjs",
    "scripts/verify-beta-package-contract.mjs",
    "scripts/verify-beta-package-contract.test.mjs",
    `${betaPackageConsumerPath}/package.json`,
    `${betaPackageConsumerPath}/src/main.tsx`,
    `${betaPackageConsumerPath}/src/entrypoints.ts`,
  ];
  for (const requiredFile of requiredFiles) {
    if (!existsSync(path.join(root, requiredFile))) {
      failures.push(`BT-8003 implementation file is missing: ${requiredFile}`);
    }
  }

  const consumerTsconfigPath = `${betaPackageConsumerPath}/tsconfig.json`;
  const consumerTsconfig = readJson(root, consumerTsconfigPath);
  if (consumerTsconfig.compilerOptions?.paths) {
    failures.push(`${consumerTsconfigPath}: TypeScript path aliases are forbidden`);
  }
  const consumerSourceDirectory = path.join(root, betaPackageConsumerPath, "src");
  for (const sourceFile of readdirSync(consumerSourceDirectory, {
    recursive: true,
  })) {
    if (!/\.(?:ts|tsx|js|jsx|css)$/u.test(sourceFile.toString())) continue;
    const relativePath = path.posix.join(
      betaPackageConsumerPath,
      "src",
      sourceFile.toString().replaceAll("\\", "/"),
    );
    const source = readFileSync(path.join(root, relativePath), "utf8");
    if (
      /packages\/[^"']*\/src/iu.test(source) ||
      /\.\.\/\.\.\/packages/iu.test(source) ||
      /@vyrnforge\/[^"']*\/src/iu.test(source)
    ) {
      failures.push(`${relativePath}: consumer must use public package entry points`);
    }
  }

  const packageWorkflowPath = ".github/workflows/_packages.yml";
  const packageWorkflow = readFileSync(
    path.join(root, packageWorkflowPath),
    "utf8",
  );
  for (const expected of [
    "npm run verify:beta-package-artifacts",
    "test-results/beta-package-artifacts/",
    "beta-package-artifacts",
  ]) {
    if (!packageWorkflow.includes(expected)) {
      failures.push(`${packageWorkflowPath}: missing ${expected}`);
    }
  }

  return failures;
}
