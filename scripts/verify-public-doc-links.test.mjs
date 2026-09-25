import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { verifyPublicDocumentationLinks } from "./verify-public-doc-links.mjs";

function fixture(files, callback) {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-doc-links-"));
  try {
    for (const [relativePath, content] of Object.entries(files)) {
      const file = path.join(root, relativePath);
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, content);
    }
    callback(root);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

test("accepts valid local documentation links", () =>
  fixture(
    {
      "docs/README.md": "[Setup](api/setup.md)\n[Section](#start)\n[Web](https://example.com)\n",
      "docs/api/setup.md": "# Setup\n",
    },
    (root) =>
      assert.deepEqual(
        verifyPublicDocumentationLinks({
          root,
          paths: ["docs/README.md", "docs/api/setup.md"],
        }),
        [],
      ),
  ));

test("rejects missing local documentation targets", () =>
  fixture(
    {
      "docs/README.md": "[Missing](api/missing.md)\n",
    },
    (root) => {
      const failures = verifyPublicDocumentationLinks({
        root,
        paths: ["docs/README.md"],
      });
      assert.deepEqual(failures, [
        "docs/README.md: broken relative documentation link: api/missing.md",
      ]);
    },
  ));

test("ignores links inside fenced code examples", () =>
  fixture(
    {
      "docs/README.md": "```md\n[Example](missing.md)\n```\n",
    },
    (root) =>
      assert.deepEqual(
        verifyPublicDocumentationLinks({
          root,
          paths: ["docs/README.md"],
        }),
        [],
      ),
  ));
