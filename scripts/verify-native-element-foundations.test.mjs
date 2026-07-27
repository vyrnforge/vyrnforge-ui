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
  for (const entry of ["docs", "packages/ui-elements", "scripts"]) {
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

test("rejects an incomplete EL-6002 task", () => {
  const root = createFixture();
  try {
    const file = path.join(
      root,
      "docs/metadata/native-element-foundations.json",
    );
    const value = JSON.parse(readFileSync(file, "utf8"));
    value.tasks.find((task) => task.id === "EL-6002").status = "planned";
    writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

    assert(
      verifyNativeElementFoundations({ root }).some((failure) =>
        failure.includes("EL-6002 must be done"),
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

test("rejects missing update scheduling evidence", () => {
  const root = createFixture();
  try {
    const file = path.join(
      root,
      "packages/ui-elements/src/base/VyrnForgeElement.ts",
    );
    const content = readFileSync(file, "utf8").replace(
      "queueMicrotask",
      "scheduleLater",
    );
    writeFileSync(file, content);

    assert(
      verifyNativeElementFoundations({ root }).some((failure) =>
        failure.includes("must include queueMicrotask"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
