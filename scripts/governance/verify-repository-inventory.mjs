import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const committedPath = path.join(root, "docs/governance/repository-inventory.md");
const temporaryDirectory = mkdtempSync(path.join(tmpdir(), "vyrnforge-inventory-"));
const generatedPath = path.join(temporaryDirectory, "repository-inventory.md");

function normalize(value) {
  return value.replaceAll("\r\n", "\n");
}

try {
  execFileSync(
    process.execPath,
    [
      path.join(root, "scripts/governance/generate-repository-inventory.mjs"),
      "--output",
      generatedPath,
    ],
    { cwd: root, stdio: "inherit" },
  );

  const committed = normalize(readFileSync(committedPath, "utf8"));
  const generated = normalize(readFileSync(generatedPath, "utf8"));

  if (committed !== generated) {
    throw new Error(
      "Repository inventory is stale. Run `npm run inventory:repository` and commit the generated documentation.",
    );
  }

  console.log("Repository inventory is current.");
} finally {
  rmSync(temporaryDirectory, { force: true, recursive: true });
}
