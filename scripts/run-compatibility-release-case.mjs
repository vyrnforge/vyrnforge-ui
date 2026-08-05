import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  applyDependencyOverrides,
  compatibilityReportDirectory,
  readCompatibilityMatrix,
  repositoryRoot,
  verifyCompatibilityMatrixContract,
} from "./compatibility-release-matrix.mjs";

const caseIndex = process.argv.indexOf("--case");
const caseId = caseIndex >= 0 ? process.argv[caseIndex + 1] : null;
if (!caseId) throw new Error("BT-8005 requires --case <case-id>");

const contractFailures = verifyCompatibilityMatrixContract();
if (contractFailures.length) throw new Error(contractFailures.join("\n"));

const matrix = readCompatibilityMatrix();
const testCase = matrix.cases.find((candidate) => candidate.id === caseId);
if (!testCase) throw new Error(`Unknown compatibility case ${caseId}`);

const fixtureDirectory = path.join(
  repositoryRoot,
  "tests/consumers",
  testCase.fixture,
);
const packagePath = path.join(fixtureDirectory, "package.json");
const originalPackageText = readFileSync(packagePath, "utf8");
const startedAt = new Date().toISOString();
let status = "failed";
let errorMessage = null;

try {
  const packageJson = JSON.parse(originalPackageText);
  const overridden = applyDependencyOverrides(packageJson, testCase.overrides);
  writeFileSync(packagePath, `${JSON.stringify(overridden, null, 2)}\n`);

  execFileSync(
    process.execPath,
    [
      path.join(
        repositoryRoot,
        "scripts/verify-consumer-foundations-runtime.mjs",
      ),
      "--fixture",
      testCase.fixture,
    ],
    {
      cwd: repositoryRoot,
      stdio: "inherit",
      env: {
        ...process.env,
        VYRNFORGE_BROWSER: testCase.browser,
        npm_config_engine_strict: "false",
      },
    },
  );
  status = "passed";
} catch (error) {
  errorMessage = error instanceof Error ? error.message : String(error);
  process.exitCode = 1;
} finally {
  writeFileSync(packagePath, originalPackageText);
  const reportDirectory = path.join(
    repositoryRoot,
    compatibilityReportDirectory,
  );
  mkdirSync(reportDirectory, { recursive: true });
  writeFileSync(
    path.join(reportDirectory, `${testCase.id}.json`),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        task: "BT-8005",
        case: testCase,
        status,
        startedAt,
        completedAt: new Date().toISOString(),
        checks: {
          cleanInstall: status,
          packageTarballs: status,
          typecheck: status,
          productionBuild: status,
          browserSmoke: status,
        },
        ...(errorMessage ? { error: errorMessage } : {}),
      },
      null,
      2,
    )}\n`,
  );
}

if (status === "passed") {
  console.log(`BT-8005 compatibility case ${testCase.id} passed.`);
} else {
  console.error(`BT-8005 compatibility case ${testCase.id} failed.`);
}
