import fs from "node:fs";

const read = (p) => fs.readFileSync(p, "utf8");
const write = (p, v) => fs.writeFileSync(p, v);

const packagePath = "package.json";
const pkg = JSON.parse(read(packagePath));
for (const name of [
  "generate:beta-package-contract",
  "verify:beta-package-contract",
  "test:beta-package-contract",
  "verify:beta-package-artifacts",
  "verify:beta-package-size-budget-contract",
  "verify:beta-package-size-budgets",
  "test:beta-package-size-budgets",
]) delete pkg.scripts[name];
pkg.scripts["test:contracts"] = pkg.scripts["test:contracts"]
  .replace(" && npm run test:beta-package-contract", "")
  .replace(" && npm run test:beta-package-size-budgets", "");
pkg.scripts["verify:metadata"] = pkg.scripts["verify:metadata"]
  .replace(" && npm run verify:beta-package-contract", "")
  .replace(" && npm run verify:beta-package-size-budget-contract", "");
write(packagePath, JSON.stringify(pkg, null, 2) + "\n");

const validationPath = "scripts/validation-model.mjs";
let validation = read(validationPath);
for (const line of [
  '  "test:beta-package-contract",\n',
  '  "test:beta-package-size-budgets",\n',
  '  "verify:beta-package-contract",\n',
  '  "verify:beta-package-size-budget-contract",\n',
]) validation = validation.replace(line, "");
write(validationPath, validation);

const preparePath = "scripts/prepare-release-artifact.mjs";
let prepare = read(preparePath);
prepare = prepare.replace("import { mkdirSync, rmSync, writeFileSync } from \"node:fs\";", "import { mkdirSync, rmSync, writeFileSync } from \"node:fs\";");
const betaStart = '\nif (releaseGroupId === "non-grid-beta") {';
const betaIndex = prepare.indexOf(betaStart);
if (betaIndex !== -1) {
  const consoleIndex = prepare.indexOf("\nconsole.log(\n", betaIndex);
  if (consoleIndex === -1) throw new Error("prepare release artifact console anchor missing");
  prepare = prepare.slice(0, betaIndex) + prepare.slice(consoleIndex);
}
write(preparePath, prepare);

const ciPath = ".github/workflows/ci.yml";
let ci = read(ciPath);
const oldBlock = `          if [[ "$RUN_PACKAGES" == "true" ]]; then\n            npm run verify:beta-package-artifacts\n            npm run build --workspace @vyrnforge/ui-data-grid\n            VYRNFORGE_PACKAGES_PREPARED=true npm run verify:packages\n            npm run verify:beta-package-size-budgets\n            test -f test-results/beta-package-artifacts/size-report.json`;
const newBlock = `          if [[ "$RUN_PACKAGES" == "true" ]]; then\n            RELEASE_GROUP=non-grid-beta\n            RELEASE_VERSION=0.2.0-beta.2\n            RELEASE_TAG=beta\n            npm run prepare:release-artifact -- --release-group "$RELEASE_GROUP" --version "$RELEASE_VERSION" --dist-tag "$RELEASE_TAG" --source-commit "$GITHUB_SHA" --ci-run-id "$GITHUB_RUN_ID"\n            npm run verify:release-artifact -- --release-group "$RELEASE_GROUP" --version "$RELEASE_VERSION" --dist-tag "$RELEASE_TAG" --source-commit "$GITHUB_SHA" --ci-run-id "$GITHUB_RUN_ID" --artifact-dir test-results/release-artifact\n            npm run verify:trusted-publishing-dry-run -- --release-group "$RELEASE_GROUP" --version "$RELEASE_VERSION" --dist-tag "$RELEASE_TAG" --artifact-dir test-results/release-artifact\n            npm run verify:release-size-budgets -- --release-group "$RELEASE_GROUP" --artifact-dir test-results/release-artifact\n            npm run build --workspace @vyrnforge/ui-data-grid\n            VYRNFORGE_PACKAGES_PREPARED=true npm run verify:packages\n            test -f test-results/release-artifact/manifest.json`;
if (!ci.includes(oldBlock)) throw new Error("CI beta artifact block anchor missing");
ci = ci.replace(oldBlock, newBlock);
ci = ci.replace("      - name: Upload beta package artifact reports", "      - name: Upload generic release artifact reports");
ci = ci.replace("          name: beta-package-artifacts", "          name: release-artifact-ci");
ci = ci.replace("          path: test-results/beta-package-artifacts/", "          path: test-results/release-artifact/");
write(ciPath, ci);

for (const file of [
  "scripts/beta-package-artifacts.mjs",
  "scripts/generate-beta-package-contract.mjs",
  "scripts/verify-beta-package-artifacts.mjs",
  "scripts/verify-beta-package-contract.mjs",
  "scripts/verify-beta-package-contract.test.mjs",
  "scripts/verify-beta-package-size-budget-contract.mjs",
  "scripts/verify-beta-package-size-budgets.mjs",
  "scripts/verify-beta-package-size-budgets.test.mjs",
  "docs/metadata/beta-package-artifacts.json",
  "docs/metadata/beta-package-size-budgets.json",
  "docs/release/beta-package-artifact-verification.md",
]) fs.rmSync(file, { force: true });
fs.rmSync("tests/beta-package-consumer", { recursive: true, force: true });
