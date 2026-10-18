import { fileURLToPath } from "node:url";

import {
  GeneratedFrameworkArtifactsError,
  verifyGeneratedFrameworkArtifacts,
} from "./generated-framework-artifacts.mjs";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const artifacts = verifyGeneratedFrameworkArtifacts();
    console.log(
      `Generated framework artifact verification passed for ${artifacts.length} artifacts.`,
    );
  } catch (error) {
    if (error instanceof GeneratedFrameworkArtifactsError) {
      console.error(error.message);
      process.exitCode = 1;
    } else {
      throw error;
    }
  }
}
