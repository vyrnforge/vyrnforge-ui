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
import { verifyComponentReference } from "./verify-component-reference.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function fixture(mutator, callback) {
  const root = mkdtempSync(
    path.join(tmpdir(), "vyrnforge-component-reference-"),
  );
  try {
    for (const entry of ["apps", "docs", "packages", "scripts"]) {
      cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
        recursive: true,
      });
    }
    mutator?.(root);
    callback(verifyComponentReference({ root }));
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

test("accepts the generated CF-7011/CF-7012 reference", () =>
  fixture(null, (failures) => assert.deepEqual(failures, [])));

test("rejects a stale generated reference", () =>
  fixture(
    (root) => {
      const file = path.join(root, "docs/generated/component-reference.json");
      const value = JSON.parse(readFileSync(file, "utf8"));
      value.components.pop();
      writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("generated component reference is stale"),
        ),
      ),
  ));

test("rejects a missing framework tab", () =>
  fixture(
    (root) => {
      const file = path.join(root, "docs/generated/component-reference.json");
      const value = JSON.parse(readFileSync(file, "utf8"));
      delete value.components[0].frameworks.vue;
      writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
    },
    (failures) =>
      assert(failures.some((failure) => failure.includes("missing vue"))),
  ));

test("rejects invented Angular or Vue parity promotion", () =>
  fixture(
    (root) => {
      const file = path.join(root, "docs/generated/component-reference.json");
      const value = JSON.parse(readFileSync(file, "utf8"));
      const component = value.components.find(
        (entry) => entry.frameworks?.angular?.status === "planned-gmf4",
      );
      assert(
        component,
        "fixture needs a component with planned-gmf4 Angular status",
      );
      component.frameworks.angular.status = "verified-consumer";
      writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("Angular status must remain sourced"),
        ),
      ),
  ));
