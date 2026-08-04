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
let waiverResults = [];

try {
  failures.push(...verifySizeBudgetContract());
  if (!failures.length) {
    const manifest = readSizeBudgetManifest();
    measurements = collectSizeMeasurements();
    const evaluation = evaluateSizeBudgets({ manifest, measurements });
    failures.push(...evaluation.failures);
    waiverResults = evaluation.waiverResults;
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
      task: "BT-8004",
      status,
      startedAt,
      completedAt: new Date().toISOString(),
      measurements,
      waiverResults,
      failures,
    },
    null,
    2,
  )}\n`,
);

if (failures.length) {
  console.error("BT-8004 package size budget verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `BT-8004 package size budgets passed for ${measurements.length} beta packages.`,
  );
}
