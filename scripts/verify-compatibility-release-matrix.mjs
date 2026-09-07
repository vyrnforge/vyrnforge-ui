import { verifyAngularSupportEvidence } from "./angular-support-evidence.mjs";
import { verifyCompatibilityMatrixContract } from "./compatibility-release-matrix.mjs";

const failures = [
  ...verifyCompatibilityMatrixContract(),
  ...verifyAngularSupportEvidence(),
].sort();
if (failures.length) {
  console.error(
    "Compatibility and Angular support evidence verification failed:",
  );
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    "Compatibility release matrix and Angular support evidence contracts passed.",
  );
}

export { verifyAngularSupportEvidence, verifyCompatibilityMatrixContract };
