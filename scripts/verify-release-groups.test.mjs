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
import { verifyReleaseGroups } from "./verify-release-groups.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const fixtureEntries = [
  ".github",
  "apps",
  "docs",
  "examples",
  "packages",
  "scripts",
  "package-lock.json",
  "package.json",
];

function fixture(mutator, callback) {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-release-groups-"));
  try {
    for (const entry of fixtureEntries) {
      cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
        recursive: true,
      });
    }
    mutator?.(root);
    callback(verifyReleaseGroups({ root }));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function mutateJson(root, relativePath, update) {
  const file = path.join(root, relativePath);
  const value = JSON.parse(readFileSync(file, "utf8"));
  update(value);
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

test("accepts the BT-8002 release groups", () =>
  fixture(null, (failures) => assert.deepEqual(failures, [])));

test("rejects promoting ui-data-grid with the non-grid beta", () =>
  fixture(
    (root) => {
      mutateJson(root, "docs/metadata/release-groups.json", (value) => {
        value.groups["non-grid-beta"].packages.push(
          value.groups["data-grid-alpha"].packages[0],
        );
      });
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("must not include ui-data-grid"),
        ),
      ),
  ));

test("rejects beta package version drift", () =>
  fixture(
    (root) => {
      mutateJson(root, "packages/ui-elements/package.json", (value) => {
        value.version = "0.2.0-beta.3";
      });
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("package version must be 0.2.0-beta.2"),
        ),
      ),
  ));

test("rejects a stale workspace consumer dependency", () =>
  fixture(
    (root) => {
      mutateJson(root, "apps/docs/package.json", (value) => {
        value.dependencies["@vyrnforge/ui-core"] = "0.1.0-alpha.1";
      });
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("apps/docs/package.json: @vyrnforge/ui-core"),
        ),
      ),
  ));

test("rejects release tooling without an explicit grid guard", () =>
  fixture(
    (root) => {
      const workflowPath = path.join(root, ".github/workflows/release.yml");
      const workflow = readFileSync(workflowPath, "utf8").replaceAll(
        "if: inputs.release-group == 'data-grid-alpha'",
        "if: always()",
      );
      writeFileSync(workflowPath, workflow);
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("inputs.release-group == 'data-grid-alpha'"),
        ),
      ),
  ));
