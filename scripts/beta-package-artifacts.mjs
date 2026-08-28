import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const betaPackageManifestPath = "docs/metadata/beta-package-artifacts.json";
export const betaPackageConsumerPath = "tests/fixtures/beta-package-consumer";

export function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

export function verifyBetaPackageContract({ root = repositoryRoot } = {}) {
  const failures = [];
  const manifest = readJson(root, betaPackageManifestPath);

  if (manifest.schemaVersion !== 1) {
    failures.push(`${betaPackageManifestPath}: schemaVersion must be 1`);
  }
  if (manifest.task?.id !== "BT-8003") {
    failures.push(`${betaPackageManifestPath}: task id must be BT-8003`);
  }
  if (manifest.task?.status !== "done") {
    failures.push(`${betaPackageManifestPath}: BT-8003 must be marked done`);
  }

  const requiredFiles = [
    betaPackageManifestPath,
    "scripts/beta-package-artifacts.mjs",
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

  const packageWorkflowPath = ".github/workflows/ci.yml";
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
