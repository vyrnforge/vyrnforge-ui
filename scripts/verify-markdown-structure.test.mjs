import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { verifyMarkdownStructure } from "./verify-markdown-structure.mjs";

function fixture(content, callback) {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-markdown-structure-"));
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
    `| Component | Props |
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
    `| Component | Purpose |
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
    `Paragraph.

| EmptyState | Empty content |
| ErrorState | Error content |
`,
    (root, relativePath) => {
      const failures = verifyMarkdownStructure({ root, paths: [relativePath] });
      assert.equal(failures.length, 1);
      assert.match(failures[0], /pipe-row block is not a valid Markdown table/u);
    },
  ));

test("ignores table-like content inside fenced code blocks", () =>
  fixture(
    `\`\`\`text
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
