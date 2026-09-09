import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  collectSizeMeasurements,
  evaluateSizeBudgets,
  readSizeBudgetManifest,
  repositoryRoot,
  sizeBudgetReportPath,
  verifySizeBudgetContract,
} from "./beta-package-size-budgets.mjs";

const startedAt = new Date().toISOString();
let status = "failed";
let failures = [];
let measurements = [];

try {
  failures.push(...verifySizeBudgetContract());
  if (!failures.length) {
    const manifest = readSizeBudgetManifest();
    measurements = collectSizeMeasurements();
    const evaluation = evaluateSizeBudgets({ manifest, measurements });
    failures.push(...evaluation.failures);
  }
  status = failures.length ? "failed" : "passed";
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
}

const reportPath = path.join(repositoryRoot, sizeBudgetReportPath);
mkdirSync(path.dirname(reportPath), { recursive: true });
writeFileSync(
  reportPath,
  `${JSON.stringify(
    {
      schemaVersion: 1,
      releaseGroup: "non-grid-beta",
      budgetSource: "docs/metadata/release-groups.json",
      status,
      startedAt,
      completedAt: new Date().toISOString(),
      measurements,
      failures,
    },
    null,
    2,
  )}\n`,
);

if (failures.length) {
  console.error("Non-grid beta package size budget verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Non-grid beta package size budgets passed for ${measurements.length} packages using canonical release-group limits.`,
  );
}
