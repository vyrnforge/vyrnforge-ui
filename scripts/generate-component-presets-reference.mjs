import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadCanonicalComponentContracts } from "./canonical-component-contracts.mjs";
import {
  createComponentPresetReference,
  loadComponentPresets,
} from "./component-presets.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const checkOnly = process.argv.includes("--check");

export const COMPONENT_PRESET_REFERENCE_PATH =
  "docs/generated/component-presets-reference.json";

export function buildComponentPresetReference({ root = repositoryRoot } = {}) {
  const contracts = loadCanonicalComponentContracts({ root });
  const presets = loadComponentPresets({ root, contracts });
  return {
    generated: {
      editable: false,
      generator: "scripts/generate-component-presets-reference.mjs",
      command: "npm run generate:component-presets-reference",
      sources: [
        "docs/metadata/component-contracts.json",
        "docs/metadata/component-presets.json",
      ],
      task: "SC-2102",
    },
    ...createComponentPresetReference(presets),
  };
}

export function serializeComponentPresetReference(reference) {
  return `${JSON.stringify(reference, null, 2)}\n`;
}

function normalizeLineEndings(value) {
  return value.replace(/\r\n?/g, "\n");
}

export function writeComponentPresetReference({ root = repositoryRoot } = {}) {
  const outputPath = path.join(root, COMPONENT_PRESET_REFERENCE_PATH);
  const reference = buildComponentPresetReference({ root });
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serializeComponentPresetReference(reference), "utf8");
  return reference;
}

export function verifyComponentPresetReference({ root = repositoryRoot } = {}) {
  const outputPath = path.join(root, COMPONENT_PRESET_REFERENCE_PATH);
  const reference = buildComponentPresetReference({ root });
  if (!existsSync(outputPath)) {
    throw new Error(
      `${COMPONENT_PRESET_REFERENCE_PATH} is missing; run npm run generate:component-presets-reference.`,
    );
  }
  if (
    normalizeLineEndings(readFileSync(outputPath, "utf8")) !==
    normalizeLineEndings(serializeComponentPresetReference(reference))
  ) {
    throw new Error(
      `${COMPONENT_PRESET_REFERENCE_PATH} is stale; run npm run generate:component-presets-reference.`,
    );
  }
  return reference;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const reference = checkOnly
    ? verifyComponentPresetReference()
    : writeComponentPresetReference();
  console.log(
    `${COMPONENT_PRESET_REFERENCE_PATH} ${checkOnly ? "is current" : "generated"} for ${reference.records.length} component presets.`,
  );
}
