import assert from "node:assert/strict";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { verifyMultiFrameworkMigrationGuide } from "./verify-multi-framework-migration-guide.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function fixture(mutator, callback) {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-cf7013-"));
  try {
    for (const entry of ["docs", "MIGRATION.md"]) {
      cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
        recursive: true,
      });
    }
    mutator?.(root);
    callback(verifyMultiFrameworkMigrationGuide({ root }));
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

test("accepts the review-ready CF-7013 guide", () =>
  fixture(null, (failures) => assert.deepEqual(failures, [])));

test("rejects removal of the data-grid limitation", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "docs/release/multi-framework-migration-and-limitations.md",
      );
      writeFileSync(
        file,
        readFileSync(file, "utf8").replace(
          "## Data-grid scope",
          "## Deferred module",
        ),
      );
    },
    (failures) =>
      assert(failures.some((failure) => failure.includes("Data-grid scope"))),
  ));

test("evidence-complete requires named review evidence", () =>
  fixture(
    (root) => {
      // Keep this regression independent from completed repository review evidence.
      rmSync(
        path.join(
          root,
          "docs",
          "quality",
          "documentation-reviews",
          "cf-7013-multi-framework-migration-guide.json",
        ),
        { force: true },
      );

      const file = path.join(
        root,
        "docs/metadata/multi-framework-migration-guide.json",
      );
      const value = JSON.parse(readFileSync(file, "utf8"));
      value.program.status = "evidence-complete";
      value.supportClaim = "multi-framework-migration-guide-verified";
      value.unresolvedBlockers = [];
      writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("review evidence is missing"),
        ),
      ),
  ));
