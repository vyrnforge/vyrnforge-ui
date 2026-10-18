import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CANONICAL_COMPONENT_CONTRACT_PATH,
  CANONICAL_COMPONENT_CONTRACT_SCHEMA_VERSION,
  loadCanonicalComponentContracts,
} from "./canonical-component-contracts.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export function verifyCanonicalComponentContracts({
  root = repositoryRoot,
} = {}) {
  return loadCanonicalComponentContracts({ root });
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const contracts = verifyCanonicalComponentContracts();
  console.log(
    [
      `Canonical component contracts passed schema v${CANONICAL_COMPONENT_CONTRACT_SCHEMA_VERSION}.`,
      `${contracts.components.length} component contracts loaded from ${CANONICAL_COMPONENT_CONTRACT_PATH}.`,
      "Source ownership is explicitly canonical and normalized generator records are ready.",
    ].join(" "),
  );
}
