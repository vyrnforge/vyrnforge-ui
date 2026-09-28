import { verifyDeveloperDeliveryFoundation } from "./developer-delivery-foundation.mjs";

const failures = verifyDeveloperDeliveryFoundation();
if (failures.length) {
  console.error("G17 developer delivery foundation verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("G17 developer delivery foundation contract passed.");
}

export { verifyDeveloperDeliveryFoundation };
