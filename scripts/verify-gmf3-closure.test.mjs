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

import { verifyGmf3Closure } from "./verify-gmf3-closure.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function createFixture() {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-gmf3-"));
  for (const entry of [
    ".ai",
    "apps/regression-fixtures",
    "docs",
    "examples",
    "packages",
    "scripts",
    "tests/browser",
    "tests/consumers",
    "package.json",
  ]) {
    cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
      recursive: true,
    });
  }
  return root;
}

function mutateJson(root, relativePath, update) {
  const file = path.join(root, relativePath);
  const value = JSON.parse(readFileSync(file, "utf8"));
  update(value);
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

test("repository GMF3 evidence is internally complete", () => {
  assert.deepEqual(verifyGmf3Closure(), []);
});

test("rejects an incomplete EL-6018 task", () => {
  const root = createFixture();
  try {
    mutateJson(root, "docs/metadata/gmf3-closure.json", (value) => {
      value.tasks.find((task) => task.id === "EL-6018").status = "pending";
    });
    assert(
      verifyGmf3Closure({ root }).some((failure) =>
        failure.includes("EL-6018 must be done"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects a public component with planned native parity", () => {
  const root = createFixture();
  try {
    mutateJson(root, "docs/metadata/components.json", (value) => {
      value.components.find(
        (component) => component.id === "icon",
      ).frameworkParity.native.status = "planned-s6";
    });
    assert(
      verifyGmf3Closure({ root }).some((failure) =>
        failure.includes("icon native parity status must be current"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects a stale native tag count", () => {
  const root = createFixture();
  try {
    mutateJson(root, "docs/metadata/gmf3-closure.json", (value) => {
      value.catalogCoverage.nativeRegisteredTags = 57;
    });
    assert(
      verifyGmf3Closure({ root }).some((failure) =>
        failure.includes("must record 58 native tags"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
