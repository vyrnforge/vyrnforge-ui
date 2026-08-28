import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildAngularCatalogArtifact } from "./angular-catalog-generation.mjs";
import { buildFrameworkButtonSliceArtifacts } from "./generate-framework-button-slice.mjs";
import { buildFrameworkDialogSliceArtifacts } from "./generate-framework-dialog-slice.mjs";
import { buildFrameworkTabsSliceArtifacts } from "./generate-framework-tabs-slice.mjs";
import { buildFrameworkTextInputSliceArtifacts } from "./generate-framework-text-input-slice.mjs";
import {
  FRAMEWORK_API_REFERENCE_PATH,
  buildFrameworkApiReference,
  serializeFrameworkApiReference,
} from "./generate-framework-api-reference.mjs";
import {
  buildNativeElementArtifacts,
  serializeCustomElementsManifest,
} from "./generate-ui-elements-manifest.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const GENERATED_FRAMEWORK_ARTIFACT_TASK = "MFD-1111";

export class GeneratedFrameworkArtifactsError extends Error {
  constructor(failures) {
    super(
      `Generated framework artifacts are stale. Regenerate with npm run generate:framework-artifacts.\n${failures
        .map((failure) => `- ${failure}`)
        .join("\n")}`,
    );
    this.name = "GeneratedFrameworkArtifactsError";
    this.failures = Object.freeze([...failures]);
  }
}

export function normalizeGeneratedText(value) {
  return value.replace(/\r\n?/g, "\n");
}

export function generatedTextIsCurrent(actual, expected) {
  return normalizeGeneratedText(actual) === normalizeGeneratedText(expected);
}

function freezeArtifact(record) {
  return Object.freeze({
    ...record,
    sourceRecords: Object.freeze([...record.sourceRecords]),
  });
}

function registerSliceArtifacts(artifacts, generator, command) {
  return artifacts.map((artifact) =>
    freezeArtifact({
      path: artifact.path,
      generator,
      command,
      sourceRecords: artifact.sourceRecords,
      content: artifact.content,
    }),
  );
}

function registerAngularPackageSliceArtifact(artifacts, componentId, targetPath) {
  const angularArtifact = artifacts.find(
    (artifact) => artifact.framework === "angular",
  );
  if (!angularArtifact) {
    throw new Error(`${componentId}: missing Angular slice artifact`);
  }
  return freezeArtifact({
    path: targetPath,
    generator: `scripts/generate-framework-${componentId}-slice.mjs`,
    command: "npm run generate:framework-artifacts",
    sourceRecords: angularArtifact.sourceRecords,
    content: angularArtifact.content,
  });
}

export function buildGeneratedFrameworkArtifacts({
  root = repositoryRoot,
} = {}) {
  const native = buildNativeElementArtifacts({ root });
  const apiReference = buildFrameworkApiReference({ root });
  const button = buildFrameworkButtonSliceArtifacts({ root });
  const textInput = buildFrameworkTextInputSliceArtifacts({ root });
  const tabs = buildFrameworkTabsSliceArtifacts({ root });
  const dialog = buildFrameworkDialogSliceArtifacts({ root });
  const angularCatalog = buildAngularCatalogArtifact({ root });

  return Object.freeze([
    freezeArtifact({
      path: "packages/ui-elements/custom-elements.json",
      generator: "scripts/generate-ui-elements-manifest.mjs",
      command: "npm run generate:custom-elements",
      sourceRecords: [
        "component:*",
        "native-registration:*",
        "framework-exception:native:*",
      ],
      content: serializeCustomElementsManifest(native.manifest),
    }),
    freezeArtifact({
      path: "packages/ui-elements/src/custom-elements.ts",
      generator: "scripts/generate-ui-elements-manifest.mjs",
      command: "npm run generate:custom-elements",
      sourceRecords: [
        "component:*",
        "native-registration:*",
        "framework-exception:native:*",
      ],
      content: native.declarations,
    }),
    freezeArtifact({
      path: FRAMEWORK_API_REFERENCE_PATH,
      generator: "scripts/generate-framework-api-reference.mjs",
      command: "npm run generate:framework-api-reference",
      sourceRecords: ["component:*", "framework-exception:*"],
      content: serializeFrameworkApiReference(apiReference),
    }),
    ...registerSliceArtifacts(
      button.artifacts,
      "scripts/generate-framework-button-slice.mjs",
      "npm run generate:framework-button-slice",
    ),
    ...registerSliceArtifacts(
      textInput.artifacts,
      "scripts/generate-framework-text-input-slice.mjs",
      "npm run generate:framework-artifacts",
    ),
    ...registerSliceArtifacts(
      tabs.artifacts,
      "scripts/generate-framework-tabs-slice.mjs",
      "npm run generate:framework-artifacts",
    ),
    ...registerSliceArtifacts(
      dialog.artifacts,
      "scripts/generate-framework-dialog-slice.mjs",
      "npm run generate:framework-artifacts",
    ),
    registerAngularPackageSliceArtifact(
      button.artifacts,
      "button",
      "packages/ui-angular/src/generated/vf-button.generated.ts",
    ),
    registerAngularPackageSliceArtifact(
      textInput.artifacts,
      "text-input",
      "packages/ui-angular/src/generated/vf-text-input.generated.ts",
    ),
    registerAngularPackageSliceArtifact(
      tabs.artifacts,
      "tabs",
      "packages/ui-angular/src/generated/vf-tabs.generated.ts",
    ),
    registerAngularPackageSliceArtifact(
      dialog.artifacts,
      "dialog",
      "packages/ui-angular/src/generated/vf-dialog.generated.ts",
    ),
    freezeArtifact({
      path: angularCatalog.path,
      generator: "scripts/angular-catalog-generation.mjs",
      command: "npm run generate:framework-artifacts",
      sourceRecords: angularCatalog.sourceRecords,
      content: angularCatalog.content,
    }),
  ]);
}

export function findStaleGeneratedFrameworkArtifacts(
  artifacts,
  { root = repositoryRoot } = {},
) {
  const failures = [];
  for (const artifact of artifacts) {
    const outputPath = path.join(root, artifact.path);
    if (!existsSync(outputPath)) {
      failures.push(
        `${artifact.path}: missing (sources: ${artifact.sourceRecords.join(", ")})`,
      );
      continue;
    }
    const actual = readFileSync(outputPath, "utf8");
    if (!generatedTextIsCurrent(actual, artifact.content)) {
      failures.push(
        `${artifact.path}: stale (sources: ${artifact.sourceRecords.join(", ")})`,
      );
    }
  }
  return failures.sort();
}

export function writeGeneratedFrameworkArtifacts({
  root = repositoryRoot,
} = {}) {
  const artifacts = buildGeneratedFrameworkArtifacts({ root });
  for (const artifact of artifacts) {
    const outputPath = path.join(root, artifact.path);
    mkdirSync(path.dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, artifact.content, "utf8");
  }
  return artifacts;
}

export function verifyGeneratedFrameworkArtifacts({
  root = repositoryRoot,
} = {}) {
  const artifacts = buildGeneratedFrameworkArtifacts({ root });
  const failures = findStaleGeneratedFrameworkArtifacts(artifacts, { root });
  if (failures.length > 0) throw new GeneratedFrameworkArtifactsError(failures);
  return artifacts;
}
