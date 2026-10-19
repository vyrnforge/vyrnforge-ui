import { verifyCompatibilityMatrixContract } from "./compatibility-release-matrix.mjs";

const failures = verifyCompatibilityMatrixContract();
if (failures.length) {
  console.error("Compatibility release matrix verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Compatibility release matrix contract passed.");
}

export { verifyCompatibilityMatrixContract };
