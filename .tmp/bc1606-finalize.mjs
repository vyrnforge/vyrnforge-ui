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
const betaStart = '\nif (releaseGroupId === "non-grid-beta") {';
const betaIndex = prepare.indexOf(betaStart);
if (betaIndex !== -1) {
  const consoleIndex = prepare.indexOf("\nconsole.log(\n", betaIndex);
  if (consoleIndex === -1) throw new Error("prepare release artifact console anchor missing");
  prepare = prepare.slice(0, betaIndex) + prepare.slice(consoleIndex);
}
write(preparePath, prepare);

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
