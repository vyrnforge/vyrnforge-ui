import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadCanonicalComponentContracts } from "./canonical-component-contracts.mjs";
import { createFrameworkGenerationModel } from "./framework-generation.mjs";
import {
  buildFrameworkTabsArtifacts,
  createFrameworkTabsSliceModel,
} from "./framework-tabs-generation.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const checkOnly = process.argv.includes("--check");

function normalizeLineEndings(value) {
  return value.replace(/\r\n?/g, "\n");
}

export function buildFrameworkTabsSliceArtifacts({
  root = repositoryRoot,
} = {}) {
  const contracts = loadCanonicalComponentContracts({ root });
  const generationModel = createFrameworkGenerationModel(contracts);
  const model = createFrameworkTabsSliceModel(generationModel);
  return {
    model,
    artifacts: buildFrameworkTabsArtifacts(model),
  };
}

export function writeFrameworkTabsSliceArtifacts({
  root = repositoryRoot,
} = {}) {
  const result = buildFrameworkTabsSliceArtifacts({ root });
  for (const artifact of result.artifacts) {
    const outputPath = path.join(root, artifact.path);
    mkdirSync(path.dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, artifact.content, "utf8");
  }
  return result;
}

export function verifyFrameworkTabsSliceArtifacts({
  root = repositoryRoot,
} = {}) {
  const result = buildFrameworkTabsSliceArtifacts({ root });
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
      `Tabs framework slice is stale; run npm run generate:framework-artifacts.\n${failures
        .map((failure) => `- ${failure}`)
        .join("\n")}`,
    );
  }
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = checkOnly
    ? verifyFrameworkTabsSliceArtifacts()
    : writeFrameworkTabsSliceArtifacts();
  console.log(
    `Tabs framework slice ${checkOnly ? "is current" : "generated"} across ${Object.keys(result.model.surfaces).length} surfaces (${result.artifacts.length} artifacts).`,
  );
}
