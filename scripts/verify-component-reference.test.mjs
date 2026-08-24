import assert from "node:assert/strict";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  unlinkSync,
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
    path.join(tmpdir(), "vyrnforge-consumer-knowledge-"),
  );
  try {
    for (const entry of ["apps", "docs", "examples", "packages", "scripts"]) {
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

test("accepts the generated consumer knowledge and task-scoped AI context", () =>
  fixture(null, (failures) => assert.deepEqual(failures, [])));

test("rejects stale generated consumer knowledge", () =>
  fixture(
    (root) => {
      const file = path.join(root, "docs/generated/consumer-knowledge.json");
      const value = JSON.parse(readFileSync(file, "utf8"));
      value.components.pop();
      writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("consumer knowledge is stale"),
        ),
      ),
  ));

test("rejects a missing component context slice", () =>
  fixture(
    (root) =>
      unlinkSync(
        path.join(root, "docs/generated/ai-context/components/button.json"),
      ),
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("button AI component context is missing"),
        ),
      ),
  ));

test("rejects generated Angular status drift", () =>
  fixture(
    (root) => {
      const file = path.join(root, "docs/generated/component-reference.json");
      const value = JSON.parse(readFileSync(file, "utf8"));
      const component = value.components.find(
        (entry) => entry.frameworks?.angular?.status === "verified-consumer",
      );
      assert(component, "fixture needs a verified Angular consumer component");
      component.frameworks.angular.status = "first-class";
      writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("component reference is stale"),
        ),
      ),
  ));

test("rejects hand-written playground maturity status", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "examples/basic-playground/src/pages/reference/PriorityComponentPages.tsx",
      );
      const content = readFileSync(file, "utf8");
      writeFileSync(
        file,
        content.replace('title="Button"', 'status="stable" title="Button"'),
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("hand-written status prop"),
        ),
      ),
  ));
