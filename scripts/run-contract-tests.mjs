import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const contractTestFiles = [
  "scripts/canonical-component-contracts.test.mjs",
  "scripts/framework-generation.test.mjs",
  "scripts/detect-ci-scope.test.mjs",
  "scripts/verify-package-boundaries.test.mjs",
  "scripts/verify-component-metadata.test.mjs",
  "scripts/verify-framework-exceptions.test.mjs",
  "scripts/verify-react-behavior-adoption.test.mjs",
  "scripts/verify-beta-scope.test.mjs",
  "scripts/verify-release-groups.test.mjs",
  "scripts/release-size-budgets.test.mjs",
  "scripts/verify-compatibility-release-matrix.test.mjs",
  "scripts/verify-security-workflow-hardening.test.mjs",
  "scripts/verify-trusted-publishing-provenance.test.mjs",
  "scripts/verify-trusted-publishing-dry-run.test.mjs",
  "scripts/release-artifact.test.mjs",
  "scripts/release-dry-run.test.mjs",
  "scripts/verify-multi-framework-architecture.test.mjs",
  "scripts/verify-component-maturity.test.mjs",
  "scripts/verify-design-token-contract.test.mjs",
  "scripts/verify-semantic-token-adoption.test.mjs",
  "scripts/verify-visual-regression-contract.test.mjs",
  "scripts/verify-consumer-foundations.test.mjs",
  "scripts/verify-component-reference.test.mjs",
  "scripts/verify-maturity-closure.test.mjs",
  "scripts/verify-assistive-technology-evidence.test.mjs",
  "scripts/verify-repository-templates.test.mjs",
  "scripts/verify-documentation-current.test.mjs",
  "scripts/validation-model.test.mjs",
  "scripts/generated-framework-artifacts.test.mjs",
];

export function runContractTests() {
  const result = spawnSync(
    process.execPath,
    ["--test", "--test-concurrency=1", ...contractTestFiles],
    { cwd: root, stdio: "inherit" },
  );

  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) runContractTests();
