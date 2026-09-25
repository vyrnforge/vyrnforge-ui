import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
const checkOnly = process.argv.includes("--check");
const COMPONENT_CATALOG_PATH = "docs/metadata/components.json";

export const FRAMEWORK_API_REFERENCE_PATH =
  "docs/generated/framework-api-reference.json";

export function buildFrameworkApiReference({ root = repositoryRoot } = {}) {
  const contracts = loadCanonicalComponentContracts({ root });
  const exceptions = loadFrameworkExceptions({ root });
  const catalog = JSON.parse(
    readFileSync(path.join(root, COMPONENT_CATALOG_PATH), "utf8"),
  );
  const publicIds = new Set(
    (catalog.components ?? [])
      .filter((component) => component.publicExport === true)
      .map((component) => component.id),
  );
  const publicContracts = {
    ...contracts,
    components: contracts.components.filter((component) =>
      publicIds.has(component.id),
    ),
  };
  return createFrameworkApiReference(publicContracts, {
    exceptionPolicy: createFrameworkExceptionReference(exceptions),
  });
}

export function serializeFrameworkApiReference(reference) {
  return `${JSON.stringify(reference, null, 2)}\n`;
}

function normalizeLineEndings(value) {
  return value.replace(/\r\n?/g, "\n");
}

export function writeFrameworkApiReference({ root = repositoryRoot } = {}) {
  const outputPath = path.join(root, FRAMEWORK_API_REFERENCE_PATH);
  const reference = buildFrameworkApiReference({ root });
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serializeFrameworkApiReference(reference), "utf8");
  return reference;
}

export function verifyFrameworkApiReference({ root = repositoryRoot } = {}) {
  const outputPath = path.join(root, FRAMEWORK_API_REFERENCE_PATH);
  const reference = buildFrameworkApiReference({ root });
  if (!existsSync(outputPath)) {
    throw new Error(
      `${FRAMEWORK_API_REFERENCE_PATH} is missing; run npm run generate:framework-api-reference.`,
    );
  }
  if (
    normalizeLineEndings(readFileSync(outputPath, "utf8")) !==
    normalizeLineEndings(serializeFrameworkApiReference(reference))
  ) {
    throw new Error(
      `${FRAMEWORK_API_REFERENCE_PATH} is stale; run npm run generate:framework-api-reference.`,
    );
  }
  return reference;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const reference = checkOnly
    ? verifyFrameworkApiReference()
    : writeFrameworkApiReference();
  console.log(
    `${FRAMEWORK_API_REFERENCE_PATH} ${checkOnly ? "is current" : "generated"} for ${reference.surfaces.native.summary.componentCount} canonical components with ${reference.exceptionPolicy.records.length} framework exceptions.`,
  );
}
