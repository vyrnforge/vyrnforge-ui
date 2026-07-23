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

import { verifyBehaviorFoundations } from "./verify-behavior-foundations.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function createFixture() {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-behaviors-"));
  for (const entry of ["docs", "packages/ui-behaviors", "scripts"]) {
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

test("repository behavior foundations are internally complete", () => {
  assert.deepEqual(verifyBehaviorFoundations(), []);
});

test("rejects an incomplete task record", () => {
  const root = createFixture();
  try {
    const file = path.join(root, "docs/metadata/behavior-foundations.json");
    const value = JSON.parse(readFileSync(file, "utf8"));
    value.tasks.find((task) => task.id === "MF-5003").status = "pending";
    writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

    assert(
      verifyBehaviorFoundations({ root }).some((failure) =>
        failure.includes("MF-5003 must be done"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects a DOM-enabled ui-behaviors TypeScript configuration", () => {
  const root = createFixture();
  try {
    const file = path.join(root, "packages/ui-behaviors/tsconfig.json");
    const value = JSON.parse(readFileSync(file, "utf8"));
    value.compilerOptions.lib.push("DOM");
    writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

    assert(
      verifyBehaviorFoundations({ root }).some((failure) =>
        failure.includes("TypeScript lib must remain ES2020 only"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects missing quality integration", () => {
  const root = createFixture();
  try {
    const file = path.join(root, "package.json");
    const value = JSON.parse(readFileSync(file, "utf8"));
    value.scripts["verify:metadata"] =
      "npm run verify:component-metadata && npm run verify:multi-framework";
    writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

    assert(
      verifyBehaviorFoundations({ root }).some((failure) =>
        failure.includes("verify:metadata must include behavior-foundations"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
