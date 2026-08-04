import { fileURLToPath } from "node:url";

import { verifyBetaPackageContract } from "./beta-package-artifacts.mjs";

export { verifyBetaPackageContract } from "./beta-package-artifacts.mjs";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifyBetaPackageContract();
  if (failures.length) {
    console.error(failures.map((failure) => `- ${failure}`).join("\n"));
    process.exitCode = 1;
  } else {
    console.log(
      "BT-8003 contract passed: four beta packages have documented public entries, exact payload rules, offline-consumer evidence, and CI artifact integration.",
    );
  }
}
