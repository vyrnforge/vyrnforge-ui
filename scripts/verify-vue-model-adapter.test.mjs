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

import { verifyVueModelAdapter } from "./verify-vue-model-adapter.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function fixture(mutator, callback) {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-vue-model-"));
  try {
    for (const entry of ["docs", "scripts", "tests"]) {
      cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
        recursive: true,
      });
    }
    mutator?.(root);
    callback(verifyVueModelAdapter({ root }));
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

test("accepts the verified Vue model adapter", () =>
  fixture(null, (failures) => assert.deepEqual(failures, [])));

test("rejects a published Vue adapter package", () =>
  fixture(
    (root) => {
      const file = path.join(root, "docs/metadata/vue-model-adapter.json");
      const value = JSON.parse(readFileSync(file, "utf8"));
      value.adapter.publishedPackage = "@vyrnforge/ui-vue";
      writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
    },
    (failures) =>
      assert(
        failures.includes(
          "Vue model adapter must not publish a framework package",
        ),
      ),
  ));

test("rejects missing checked-event translation", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "tests/consumers/vue/src/adapters/VyrnForgeCheckboxModel.vue",
      );
      writeFileSync(
        file,
        readFileSync(file, "utf8").replace("vf-checked-change", "change"),
      );
    },
    (failures) =>
      assert(failures.some((failure) => failure.includes("vf-checked-change"))),
  ));

test("rejects missing listener cleanup", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "tests/consumers/vue/src/adapters/useVyrnForgeModel.ts",
      );
      writeFileSync(
        file,
        readFileSync(file, "utf8").replace(
          "removeEventListener",
          "removeListener",
        ),
      );
    },
    (failures) =>
      assert(
        failures.some((failure) => failure.includes("removeEventListener")),
      ),
  ));
