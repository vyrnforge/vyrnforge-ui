import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadCanonicalComponentContracts } from "./canonical-component-contracts.mjs";
import {
  createFrameworkExceptionReference,
  loadFrameworkExceptions,
} from "./framework-exceptions.mjs";
import { createFrameworkApiReference } from "./framework-generation.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const FRAMEWORK_API_REFERENCE_PATH =
  "docs/generated/framework-api-reference.json";

export function buildFrameworkApiReference({ root = repositoryRoot } = {}) {
  const contracts = loadCanonicalComponentContracts({ root });
  const exceptions = loadFrameworkExceptions({ root });
  return createFrameworkApiReference(contracts, {
    exceptionPolicy: createFrameworkExceptionReference(exceptions),
  });
}

export function serializeFrameworkApiReference(reference) {
  return `${JSON.stringify(reference, null, 2)}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const outputPath = path.join(repositoryRoot, FRAMEWORK_API_REFERENCE_PATH);
  mkdirSync(path.dirname(outputPath), { recursive: true });
  const reference = buildFrameworkApiReference();
  writeFileSync(outputPath, serializeFrameworkApiReference(reference), "utf8");
  console.log(
    `Generated ${FRAMEWORK_API_REFERENCE_PATH} for ${reference.surfaces.native.summary.componentCount} canonical components with ${reference.exceptionPolicy.records.length} framework exceptions.`,
  );
}
