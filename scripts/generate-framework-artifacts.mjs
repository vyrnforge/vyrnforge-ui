import { fileURLToPath } from "node:url";

import { writeGeneratedFrameworkArtifacts } from "./generated-framework-artifacts.mjs";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const artifacts = writeGeneratedFrameworkArtifacts();
  console.log(
    `Generated ${artifacts.length} framework artifacts deterministically.`,
  );
}
