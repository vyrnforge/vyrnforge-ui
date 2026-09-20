import { verifyDeveloperDeliveryFoundation } from "./developer-delivery-foundation.mjs";
import { verifySecurityWorkflowContract } from "./security-workflow-hardening.mjs";

const failures = [
  ...verifySecurityWorkflowContract(),
  ...verifyDeveloperDeliveryFoundation(),
].sort();

if (failures.length) {
  console.error(
    "Repository workflow and delivery-foundation verification failed:",
  );
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    "Security workflow hardening and G17 delivery-foundation contracts passed.",
  );
}

export { verifyDeveloperDeliveryFoundation, verifySecurityWorkflowContract };
