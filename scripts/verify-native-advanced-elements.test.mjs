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
import { verifyNativeAdvancedElements } from "./verify-native-advanced-elements.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function createFixture() {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-native-advanced-"));
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

test("repository native advanced elements are internally complete", () => {
  assert.deepEqual(verifyNativeAdvancedElements(), []);
});

test("rejects an incomplete EL-6017 task", () => {
  const root = createFixture();
  try {
    mutateJson(root, "docs/metadata/native-advanced-elements.json", (value) => {
      value.tasks.find((task) => task.id === "EL-6017").status = "planned";
    });
    assert(
      verifyNativeAdvancedElements({ root }).some((failure) =>
        failure.includes("EL-6017 must be done"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects an incorrect 54-tag total", () => {
  const root = createFixture();
  try {
    mutateJson(root, "docs/metadata/native-advanced-elements.json", (value) => {
      value.registration.totalCount = 53;
    });
    assert(
      verifyNativeAdvancedElements({ root }).some((failure) =>
        failure.includes("40 + 14 = 54"),
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
      verifyNativeAdvancedElements({ root }).some((failure) =>
        failure.includes("runtime dependencies must remain"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects missing shared collection behavior", () => {
  const root = createFixture();
  try {
    const file = path.join(
      root,
      "packages/ui-elements/src/components/collections.ts",
    );
    writeFileSync(
      file,
      readFileSync(file, "utf8").replaceAll(
        "createAutocompleteController",
        "createLocalAutocompleteController",
      ),
    );
    assert(
      verifyNativeAdvancedElements({ root }).some((failure) =>
        failure.includes("must include createAutocompleteController"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects missing browser collection evidence", () => {
  const root = createFixture();
  try {
    const file = path.join(
      root,
      "apps/regression-fixtures/src/nativeAdvancedElements.tsx",
    );
    writeFileSync(
      file,
      readFileSync(file, "utf8").replace("new FormData", "readFormData"),
    );
    assert(
      verifyNativeAdvancedElements({ root }).some((failure) =>
        failure.includes("must include new FormData"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
