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
        "examples/basic-playground/src/pages/reference/GeneratedComponentPage.tsx",
      );
      const content = readFileSync(file, "utf8");
      const next = content.replace(
        "title={component.displayName}",
        'status="stable" title={component.displayName}',
      );
      assert.notEqual(
        next,
        content,
        "fixture needs the generated component page",
      );
      writeFileSync(file, next);
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("hand-written status prop"),
        ),
      ),
  ));

test("rejects canonical native API tags dropped from the reference projection", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "examples/basic-playground/src/data/referenceMetadata.ts",
      );
      const content = readFileSync(file, "utf8");
      const next = content.replace("...canonicalNativeElementEntries,", "");
      assert.notEqual(
        next,
        content,
        "fixture needs the canonical native element projection",
      );
      writeFileSync(file, next);
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("reference metadata projection is missing"),
        ),
      ),
  ));

test("rejects catalog links that drift from generated detail paths", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "examples/basic-playground/src/app/routes.ts",
      );
      const content = readFileSync(file, "utf8");
      const next = content.replace(
        'getReferenceRecordRoute(referenceModel, "components", id)',
        'getReferenceRecordRoute(referenceModel, "component", id)',
      );
      assert.notEqual(
        next,
        content,
        "fixture needs the component detail route",
      );
      writeFileSync(file, next);
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("generated component route composition is missing"),
        ),
      ),
  ));
