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
      "docs/generated/documentation-registry.json",
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

test("rejects obsolete secondary-framework wording in the root migration guide", () =>
  fixture(
    (root) => {
      const relativePath = "MIGRATION.md";
      write(
        root,
        relativePath,
        `${read(root, relativePath)}\nAngular and Vue consume the verified Custom Element foundation unless a future decision changes that.\n`,
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("stale secondary-framework migration wording"),
        ),
      ),
  ));

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

test("rejects closed-program identifiers in active architecture contracts", () =>
  fixture(
    (root) => {
      const relativePath =
        "docs/architecture/15-component-presets-and-aliases.md";
      write(
        root,
        relativePath,
        `${read(root, relativePath)}\nClosed execution owner: SC-2102.\n`,
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("historical task/gate identifier SC-2102"),
        ),
      ),
  ));

test("rejects historical task identifiers in current guidance", () =>
  fixture(
    (root) => {
      const relativePath = "packages/ui-elements/README.md";
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

test("rejects a missing public documentation section", () =>
  fixture(
    (root) => {
      const relativePath = "docs/README.md";
      write(
        root,
        relativePath,
        read(root, relativePath).replace(
          "## Start here",
          "## Consumer documentation",
        ),
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes(
            "missing public documentation section ## Start here",
          ),
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

test("rejects removed aggregate commands in quality guidance", () =>
  fixture(
    (root) => {
      const relativePath = "docs/quality/00-quality-gates.md";
      write(
        root,
        relativePath,
        `${read(root, relativePath)}\nLegacy instruction: npm run quality\n`,
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("removed public command: npm run quality"),
        ),
      ),
  ));

test("rejects restoration of deprecated hand-maintained AI mirrors", () =>
  fixture(
    (root) => {
      write(root, ".ai/REPO_MAP.md", "# Duplicate repository map\n");
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes(
            "obsolete hand-maintained AI mirror must not be restored",
          ),
        ),
      ),
  ));

test("rejects retired Reference authorities in current guidance", () =>
  fixture(
    (root) => {
      const relativePath = "docs/governance/00-documentation-governance.md";
      write(
        root,
        relativePath,
        `${read(root, relativePath)}\nLegacy route owner: apps/docs/src/docsRegistry.ts\n`,
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes(
            "current guidance references retired Reference authority apps/docs/src/docsRegistry.ts",
          ),
        ),
      ),
  ));

test("rejects a duplicate package-owned component catalog", () =>
  fixture(
    (root) => {
      const relativePath = "packages/ui-components/README.md";
      write(
        root,
        relativePath,
        `${read(root, relativePath)}\n## Components\n- Button\n`,
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes(
            "package README must not maintain an exhaustive component catalog",
          ),
        ),
      ),
  ));

test("rejects reader-facing Markdown routes omitted from docs verification", () =>
  fixture(
    (root) => {
      const relativePath = "docs/generated/documentation-registry.json";
      const registry = JSON.parse(read(root, relativePath));
      const page = registry.pages.find(
        (candidate) =>
          candidate.sourcePath ===
          "docs/architecture/03-theming-and-styling.md",
      );
      assert(page);
      page.sourcePath = "docs/architecture/unverified-public-page.md";
      write(root, relativePath, `${JSON.stringify(registry, null, 2)}\n`);
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes(
            "docs/architecture/unverified-public-page.md: reader-facing Markdown route must be included in documentationCurrentPaths",
          ),
        ),
      ),
  ));
