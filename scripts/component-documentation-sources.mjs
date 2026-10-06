import {
  existsSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const COMPONENT_DOCUMENTATION_SCHEMA_VERSION = 1;
export const COMPONENT_DOCUMENTATION_SCHEMA_PATH =
  "docs/metadata/component-documentation.schema.json";
export const COMPONENT_DOCUMENTATION_SUFFIX = ".docs.json";

const supportedFrameworks = new Set([
  "native-html",
  "react",
  "angular",
  "vue",
]);

export class ComponentDocumentationSourceError extends Error {
  constructor(failures) {
    const orderedFailures = [...new Set(failures)].sort();
    super(
      `Owned component documentation validation failed:\n- ${orderedFailures.join("\n- ")}`,
    );
    this.name = "ComponentDocumentationSourceError";
    this.failures = orderedFailures;
  }
}

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function repositoryPath(value) {
  return value.replaceAll("\\", "/");
}

function walkDocumentationSources(root, relativeDirectory, results) {
  const absoluteDirectory = path.join(root, relativeDirectory);
  if (!existsSync(absoluteDirectory)) return;

  for (const entry of readdirSync(absoluteDirectory, { withFileTypes: true })) {
    if (["dist", "node_modules"].includes(entry.name)) continue;
    const relativePath = repositoryPath(
      path.join(relativeDirectory, entry.name),
    );
    if (entry.isDirectory()) {
      walkDocumentationSources(root, relativePath, results);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(COMPONENT_DOCUMENTATION_SUFFIX)) {
      results.push(relativePath);
    }
  }
}

function packageRecords(root) {
  const records = [];
  const packagesDirectory = path.join(root, "packages");
  for (const entry of readdirSync(packagesDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const packageJsonPath = `packages/${entry.name}/package.json`;
    if (!existsSync(path.join(root, packageJsonPath))) continue;
    const packageJson = readJson(root, packageJsonPath);
    records.push({
      directory: `packages/${entry.name}`,
      name: packageJson.name,
    });
  }
  return records;
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateStringArray(failures, sourcePath, field, value) {
  if (!Array.isArray(value) || value.some((entry) => !nonEmptyString(entry))) {
    failures.push(`${sourcePath}: ${field} must be an array of non-empty strings`);
    return;
  }
  if (new Set(value).size !== value.length) {
    failures.push(`${sourcePath}: ${field} must contain unique values`);
  }
}

function validateDocument(
  document,
  sourcePath,
  { root, packageByDirectory, componentIds, componentNames },
) {
  const failures = [];
  const packageDirectory = [...packageByDirectory.keys()].find(
    (candidate) =>
      sourcePath === candidate || sourcePath.startsWith(`${candidate}/`),
  );
  const packageName = packageDirectory
    ? packageByDirectory.get(packageDirectory)
    : null;

  if (document?.schemaVersion !== COMPONENT_DOCUMENTATION_SCHEMA_VERSION) {
    failures.push(
      `${sourcePath}: schemaVersion must be ${COMPONENT_DOCUMENTATION_SCHEMA_VERSION}`,
    );
  }
  if (
    !nonEmptyString(document?.$schema) ||
    !document.$schema.endsWith(COMPONENT_DOCUMENTATION_SCHEMA_PATH)
  ) {
    failures.push(
      `${sourcePath}: $schema must reference ${COMPONENT_DOCUMENTATION_SCHEMA_PATH}`,
    );
  }
  if (
    !nonEmptyString(document?.componentId) ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(document.componentId)
  ) {
    failures.push(`${sourcePath}: componentId must be stable kebab-case`);
  } else if (!componentIds.has(document.componentId)) {
    failures.push(
      `${sourcePath}: componentId ${document.componentId} is not in components.json`,
    );
  }

  if (!packageDirectory || !packageName) {
    failures.push(`${sourcePath}: source must live inside a VyrnForge package`);
  }
  if (document?.owner?.package !== packageName) {
    failures.push(
      `${sourcePath}: owner.package must match owning package ${packageName ?? "<unknown>"}`,
    );
  }
  if (
    !nonEmptyString(document?.owner?.source) ||
    !packageDirectory ||
    !document.owner.source.startsWith(`${packageDirectory}/`) ||
    !existsSync(path.join(root, document.owner.source))
  ) {
    failures.push(
      `${sourcePath}: owner.source must reference an existing source inside ${packageDirectory ?? "the owning package"}`,
    );
  }

  for (const [field, value] of [
    ["purpose", document?.purpose],
    ["guidance.useWhen", document?.guidance?.useWhen],
    ["guidance.avoidWhen", document?.guidance?.avoidWhen],
    ["guidance.aiUsageNotes", document?.guidance?.aiUsageNotes],
    ["accessibility.notes", document?.accessibility?.notes],
  ]) {
    if (!nonEmptyString(value)) {
      failures.push(`${sourcePath}: ${field} must be a non-empty string`);
    }
  }

  validateStringArray(
    failures,
    sourcePath,
    "limitations",
    document?.limitations,
  );
  validateStringArray(
    failures,
    sourcePath,
    "relatedComponents",
    document?.relatedComponents,
  );
  for (const related of document?.relatedComponents ?? []) {
    if (!componentIds.has(related) && !componentNames.has(related)) {
      failures.push(
        `${sourcePath}: relatedComponents references unknown component ${related}`,
      );
    }
  }

  validateStringArray(
    failures,
    sourcePath,
    "accessibility.evidenceRefs",
    document?.accessibility?.evidenceRefs,
  );
  for (const evidencePath of document?.accessibility?.evidenceRefs ?? []) {
    if (!existsSync(path.join(root, evidencePath))) {
      failures.push(
        `${sourcePath}: accessibility evidence does not exist: ${evidencePath}`,
      );
    }
  }

  validateStringArray(
    failures,
    sourcePath,
    "theming.classes",
    document?.theming?.classes,
  );
  validateStringArray(
    failures,
    sourcePath,
    "theming.variables",
    document?.theming?.variables,
  );

  if (!Array.isArray(document?.examples)) {
    failures.push(`${sourcePath}: examples must be an array`);
  } else {
    const exampleIds = new Set();
    for (const [index, example] of document.examples.entries()) {
      const prefix = `${sourcePath}: examples[${index}]`;
      for (const [field, value] of [
        ["id", example?.id],
        ["title", example?.title],
        ["intent", example?.intent],
      ]) {
        if (!nonEmptyString(value)) {
          failures.push(`${prefix}.${field} must be a non-empty string`);
        }
      }
      if (exampleIds.has(example?.id)) {
        failures.push(`${prefix}.id duplicates ${example.id}`);
      }
      exampleIds.add(example?.id);
      if (
        !Array.isArray(example?.frameworks) ||
        example.frameworks.length === 0 ||
        example.frameworks.some(
          (framework) => !supportedFrameworks.has(framework),
        )
      ) {
        failures.push(`${prefix}.frameworks must use first-class surfaces`);
      }
    }
  }

  if (!Array.isArray(document?.releaseNotes)) {
    failures.push(`${sourcePath}: releaseNotes must be an array`);
  } else {
    for (const [index, releaseNote] of document.releaseNotes.entries()) {
      const prefix = `${sourcePath}: releaseNotes[${index}]`;
      if (!nonEmptyString(releaseNote?.version)) {
        failures.push(`${prefix}.version must be a non-empty string`);
      }
      if (!nonEmptyString(releaseNote?.summary)) {
        failures.push(`${prefix}.summary must be a non-empty string`);
      }
      if (
        releaseNote?.migration !== undefined &&
        !nonEmptyString(releaseNote.migration)
      ) {
        failures.push(`${prefix}.migration must be a non-empty string`);
      }
    }
  }

  return failures;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

export function loadOwnedComponentDocumentation({
  root = repositoryRoot,
} = {}) {
  const catalog = readJson(root, "docs/metadata/components.json");
  const componentIds = new Set(
    (catalog.components ?? []).map((component) => component.id),
  );
  const componentNames = new Set(
    (catalog.components ?? []).map((component) => component.displayName),
  );
  const packageByDirectory = new Map(
    packageRecords(root).map((record) => [record.directory, record.name]),
  );
  const sourcePaths = [];
  walkDocumentationSources(root, "packages", sourcePaths);
  sourcePaths.sort();

  const failures = [];
  const documents = [];
  const seenComponentIds = new Set();
  for (const sourcePath of sourcePaths) {
    const document = readJson(root, sourcePath);
    failures.push(
      ...validateDocument(document, sourcePath, {
        root,
        packageByDirectory,
        componentIds,
        componentNames,
      }),
    );
    if (seenComponentIds.has(document.componentId)) {
      failures.push(
        `${sourcePath}: componentId ${document.componentId} already has an owned documentation source`,
      );
    }
    seenComponentIds.add(document.componentId);
    documents.push({ ...document, sourcePath });
  }

  if (failures.length > 0) {
    throw new ComponentDocumentationSourceError(failures);
  }

  const frozenDocuments = documents.map((document) => deepFreeze(document));
  return deepFreeze({
    schemaVersion: COMPONENT_DOCUMENTATION_SCHEMA_VERSION,
    schemaPath: COMPONENT_DOCUMENTATION_SCHEMA_PATH,
    sourcePaths,
    documents: frozenDocuments,
    documentByComponentId: Object.fromEntries(
      frozenDocuments.map((document) => [document.componentId, document]),
    ),
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const documentation = loadOwnedComponentDocumentation();
  console.log(
    `Owned component documentation passed schema v${documentation.schemaVersion}: ${documentation.documents.length} source(s) discovered.`,
  );
}
