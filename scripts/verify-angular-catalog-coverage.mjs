import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ANGULAR_CATALOG_EXPECTED_SIZE,
  buildAngularCatalogArtifact,
} from "./angular-catalog-generation.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifact = buildAngularCatalogArtifact({ root });
const outputPath = path.join(root, artifact.path);

if (!existsSync(outputPath)) {
  throw new Error(`${artifact.path} is missing`);
}

const normalize = (value) => value.replace(/\r\n?/g, "\n");
const actual = normalize(readFileSync(outputPath, "utf8"));
const expected = normalize(artifact.content);
if (actual !== expected) {
  throw new Error(
    `${artifact.path} is stale; run npm run generate:framework-artifacts`,
  );
}

if (artifact.components.length + artifact.exceptions.length !== ANGULAR_CATALOG_EXPECTED_SIZE) {
  throw new Error(
    `Angular catalog coverage must account for ${ANGULAR_CATALOG_EXPECTED_SIZE} supported non-grid contracts`,
  );
}

const indexSource = readFileSync(
  path.join(root, "packages/ui-angular/src/index.ts"),
  "utf8",
);
if (!indexSource.includes("./generated/catalog.generated.js")) {
  throw new Error("Angular public entrypoint does not export the generated catalog");
}

const packageJson = JSON.parse(
  readFileSync(path.join(root, "packages/ui-angular/package.json"), "utf8"),
);
if (!packageJson.scripts?.test?.includes("verify-angular-catalog-coverage.mjs")) {
  throw new Error("Angular package test contract does not verify catalog coverage");
}

for (const component of artifact.components) {
  if (!actual.includes(`selector: \"${component.selector}\"`)) {
    throw new Error(`${component.id}: generated selector is missing`);
  }
  if (!actual.includes(`id: \"${component.id}\"`)) {
    throw new Error(`${component.id}: catalog metadata is missing`);
  }
}

console.log(
  `Angular catalog coverage verified: ${artifact.components.length} generated/specialized directives + ${artifact.exceptions.length} approved exceptions = ${ANGULAR_CATALOG_EXPECTED_SIZE} supported non-grid contracts.`,
);
