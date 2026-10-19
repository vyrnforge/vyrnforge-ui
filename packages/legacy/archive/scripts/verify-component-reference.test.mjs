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
  const root = mkdtempSync(path.join(tmpdir(), "vf-consumer-knowledge-"));
  try {
    for (const entry of ["apps", "docs", "packages", "scripts"]) {
      const source = path.join(repositoryRoot, entry);
      const target = path.join(root, entry);
      cpSync(source, target, { recursive: true });
    }
    mutator?.(root);
    callback(verifyComponentReference({ root }));
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

function hasFailure(failures, message) {
  return failures.some((failure) => failure.includes(message));
}

test("accepts unified Docs reference", () => {
  fixture(null, (failures) => {
    assert.deepEqual(failures, []);
  });
});

test("rejects stale consumer knowledge", () => {
  fixture(
    (root) => {
      const file = path.join(root, "docs/generated/consumer-knowledge.json");
      const value = JSON.parse(readFileSync(file, "utf8"));
      value.components.pop();
      writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
    },
    (failures) => {
      assert(hasFailure(failures, "consumer knowledge is stale"));
    },
  );
});

test("rejects a missing component context slice", () => {
  fixture(
    (root) => {
      const file = path.join(
        root,
        "docs/generated/ai-context/components/button.json",
      );
      unlinkSync(file);
    },
    (failures) => {
      assert(hasFailure(failures, "button AI component context is missing"));
    },
  );
});

test("rejects generated Angular status drift", () => {
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
    (failures) => {
      assert(hasFailure(failures, "component reference is stale"));
    },
  );
});

test("rejects drifted Docs component links", () => {
  fixture(
    (root) => {
      const file = path.join(root, "apps/docs/src/ComponentReferencePage.tsx");
      const source = readFileSync(file, "utf8");
      const next = source.replace(
        'getReferenceRecordRoute(referenceModel, "components", componentId)',
        'getReferenceRecordRoute(referenceModel, "component", componentId)',
      );
      assert.notEqual(next, source, "fixture needs the component detail route");
      writeFileSync(file, next);
    },
    (failures) => {
      const message = "generated component route composition is missing";
      assert(hasFailure(failures, message));
    },
  );
});
