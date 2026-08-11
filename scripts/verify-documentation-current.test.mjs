import assert from "node:assert/strict";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  documentationCurrentPaths,
  verifyDocumentationCurrent,
} from "./verify-documentation-current.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function write(root, relativePath, content) {
  const file = path.join(root, relativePath);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function fixture(mutator, callback) {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-doc-current-"));
  try {
    const paths = [
      ...documentationCurrentPaths,
      "docs/metadata/release-groups.json",
    ];
    for (const relativePath of new Set(paths)) {
      const destination = path.join(root, relativePath);
      mkdirSync(path.dirname(destination), { recursive: true });
      copyFileSync(path.join(repositoryRoot, relativePath), destination);
    }

    mutator?.(root);
    callback(verifyDocumentationCurrent({ root }));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("accepts current reader-facing documentation", () =>
  fixture(null, (failures) => assert.deepEqual(failures, [])));

test("rejects an incorrect package install channel", () =>
  fixture(
    (root) => {
      const relativePath = "packages/ui-core/README.md";
      write(
        root,
        relativePath,
        read(root, relativePath).replace(
          "@vyrnforge/ui-core@beta",
          "@vyrnforge/ui-core@alpha",
        ),
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes(
            "@vyrnforge/ui-core install uses @alpha; expected @beta",
          ),
        ),
      ),
  ));

test("rejects hardcoded prerelease versions in primary guidance", () =>
  fixture(
    (root) => {
      const relativePath = "README.md";
      write(
        root,
        relativePath,
        `${read(root, relativePath)}\nTemporary example: 0.2.0-beta.2\n`,
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes(
            "primary guidance must use prerelease channels instead of hardcoded prerelease versions",
          ),
        ),
      ),
  ));

test("rejects historical task identifiers in current guidance", () =>
  fixture(
    (root) => {
      const relativePath = "docs/packages/ui-elements.md";
      write(
        root,
        relativePath,
        `${read(root, relativePath)}\nHistorical marker CF-7001.\n`,
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("historical task/gate identifier CF-7001"),
        ),
      ),
  ));

test("rejects a missing documentation audience section", () =>
  fixture(
    (root) => {
      const relativePath = "docs/README.md";
      write(
        root,
        relativePath,
        read(root, relativePath).replace(
          "## Use VyrnForge",
          "## Consumer documentation",
        ),
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("missing audience section ## Use VyrnForge"),
        ),
      ),
  ));

test("rejects release-version drift in the versioning policy", () =>
  fixture(
    (root) => {
      const relativePath = "docs/release/versioning-policy.md";
      write(
        root,
        relativePath,
        read(root, relativePath).replaceAll("0.2.0-beta.2", "0.2.0-beta.999"),
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("missing non-grid-beta version 0.2.0-beta.2"),
        ),
      ),
  ));

test("rejects a missing canonical release-group id", () =>
  fixture(
    (root) => {
      const relativePath = "docs/release/versioning-policy.md";
      write(
        root,
        relativePath,
        read(root, relativePath).replaceAll(
          "non-grid-beta",
          "non-grid-prerelease",
        ),
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("missing release group id non-grid-beta"),
        ),
      ),
  ));

test("rejects removal of behavior-history markers required by repository evidence", () =>
  fixture(
    (root) => {
      const relativePath = "docs/roadmap/00-master-roadmap.md";
      write(
        root,
        relativePath,
        read(root, relativePath).replace("MF-5008", "removed-behavior-task"),
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("missing historical behavior marker MF-5008"),
        ),
      ),
  ));
