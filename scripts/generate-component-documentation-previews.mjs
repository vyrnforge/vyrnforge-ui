import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadOwnedComponentDocumentation } from "./component-documentation-sources.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outputPath = "docs/generated/component-documentation-previews.json";

function fail(message) {
  throw new Error(`Owned component preview validation failed: ${message}`);
}

function validateProps(props, sourcePath, exampleId, itemIndex) {
  if (props === undefined) return;
  if (!props || Array.isArray(props) || typeof props !== "object") {
    fail(`${sourcePath} example ${exampleId} item ${itemIndex} props must be an object`);
  }
  for (const [name, value] of Object.entries(props)) {
    if (!name.trim()) {
      fail(`${sourcePath} example ${exampleId} item ${itemIndex} has an empty prop name`);
    }
    if (!["string", "number", "boolean"].includes(typeof value)) {
      fail(
        `${sourcePath} example ${exampleId} item ${itemIndex} prop ${name} must be a string, number, or boolean`,
      );
    }
  }
}

function normalizePreview(example, sourcePath) {
  const preview = example.preview;
  if (preview === undefined) return null;
  if (!preview || Array.isArray(preview) || typeof preview !== "object") {
    fail(`${sourcePath} example ${example.id} preview must be an object`);
  }
  if (!["inline", "stack"].includes(preview.layout)) {
    fail(`${sourcePath} example ${example.id} preview.layout must be inline or stack`);
  }
  if (!Array.isArray(preview.items) || preview.items.length === 0) {
    fail(`${sourcePath} example ${example.id} preview.items must not be empty`);
  }

  return {
    layout: preview.layout,
    items: preview.items.map((item, itemIndex) => {
      if (!item || Array.isArray(item) || typeof item !== "object") {
        fail(`${sourcePath} example ${example.id} item ${itemIndex} must be an object`);
      }
      if (typeof item.text !== "string" || item.text.trim().length === 0) {
        fail(
          `${sourcePath} example ${example.id} item ${itemIndex} text must be a non-empty string`,
        );
      }
      validateProps(item.props, sourcePath, example.id, itemIndex);
      return {
        text: item.text,
        ...(item.props ? { props: item.props } : {}),
      };
    }),
  };
}

export function buildComponentDocumentationPreviewProjection({
  root = repositoryRoot,
} = {}) {
  const documentation = loadOwnedComponentDocumentation({ root });
  const components = documentation.documents
    .map((document) => {
      const examples = document.examples.map((example) => ({
        id: example.id,
        title: example.title,
        intent: example.intent,
        frameworks: example.frameworks,
        preview: normalizePreview(example, document.sourcePath),
      }));
      if (!examples.some((example) => example.preview !== null)) return null;
      return {
        componentId: document.componentId,
        sourcePath: document.sourcePath,
        examples,
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.componentId.localeCompare(right.componentId));

  return {
    schemaVersion: 1,
    generatedFrom: documentation.sourcePaths,
    components,
  };
}

export function serializeComponentDocumentationPreviewProjection(options) {
  return `${JSON.stringify(buildComponentDocumentationPreviewProjection(options), null, 2)}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const expected = serializeComponentDocumentationPreviewProjection();
  const absoluteOutputPath = path.join(repositoryRoot, outputPath);
  if (process.argv.includes("--check")) {
    const actual = readFileSync(absoluteOutputPath, "utf8");
    if (actual !== expected) {
      console.error(
        `${outputPath} is stale. Run node scripts/generate-component-documentation-previews.mjs.`,
      );
      process.exitCode = 1;
    } else {
      console.log("Owned component documentation preview projection is current.");
    }
  } else {
    writeFileSync(absoluteOutputPath, expected);
    console.log(`Generated ${outputPath}.`);
  }
}
