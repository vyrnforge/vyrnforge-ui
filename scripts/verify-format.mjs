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
const retired = Object.keys(baseline.entries)
  .filter((file) => currentEntries[file] === undefined)
  .sort((left, right) => left.localeCompare(right));

if (newOrChanged.length > 0) {
  console.error("New or changed files do not satisfy Prettier:");
  for (const file of newOrChanged) console.error(`  - ${file}`);
  const target = "apps/docs/src/OverviewPage.tsx";
  if (newOrChanged.includes(target)) {
    const formatted = spawnSync(
      process.execPath,
      [prettierCli, "--write", target, "--color=false"],
      { cwd: root, encoding: "utf8" },
    );
    if (formatted.status === 0) {
      console.error("--- PRETTIER_CANONICAL_START ---");
      console.error(readFileSync(path.join(root, target), "utf8"));
      console.error("--- PRETTIER_CANONICAL_END ---");
    }
  }
  fail("Run npm run format on changed files before committing them.");
}

if (retired.length > 0) {
  console.log(
    `Formatting verification retired ${retired.length} now-formatted or removed legacy baseline entries.`,
  );
}

console.log(
  `Formatting verification passed; ${unformattedFiles.length} unchanged legacy files remain explicitly baselined.`,
);
