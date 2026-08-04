import { verifySizeBudgetContract } from "./beta-package-size-budgets.mjs";

const failures = verifySizeBudgetContract();
if (failures.length) {
  console.error("BT-8004 package size budget contract verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("BT-8004 package size budget contract passed.");
}

export { verifySizeBudgetContract };
