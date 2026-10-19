import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyRepositoryValidationModel } from "./validation-model.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const report = verifyRepositoryValidationModel({ root, writeReport: true });

console.log(
  `Validation model verified: ${report.ciExecutions.length} root-script executions, no cycles, no duplicates.`,
);
