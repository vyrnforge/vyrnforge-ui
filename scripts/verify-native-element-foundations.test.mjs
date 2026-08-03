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

import { verifyNativeElementFoundations } from "./verify-native-element-foundations.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function createFixture() {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-native-elements-"));
  for (const entry of [
    "apps/regression-fixtures",
    "docs",
    "packages/ui-elements",
    "scripts",
    "tests/browser",
    "tests/consumers/native-html",
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

test("repository native element foundations are internally complete", () => {
  assert.deepEqual(verifyNativeElementFoundations(), []);
});

test("rejects an incomplete EL-6004 task", () => {
  const root = createFixture();
  try {
    const file = path.join(
      root,
      "docs/metadata/native-element-foundations.json",
    );
    const value = JSON.parse(readFileSync(file, "utf8"));
    value.tasks.find((task) => task.id === "EL-6004").status = "planned";
    writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

    assert(
      verifyNativeElementFoundations({ root }).some((failure) =>
        failure.includes("EL-6004 must be done"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects a framework dependency in ui-elements", () => {
  const root = createFixture();
  try {
    const file = path.join(root, "packages/ui-elements/package.json");
    const value = JSON.parse(readFileSync(file, "utf8"));
    value.dependencies.react = "19.0.0";
    writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

    assert(
      verifyNativeElementFoundations({ root }).some((failure) =>
        failure.includes("runtime dependencies must remain"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects missing typed event defaults", () => {
  const root = createFixture();
  try {
    const file = path.join(root, "packages/ui-elements/src/events.ts");
    const content = readFileSync(file, "utf8").replace(
      "bubbles: options.bubbles ?? true",
      "bubbles: false",
    );
    writeFileSync(file, content);

    assert(
      verifyNativeElementFoundations({ root }).some((failure) =>
        failure.includes("must include bubbles: options.bubbles ?? true"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects missing ElementInternals form association", () => {
  const root = createFixture();
  try {
    const file = path.join(
      root,
      "packages/ui-elements/src/base/VyrnForgeFormAssociatedElement.ts",
    );
    const content = readFileSync(file, "utf8").replaceAll(
      "ElementInternals",
      "NativeInternals",
    );
    writeFileSync(file, content);

    assert(
      verifyNativeElementFoundations({ root }).some((failure) =>
        failure.includes("must include ElementInternals"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects missing real-form browser evidence", () => {
  const root = createFixture();
  try {
    const file = path.join(root, "apps/regression-fixtures/src/FixtureApp.tsx");
    const content = readFileSync(file, "utf8").replace(
      "new FormData",
      "readFormData",
    );
    writeFileSync(file, content);

    assert(
      verifyNativeElementFoundations({ root }).some((failure) =>
        failure.includes("must include new FormData"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("accepts later sprints without weakening the S7 minimum", () => {
  const laterRoot = createFixture();
  try {
    const file = path.join(laterRoot, "docs/metadata/multi-framework.json");
    const value = JSON.parse(readFileSync(file, "utf8"));
    value.program.currentSprint = "S9";
    writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

    assert(
      !verifyNativeElementFoundations({ root: laterRoot }).some((failure) =>
        failure.includes("currentSprint"),
      ),
    );
  } finally {
    rmSync(laterRoot, { recursive: true, force: true });
  }

  const regressedRoot = createFixture();
  try {
    const file = path.join(regressedRoot, "docs/metadata/multi-framework.json");
    const value = JSON.parse(readFileSync(file, "utf8"));
    value.program.currentSprint = "S6";
    writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

    assert(
      verifyNativeElementFoundations({ root: regressedRoot }).some((failure) =>
        failure.includes("currentSprint must not regress before S7"),
      ),
    );
  } finally {
    rmSync(regressedRoot, { recursive: true, force: true });
  }
});
