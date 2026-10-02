import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateDocumentationPagesMetadata } from "./generate-documentation-registry.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const DOCUMENTATION_PAGES_PATH = "docs/metadata/documentation-pages.json";
const RELEASE_GROUPS_PATH = "docs/metadata/release-groups.json";

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

  const normalizedSourcePath = sourcePath.replace(/\\/gu, "/");
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
    "  npm run scaffold:documentation -- --id <id> --title <title> --description <description> --type <type> --section <section> --release-line <id> --source <path> [options]",
    "",
    "Options:",
    "  --group <label>",
    "  --renderer <renderer>              Defaults to markdown",
    "  --order <number>                   Defaults to next order in section",
    "  --tags <comma-separated>",
    "  --example-id <id>",
    "  --example-category <basic|appearance|state|composition|advanced>",
  ].join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
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
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    console.error(usage());
    process.exitCode = 1;
  }
}
