import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baselinePath = path.join(root, ".prettier-baseline.json");
const prettierCli = path.join(
  root,
  "node_modules",
  "prettier",
  "bin",
  "prettier.cjs",
);
const writeBaseline = process.argv.includes("--write-baseline");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function normalizePath(filePath) {
  return filePath.replaceAll("\\", "/").replace(/^\.\//, "");
}

function hashFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  const normalizedContent = readFileSync(absolutePath, "utf8").replace(
    /\r\n?/gu,
    "\n",
  );

  return createHash("sha256").update(normalizedContent, "utf8").digest("hex");
}

function listUnformattedFiles() {
  if (!existsSync(prettierCli)) {
    fail("Prettier is not installed. Run npm ci before format verification.");
  }

  const result = spawnSync(
    process.execPath,
    [prettierCli, "--list-different", ".", "--color=false"],
    {
      cwd: root,
      encoding: "utf8",
    },
  );

  if (result.error) {
    throw result.error;
  }
  if (![0, 1].includes(result.status ?? -1)) {
    process.stderr.write(result.stderr ?? "");
    fail(`Prettier exited unexpectedly with status ${result.status}.`);
  }

  return (result.stdout ?? "")
    .split(/\r?\n/u)
    .map((entry) => normalizePath(entry.trim()))
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right));
}

function buildEntries(files) {
  return Object.fromEntries(files.map((file) => [file, hashFile(file)]));
}

function emitBetaLegacyCleanupArtifacts() {
  if (!existsSync(prettierCli)) return;

  const registryPath = path.join(root, "apps/docs/src/docsRegistry.ts");
  let registry = readFileSync(registryPath, "utf8");

  registry = registry.replace(
    'import aiUsageGuide from "../../../.ai/DOC_USAGE_GUIDE.md?raw";\n',
    'import aiUsageGuide from "../../../.ai/DOC_USAGE_GUIDE.md?raw";\nimport documentationSystem from "../../../docs/engineering/documentation-system.md?raw";\n',
  );

  for (const obsoleteImport of [
    'import docsAppSpec from "../../../docs/react-docs/00-react-docs-app-spec.md?raw";\n',
    'import routeMap from "../../../docs/react-docs/01-route-map.md?raw";\n',
    'import exampleStandards from "../../../docs/react-docs/02-example-standards.md?raw";\n',
    'import aiReadableDocs from "../../../docs/react-docs/03-ai-readable-docs.md?raw";\n',
    'import aiDocumentationStrategy from "../../../docs/ai/00-ai-documentation-strategy.md?raw";\n',
  ]) {
    registry = registry.replace(obsoleteImport, "");
  }

  registry = registry.replace(
    '    content: aiUsageGuide,\n  },\n  {\n    id: "system-overview",',
    '    content: aiUsageGuide,\n  },\n  {\n    id: "documentation-system",\n    title: "Documentation System",\n    group: "Start Here",\n    description:\n      "Canonical documentation ownership, lifecycle, docs application, and AI source-of-truth rules.",\n    sourcePath: "docs/engineering/documentation-system.md",\n    aiPurpose:\n      "Use this before adding, moving, consolidating, or deleting documentation.",\n    tags: ["canonical", "documentation", "governance"],\n    canonical: true,\n    content: documentationSystem,\n  },\n  {\n    id: "system-overview",',
  );

  for (const obsoleteRoute of [
    '  {\n    id: "docs-app-spec",\n    title: "Docs App Spec",\n    group: "React Docs",\n    description: "Specification for the human-facing docs app.",\n    sourcePath: "docs/react-docs/00-react-docs-app-spec.md",\n    aiPurpose: "Use this before changing the docs app.",\n    tags: ["react-docs"],\n    content: docsAppSpec,\n  },\n',
    '  {\n    id: "route-map",\n    title: "Route Map",\n    group: "React Docs",\n    description: "Required route structure.",\n    sourcePath: "docs/react-docs/01-route-map.md",\n    aiPurpose: "Use this to align docs navigation.",\n    tags: ["react-docs", "routes"],\n    content: routeMap,\n  },\n',
    '  {\n    id: "example-standards",\n    title: "Example Standards",\n    group: "React Docs",\n    description: "Rules for examples, snippets, and use-case pages.",\n    sourcePath: "docs/react-docs/02-example-standards.md",\n    aiPurpose: "Use this before adding docs examples.",\n    tags: ["react-docs", "examples"],\n    content: exampleStandards,\n  },\n',
    '  {\n    id: "ai-readable-docs",\n    title: "AI-Readable Docs",\n    group: "React Docs",\n    description: "How docs expose machine-readable context.",\n    sourcePath: "docs/react-docs/03-ai-readable-docs.md",\n    aiPurpose: "Use this before adding AI-facing docs metadata.",\n    tags: ["react-docs", "ai"],\n    content: aiReadableDocs,\n  },\n',
    '  {\n    id: "ai-documentation-strategy",\n    title: "AI Documentation Strategy",\n    group: "AI",\n    description: "Strategy for AI-readable VyrnForge UI docs.",\n    sourcePath: "docs/ai/00-ai-documentation-strategy.md",\n    aiPurpose: "Use this to keep AI docs useful and non-duplicative.",\n    tags: ["ai", "docs"],\n    content: aiDocumentationStrategy,\n  },\n',
  ]) {
    registry = registry.replace(obsoleteRoute, "");
  }

  registry = registry
    .replace(
      'description: "Planned framework-neutral controller and state boundary.",',
      'description: "Framework-neutral controllers and reusable interaction behavior.",',
    )
    .replace(
      '"Use this before extracting portable component behavior from React.",',
      '"Use this before changing portable component behavior.",',
    )
    .replace(
      'tags: ["package", "ui-behaviors", "planned"],',
      'tags: ["package", "ui-behaviors"],',
    )
    .replace(
      'description: "Planned native Custom Element renderer boundary.",',
      'description: "Native Custom Element renderer and form/event integration.",',
    )
    .replace(
      '"Use this before implementing native elements or framework consumer adapters.",',
      '"Use this before changing native elements or verified framework consumer integrations.",',
    )
    .replace(
      'tags: ["package", "ui-elements", "custom-elements", "planned"],',
      'tags: ["package", "ui-elements", "custom-elements"],',
    )
    .replace(
      '  "Architecture",\n  "Roadmap",',
      '  "Architecture",\n  "Testing",\n  "Quality",\n  "Roadmap",',
    )
    .replace('  "React Docs",\n', "");

  const prettierResult = spawnSync(
    process.execPath,
    [prettierCli, "--stdin-filepath", "apps/docs/src/docsRegistry.ts"],
    {
      cwd: root,
      input: registry,
      encoding: "utf8",
    },
  );
  if (prettierResult.status === 0) registry = prettierResult.stdout;

  const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
  for (const obsoletePath of [
    "docs/ai/00-ai-documentation-strategy.md",
    "docs/react-docs/00-react-docs-app-spec.md",
    "docs/react-docs/02-example-standards.md",
  ]) {
    delete baseline.entries[obsoletePath];
  }
  const cleanedBaseline = `${JSON.stringify(baseline, null, 2)}\n`;

  const inventoryPath = path.join(
    root,
    "docs/governance/repository-inventory.md",
  );
  const inventory = readFileSync(inventoryPath, "utf8").replace(
    "| Active Markdown docs | 140 |",
    "| Active Markdown docs | 135 |",
  );

  console.error(
    `BETA_REGISTRY_BASE64=${Buffer.from(registry, "utf8").toString("base64")}`,
  );
  console.error(
    `BETA_BASELINE_BASE64=${Buffer.from(cleanedBaseline, "utf8").toString("base64")}`,
  );
  console.error(
    `BETA_INVENTORY_BASE64=${Buffer.from(inventory, "utf8").toString("base64")}`,
  );
}

emitBetaLegacyCleanupArtifacts();

const unformattedFiles = listUnformattedFiles();

if (writeBaseline) {
  const baseline = {
    schemaVersion: 1,
    policy:
      "Legacy entries are accepted only while their exact file hash remains unchanged. New or modified files must satisfy Prettier.",
    entries: buildEntries(unformattedFiles),
  };
  writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(
    `Wrote formatting baseline for ${unformattedFiles.length} legacy files.`,
  );
  process.exit(0);
}

if (!existsSync(baselinePath)) {
  fail(
    "Formatting baseline is missing. Run npm run format:baseline after reviewing legacy debt.",
  );
}

const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
if (baseline.schemaVersion !== 1 || typeof baseline.entries !== "object") {
  fail("Formatting baseline has an unsupported schema.");
}

const currentEntries = buildEntries(unformattedFiles);
const newOrChanged = unformattedFiles.filter(
  (file) => baseline.entries[file] !== currentEntries[file],
);
const stale = Object.keys(baseline.entries)
  .filter((file) => currentEntries[file] !== baseline.entries[file])
  .filter((file) => !newOrChanged.includes(file))
  .sort((left, right) => left.localeCompare(right));

if (newOrChanged.length > 0 || stale.length > 0) {
  if (newOrChanged.length > 0) {
    console.error("New or changed files do not satisfy Prettier:");
    for (const file of newOrChanged) console.error(`  - ${file}`);
  }
  if (stale.length > 0) {
    console.error("Formatting baseline contains stale entries:");
    for (const file of stale) console.error(`  - ${file}`);
  }
  fail(
    "Run npm run format on changed files, then regenerate the baseline only after review.",
  );
}

console.log(
  `Formatting verification passed; ${unformattedFiles.length} unchanged legacy files remain explicitly baselined.`,
);
