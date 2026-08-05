import { writeFileSync } from "node:fs";
import path from "node:path";

import { format } from "prettier";

import {
  betaPackageContractPath,
  buildBetaPackageContract,
  repositoryRoot,
} from "./beta-package-artifacts.mjs";

const output = path.join(repositoryRoot, betaPackageContractPath);
const content = await format(
  `${JSON.stringify(buildBetaPackageContract(), null, 2)}\n`,
  { filepath: output },
);
writeFileSync(output, content);
console.log(`Generated ${path.relative(repositoryRoot, output)}.`);
