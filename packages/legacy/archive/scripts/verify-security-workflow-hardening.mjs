import { verifySecurityWorkflowContract } from "./security-workflow-hardening.mjs";

const failures = verifySecurityWorkflowContract();

if (failures.length) {
  console.error("Repository security and workflow verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Security workflow hardening contract passed.");
}

export { verifySecurityWorkflowContract };
