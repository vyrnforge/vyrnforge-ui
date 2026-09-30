import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { discoverDocumentationMarkdownPaths } from "./documentation-paths.mjs";
import { verifyMarkdownStructure } from "./verify-markdown-structure.mjs";

function fixture(content, callback) {
  const root = mkdtempSync(
    path.join(tmpdir(), "vyrnforge-markdown-structure-"),
  );
  try {
    const relativePath = "docs/example.md";
    const file = path.join(root, relativePath);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, content);
    callback(root, relativePath);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

test("accepts unique headings and a valid Markdown table", () =>
  fixture(
    `# Example

## Components

| Component | Purpose |
| --- | --- |
| Button | Action |
| Select | Choice |
`,
    (root, relativePath) =>
      assert.deepEqual(
        verifyMarkdownStructure({ root, paths: [relativePath] }),
        [],
      ),
  ));

test("rejects duplicate headings at the same level", () =>
  fixture(
    `# Example

## Choice guidance

Text.

## Choice guidance
`,
    (root, relativePath) => {
      const failures = verifyMarkdownStructure({ root, paths: [relativePath] });
      assert.equal(failures.length, 1);
      assert.match(failures[0], /duplicate heading "Choice guidance"/u);
    },
  ));

test("rejects malformed table column counts", () =>
  fixture(
    `# Example

| Component | Props |
| --- | --- |
| Message | \`tone="error" | "warning"\` |
`,
    (root, relativePath) => {
      const failures = verifyMarkdownStructure({ root, paths: [relativePath] });
      assert.equal(failures.length, 1);
      assert.match(failures[0], /Markdown table has 3 columns; expected 2/u);
    },
  ));

test("rejects duplicate first-column table entries", () =>
  fixture(
    `# Example

| Component | Purpose |
| --- | --- |
| Button | Action |
| Button | Duplicate |
`,
    (root, relativePath) => {
      const failures = verifyMarkdownStructure({ root, paths: [relativePath] });
      assert.equal(failures.length, 1);
      assert.match(failures[0], /duplicate table entry Button/u);
    },
  ));

test("rejects orphaned pipe-row blocks", () =>
  fixture(
    `# Example

Paragraph.

| EmptyState | Empty content |
| ErrorState | Error content |
`,
    (root, relativePath) => {
      const failures = verifyMarkdownStructure({ root, paths: [relativePath] });
      assert.equal(failures.length, 1);
      assert.match(
        failures[0],
        /pipe-row block is not a valid Markdown table/u,
      );
    },
  ));

test("ignores table-like content inside fenced code blocks", () =>
  fixture(
    `# Example

\`\`\`text
| not | a | table |
| still | example | text |
\`\`\`
`,
    (root, relativePath) =>
      assert.deepEqual(
        verifyMarkdownStructure({ root, paths: [relativePath] }),
        [],
      ),
  ));

test("discovers root, AI, docs, and package README Markdown sources", () => {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-doc-discovery-"));
  try {
    const files = [
      "README.md",
      "CONTRIBUTING.md",
      ".ai/AI_CONTEXT.md",
      "docs/README.md",
      "docs/architecture/system.md",
      "packages/ui-core/README.md",
      "packages/ui-core/NOTES.txt",
      "apps/docs/README.md",
    ];
    for (const relativePath of files) {
      const file = path.join(root, relativePath);
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, relativePath.endsWith(".md") ? "# Doc\n" : "text\n");
    }

    assert.deepEqual(discoverDocumentationMarkdownPaths({ root }), [
      ".ai/AI_CONTEXT.md",
      "CONTRIBUTING.md",
      "README.md",
      "docs/README.md",
      "docs/architecture/system.md",
      "packages/ui-core/README.md",
    ]);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("allows repeated subheadings under different parent sections", () =>
  fixture(
    `# Changelog

## 1.1.0

### Added

Feature A.

## 1.0.0

### Added

Feature B.
`,
    (root, relativePath) =>
      assert.deepEqual(
        verifyMarkdownStructure({ root, paths: [relativePath] }),
        [],
      ),
  ));

test("rejects missing or multiple H1 document titles", () => {
  fixture(
    `## Missing title
`,
    (root, relativePath) => {
      const failures = verifyMarkdownStructure({ root, paths: [relativePath] });
      assert(
        failures.some((failure) =>
          failure.includes("expected exactly one H1 document title; found 0"),
        ),
      );
    },
  );

  fixture(
    `# First

# Second
`,
    (root, relativePath) => {
      const failures = verifyMarkdownStructure({ root, paths: [relativePath] });
      assert(
        failures.some((failure) =>
          failure.includes("expected exactly one H1 document title; found 2"),
        ),
      );
    },
  );
});
