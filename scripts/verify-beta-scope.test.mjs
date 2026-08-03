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
import { verifyBetaScope } from "./verify-beta-scope.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function fixture(mutator, callback) {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-beta-scope-"));
  try {
    for (const entry of ["docs", "packages", "scripts"]) {
      cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
        recursive: true,
      });
    }
    mutator?.(root);
    callback(verifyBetaScope({ root }));
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

test("accepts the frozen BT-8001 scope", () =>
  fixture(null, (failures) => assert.deepEqual(failures, [])));

test("rejects a stale component scope manifest", () =>
  fixture(
    (root) => {
      mutateJson(root, "docs/metadata/non-grid-beta-scope.json", (value) => {
        value.components.pop();
      });
    },
    (failures) =>
      assert(
        failures.some((failure) => failure.includes("manifest is stale")),
      ),
  ));

test("rejects adding ui-data-grid to the beta release group", () =>
  fixture(
    (root) => {
      mutateJson(root, "docs/metadata/gmf4-closure.json", (value) => {
        value.releaseGroup.includedPackages.push("@vyrnforge/ui-data-grid");
      });
      mutateJson(root, "docs/metadata/non-grid-beta-scope.json", (value) => {
        value.releaseGroup.includedPackages.push("@vyrnforge/ui-data-grid");
      });
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("must not include ui-data-grid"),
        ),
      ),
  ));

test("rejects a regressed Angular component support claim", () =>
  fixture(
    (root) => {
      mutateJson(root, "docs/metadata/components.json", (value) => {
        const component = value.components.find(
          (entry) =>
            entry.package === "@vyrnforge/ui-components" && entry.publicExport,
        );
        component.frameworkParity.angular.status = "planned-gmf4";
      });
      mutateJson(root, "docs/metadata/non-grid-beta-scope.json", (value) => {
        value.components[0].angular.status = "planned-gmf4";
      });
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("Angular must be a verified consumer"),
        ),
      ),
  ));

test("rejects a missing canonical component document", () =>
  fixture(
    (root) => {
      mutateJson(root, "docs/metadata/components.json", (value) => {
        const component = value.components.find(
          (entry) =>
            entry.package === "@vyrnforge/ui-components" && entry.publicExport,
        );
        component.docsPath = "docs/api/does-not-exist.md";
      });
      mutateJson(root, "docs/metadata/non-grid-beta-scope.json", (value) => {
        value.components[0].documentation.path = "docs/api/does-not-exist.md";
      });
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("canonical documentation path is missing"),
        ),
      ),
  ));
