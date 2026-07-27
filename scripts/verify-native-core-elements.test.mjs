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
import { verifyNativeCoreElements } from "./verify-native-core-elements.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function createFixture() {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-native-core-"));
  for (const entry of [
    "apps/regression-fixtures",
    "docs",
    "packages/ui-elements",
    "scripts",
    "tests/browser",
  ]) {
    cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
      recursive: true,
    });
  }
  cpSync(
    path.join(repositoryRoot, "package.json"),
    path.join(root, "package.json"),
  );
  return root;
}

function mutateJson(root, relativePath, mutate) {
  const file = path.join(root, relativePath);
  const value = JSON.parse(readFileSync(file, "utf8"));
  mutate(value);
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

test("repository native core elements are internally complete", () => {
  assert.deepEqual(verifyNativeCoreElements(), []);
});

test("rejects an incomplete EL-6011 task", () => {
  const root = createFixture();
  try {
    mutateJson(root, "docs/metadata/native-core-elements.json", (value) => {
      value.tasks.find((task) => task.id === "EL-6011").status = "planned";
    });
    assert(
      verifyNativeCoreElements({ root }).some((failure) =>
        failure.includes("EL-6011 must be done"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects a missing public tag", () => {
  const root = createFixture();
  try {
    mutateJson(root, "docs/metadata/native-core-elements.json", (value) => {
      value.registration.tags.pop();
      value.registration.count = 39;
    });
    assert(
      verifyNativeCoreElements({ root }).some((failure) =>
        failure.includes("registration count must be 40"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects a framework runtime dependency", () => {
  const root = createFixture();
  try {
    mutateJson(root, "packages/ui-elements/package.json", (value) => {
      value.dependencies.react = "19.0.0";
    });
    assert(
      verifyNativeCoreElements({ root }).some((failure) =>
        failure.includes("runtime dependencies must remain"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects missing shared action behavior", () => {
  const root = createFixture();
  try {
    const file = path.join(
      root,
      "packages/ui-elements/src/components/actions.ts",
    );
    writeFileSync(
      file,
      readFileSync(file, "utf8").replaceAll(
        "resolveActionState",
        "resolveLocalActionState",
      ),
    );
    assert(
      verifyNativeCoreElements({ root }).some((failure) =>
        failure.includes("must include resolveActionState"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects missing browser form evidence", () => {
  const root = createFixture();
  try {
    const file = path.join(
      root,
      "apps/regression-fixtures/src/nativeCoreElements.tsx",
    );
    writeFileSync(
      file,
      readFileSync(file, "utf8").replace("new FormData", "readFormData"),
    );
    assert(
      verifyNativeCoreElements({ root }).some((failure) =>
        failure.includes("must include new FormData"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
