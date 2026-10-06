import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  COMPONENT_DOCUMENTATION_SCHEMA_PATH,
  COMPONENT_DOCUMENTATION_SCHEMA_VERSION,
  COMPONENT_DOCUMENTATION_SUFFIX,
  loadOwnedComponentDocumentation,
} from "./component-documentation-sources.mjs";
import { validateDocumentationPagesMetadata } from "./generate-documentation-registry.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const DOCUMENTATION_PAGES_PATH = "docs/metadata/documentation-pages.json";
const RELEASE_GROUPS_PATH = "docs/metadata/release-groups.json";
const COMPONENTS_PATH = "docs/metadata/components.json";

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(root, relativePath, value) {
  writeFileSync(
    path.join(root, relativePath),
    `${JSON.stringify(value, null, 2)}\n`,
    "utf8",
  );
}

function repositoryPath(value) {
  return value.replaceAll("\\", "/");
}

function titleCaseSection(section) {
  return section
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sourceSkeleton({ title, description, template }) {
  const sections = template.sections
    .map(
      (section) =>
        `## ${titleCaseSection(section)}\n\n<!-- Describe ${section} for this capability. -->`,
    )
    .join("\n\n");

  return `# ${title}\n\n${description}\n\n${sections}\n`;
}

function nextOrder(metadata, section) {
  const sectionOrders = metadata.pages
    .filter((page) => page.section === section)
    .map((page) => page.order);
  return sectionOrders.length === 0 ? 0 : Math.max(...sectionOrders) + 1;
}

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}`);
    }
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    values[key] = value;
    index += 1;
  }
  return values;
}

function packageDirectoryForSource(sourcePath) {
  const parts = repositoryPath(sourcePath).split("/");
  if (parts.length < 3 || parts[0] !== "packages") return null;
  return `packages/${parts[1]}`;
}

function ownedSchemaReference(sourcePath) {
  const relative = repositoryPath(
    path.relative(
      path.dirname(sourcePath),
      COMPONENT_DOCUMENTATION_SCHEMA_PATH,
    ),
  );
  return relative.startsWith(".") ? relative : `./${relative}`;
}

function requiredMigrationText(component, field, value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(
      `Component ${component.id} requires ${field} in ${COMPONENTS_PATH} before owned documentation can be scaffolded.`,
    );
  }
  return value.trim();
}

export function scaffoldOwnedComponentDocumentation({
  root = repositoryRoot,
  componentId,
  ownerSource,
  sourcePath,
} = {}) {
  for (const [name, value] of Object.entries({
    componentId,
    ownerSource,
    sourcePath,
  })) {
    if (!value) {
      throw new Error(
        `Owned component documentation scaffold requires ${name}.`,
      );
    }
  }

  const normalizedSourcePath = repositoryPath(sourcePath);
  const normalizedOwnerSource = repositoryPath(ownerSource);
  const sourcePackageDirectory =
    packageDirectoryForSource(normalizedSourcePath);
  const ownerPackageDirectory = packageDirectoryForSource(
    normalizedOwnerSource,
  );

  if (
    path.isAbsolute(sourcePath) ||
    normalizedSourcePath.startsWith("../") ||
    !normalizedSourcePath.endsWith(COMPONENT_DOCUMENTATION_SUFFIX) ||
    !sourcePackageDirectory
  ) {
    throw new Error(
      `Owned component documentation source must be a repository-relative packages/**/*${COMPONENT_DOCUMENTATION_SUFFIX} path.`,
    );
  }
  if (
    path.isAbsolute(ownerSource) ||
    normalizedOwnerSource.startsWith("../") ||
    !ownerPackageDirectory ||
    ownerPackageDirectory !== sourcePackageDirectory ||
    !existsSync(path.join(root, normalizedOwnerSource))
  ) {
    throw new Error(
      "Owned component documentation owner source must be an existing source in the same VyrnForge package as the documentation file.",
    );
  }

  const packageJsonPath = `${sourcePackageDirectory}/package.json`;
  if (!existsSync(path.join(root, packageJsonPath))) {
    throw new Error(
      `Owned component documentation package is missing package.json: ${sourcePackageDirectory}`,
    );
  }
  const packageJson = readJson(root, packageJsonPath);
  if (
    typeof packageJson.name !== "string" ||
    !packageJson.name.startsWith("@vyrnforge/")
  ) {
    throw new Error(
      `Owned component documentation requires a VyrnForge package: ${sourcePackageDirectory}`,
    );
  }

  const absoluteSourcePath = path.join(root, normalizedSourcePath);
  if (existsSync(absoluteSourcePath)) {
    throw new Error(`Documentation source already exists: ${sourcePath}`);
  }

  const catalog = readJson(root, COMPONENTS_PATH);
  const component = (catalog.components ?? []).find(
    (candidate) => candidate.id === componentId,
  );
  if (!component) {
    throw new Error(`Unknown component metadata id: ${componentId}`);
  }

  const document = {
    $schema: ownedSchemaReference(normalizedSourcePath),
    schemaVersion: COMPONENT_DOCUMENTATION_SCHEMA_VERSION,
    componentId,
    owner: {
      package: packageJson.name,
      source: normalizedOwnerSource,
    },
    purpose: requiredMigrationText(component, "purpose", component.purpose),
    guidance: {
      useWhen: requiredMigrationText(component, "useWhen", component.useWhen),
      avoidWhen: requiredMigrationText(
        component,
        "avoidWhen",
        component.avoidWhen,
      ),
      aiUsageNotes: requiredMigrationText(
        component,
        "aiUsageNotes",
        component.aiUsageNotes,
      ),
    },
    limitations: Array.isArray(component.knownLimitations)
      ? component.knownLimitations.filter(
          (value) => typeof value === "string" && value.trim().length > 0,
        )
      : [],
    relatedComponents: Array.isArray(component.relatedComponents)
      ? component.relatedComponents.filter(
          (value) => typeof value === "string" && value.trim().length > 0,
        )
      : [],
    accessibility: {
      notes: requiredMigrationText(
        component,
        "accessibilityNotes",
        component.accessibilityNotes,
      ),
      evidenceRefs: [],
    },
    theming: {
      classes: Array.isArray(component.cssClasses) ? component.cssClasses : [],
      variables: Array.isArray(component.cssVariables)
        ? component.cssVariables
        : [],
    },
    examples: [],
    releaseNotes: [],
  };

  mkdirSync(path.dirname(absoluteSourcePath), { recursive: true });
  writeJson(root, normalizedSourcePath, document);

  try {
    const ownedDocumentation = loadOwnedComponentDocumentation({ root });
    if (!ownedDocumentation.documentByComponentId[componentId]) {
      throw new Error(
        `Owned component documentation was not discovered for ${componentId}.`,
      );
    }
  } catch (error) {
    rmSync(absoluteSourcePath, { force: true });
    throw error;
  }

  return {
    componentId,
    ownerPackage: packageJson.name,
    ownerSource: normalizedOwnerSource,
    sourcePath: normalizedSourcePath,
  };
}

export function scaffoldDocumentationRegistration({
  root = repositoryRoot,
  id,
  title,
  description,
  type,
  section,
  group,
  releaseLine,
  sourcePath,
  renderer = "markdown",
  exampleId,
  exampleCategory,
  order,
  tags = [],
} = {}) {
  for (const [name, value] of Object.entries({
    id,
    title,
    description,
    type,
    section,
    releaseLine,
    sourcePath,
  })) {
    if (!value) throw new Error(`Documentation scaffold requires ${name}.`);
  }

  const metadata = readJson(root, DOCUMENTATION_PAGES_PATH);
  const releaseGroups = readJson(root, RELEASE_GROUPS_PATH);

  if (metadata.pages.some((page) => page.id === id)) {
    throw new Error(`Documentation page ${id} already exists.`);
  }

  const sectionRecord = metadata.sections.find(
    (candidate) => candidate.id === section,
  );
  if (!sectionRecord) {
    throw new Error(`Unknown documentation section: ${section}`);
  }

  const template = metadata.templates.find((candidate) =>
    candidate.documentTypes.includes(type),
  );
  if (!template) {
    throw new Error(`Unknown documentation type: ${type}`);
  }

  if (!releaseGroups.releaseLines?.[releaseLine]) {
    throw new Error(`Unknown documentation release line: ${releaseLine}`);
  }

  const normalizedSourcePath = repositoryPath(sourcePath);
  if (
    path.isAbsolute(sourcePath) ||
    normalizedSourcePath.startsWith("../") ||
    !normalizedSourcePath.startsWith("docs/")
  ) {
    throw new Error(
      "Documentation scaffold source must be a repository-relative path under docs/.",
    );
  }

  const absoluteSourcePath = path.join(root, normalizedSourcePath);
  if (existsSync(absoluteSourcePath)) {
    throw new Error(`Documentation source already exists: ${sourcePath}`);
  }

  if (
    (renderer === "example" || renderer === "executable-examples") &&
    (!exampleId || !exampleCategory)
  ) {
    throw new Error(
      "Example documentation scaffolds require exampleId and exampleCategory.",
    );
  }

  const page = {
    id,
    title,
    section,
    group: group ?? sectionRecord.label,
    order:
      order === undefined || order === null
        ? nextOrder(metadata, section)
        : Number(order),
    type,
    renderer,
    description,
    releaseLine,
    sourcePath,
    ...(exampleId ? { exampleId } : {}),
    ...(exampleCategory ? { exampleCategory } : {}),
    ...(tags.length > 0 ? { tags } : {}),
  };

  mkdirSync(path.dirname(absoluteSourcePath), { recursive: true });
  writeFileSync(
    absoluteSourcePath,
    sourceSkeleton({ title, description, template }),
    "utf8",
  );

  try {
    const updatedMetadata = {
      ...metadata,
      pages: [...metadata.pages, page],
    };
    validateDocumentationPagesMetadata(updatedMetadata, { root });
    writeJson(root, DOCUMENTATION_PAGES_PATH, updatedMetadata);
  } catch (error) {
    rmSync(absoluteSourcePath, { force: true });
    throw error;
  }

  return {
    page,
    template: template.id,
    sourcePath: normalizedSourcePath,
    metadataPath: DOCUMENTATION_PAGES_PATH,
  };
}

function usage() {
  return [
    "Usage:",
    "  npm run scaffold:documentation -- --id <id> --title <title> --description <description> --type <type> --section <section> --release-line <id> --source <docs/path> [options]",
    "  npm run scaffold:documentation -- --component-id <id> --owner-source <packages/source> --source <packages/path.docs.json>",
    "",
    "Options:",
    "  --component-id <id>               Scaffold package-owned component guidance without registering another page",
    "  --owner-source <packages/source>  Owning implementation source for component guidance",
    "  --group <label>",
    "  --renderer <renderer>             Defaults to markdown",
    "  --order <number>                  Defaults to next order in section",
    "  --tags <comma-separated>",
    "  --example-id <id>",
    "  --example-category <basic|appearance|state|composition|advanced>",
  ].join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args["component-id"]) {
      const result = scaffoldOwnedComponentDocumentation({
        componentId: args["component-id"],
        ownerSource: args["owner-source"],
        sourcePath: args.source,
      });
      console.log(
        `Scaffolded owned component documentation for ${result.componentId} at ${result.sourcePath}; run npm run generate:reference next.`,
      );
    } else {
      const result = scaffoldDocumentationRegistration({
        id: args.id,
        title: args.title,
        description: args.description,
        type: args.type,
        section: args.section,
        group: args.group,
        releaseLine: args["release-line"],
        sourcePath: args.source,
        renderer: args.renderer ?? "markdown",
        order: args.order,
        tags: args.tags
          ? args.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        exampleId: args["example-id"],
        exampleCategory: args["example-category"],
      });
      console.log(
        `Scaffolded documentation page ${result.page.id} in ${result.metadataPath}; run npm run generate:reference next.`,
      );
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    console.error(usage());
    process.exitCode = 1;
  }
}
