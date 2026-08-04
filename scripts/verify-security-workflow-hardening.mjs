import { verifySecurityWorkflowContract } from "./security-workflow-hardening.mjs";

const failures = verifySecurityWorkflowContract();
if (failures.length) {
  console.error("BT-8006 security and workflow hardening verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("BT-8006 security and workflow hardening contract passed.");
}

export { verifySecurityWorkflowContract };
