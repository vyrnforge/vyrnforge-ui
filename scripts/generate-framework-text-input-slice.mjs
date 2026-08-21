import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadCanonicalComponentContracts } from "./canonical-component-contracts.mjs";
import { createFrameworkGenerationModel } from "./framework-generation.mjs";
import {
  buildFrameworkTextInputArtifacts,
  createFrameworkTextInputSliceModel,
} from "./framework-text-input-generation.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const checkOnly = process.argv.includes("--check");

function normalizeLineEndings(value) {
  return value.replace(/\r\n?/g, "\n");
}

export function buildFrameworkTextInputSliceArtifacts({ root = repositoryRoot } = {}) {
  const contracts = loadCanonicalComponentContracts({ root });
  const generationModel = createFrameworkGenerationModel(contracts);
  const model = createFrameworkTextInputSliceModel(generationModel);
  return {
    model,
    artifacts: buildFrameworkTextInputArtifacts(model),
  };
}

export function writeFrameworkTextInputSliceArtifacts({ root = repositoryRoot } = {}) {
  const result = buildFrameworkTextInputSliceArtifacts({ root });
  for (const artifact of result.artifacts) {
    const outputPath = path.join(root, artifact.path);
    mkdirSync(path.dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, artifact.content, "utf8");
  }
  return result;
}

export function verifyFrameworkTextInputSliceArtifacts({ root = repositoryRoot } = {}) {
  const result = buildFrameworkTextInputSliceArtifacts({ root });
  const failures = [];
  for (const artifact of result.artifacts) {
    const outputPath = path.join(root, artifact.path);
    if (!existsSync(outputPath)) {
      failures.push(`${artifact.path} is missing`);
      continue;
    }
    if (
      normalizeLineEndings(readFileSync(outputPath, "utf8")) !==
      normalizeLineEndings(artifact.content)
    ) {
      failures.push(`${artifact.path} is stale`);
    }
  }
  if (failures.length > 0) {
    throw new Error(
      `TextInput framework slice is stale; run npm run generate:framework-artifacts.\n${failures
        .map((failure) => `- ${failure}`)
        .join("\n")}`,
    );
  }
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = checkOnly
    ? verifyFrameworkTextInputSliceArtifacts()
    : writeFrameworkTextInputSliceArtifacts();
  console.log(
    `TextInput framework slice ${checkOnly ? "is current" : "generated"} across ${Object.keys(result.model.surfaces).length} surfaces (${result.artifacts.length} artifacts).`,
  );
}
