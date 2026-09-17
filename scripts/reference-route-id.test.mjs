import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { slugFromSourcePath } from "../apps/docs/src/referenceRouteId.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = path.join(root, "docs");

function markdownSourcePaths(directory = docsRoot) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownSourcePaths(absolutePath);
    if (!entry.isFile() || !entry.name.endsWith(".md")) return [];
    return [path.relative(root, absolutePath).split(path.sep).join("/")];
  });
}

test("preserves established docs route ids", () => {
  assert.equal(slugFromSourcePath("docs/README.md"), "overview");
  assert.equal(slugFromSourcePath("docs/api/README.md"), "api-overview");
  assert.equal(slugFromSourcePath("docs/release/README.md"), "release-docs");
  assert.equal(
    slugFromSourcePath("docs/architecture/01-package-boundaries.md"),
    "package-boundaries",
  );
});

test("generic nested README route ids are path-aware", () => {
  assert.equal(
    slugFromSourcePath("docs/metadata/README.md"),
    "readme-metadata",
  );
  assert.equal(
    slugFromSourcePath("docs/packages/core/README.md"),
    "readme-packages-core",
  );
  assert.notEqual(
    slugFromSourcePath("docs/metadata/README.md"),
    slugFromSourcePath("docs/packages/core/README.md"),
  );
});

test("all authored Markdown documents produce unique route ids", () => {
  const sourceById = new Map();

  for (const sourcePath of markdownSourcePaths()) {
    const id = slugFromSourcePath(sourcePath);
    const existingSource = sourceById.get(id);
    assert.equal(
      existingSource,
      undefined,
      `Duplicate VyrnForge Docs route id ${id}: ${existingSource} and ${sourcePath}`,
    );
    sourceById.set(id, sourcePath);
  }
});
