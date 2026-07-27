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

import { verifyGmf2Closure } from "./verify-gmf2-closure.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

test("repository GMF2 evidence is internally complete", () => {
  assert.deepEqual(verifyGmf2Closure(), []);
});

test("rejects an incomplete GMF2 task", () => {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-gmf2-"));
  try {
    for (const entry of ["docs", "packages", "scripts", "package.json"]) {
      cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
        recursive: true,
      });
    }
    const file = path.join(root, "docs/metadata/gmf2-closure.json");
    const value = JSON.parse(readFileSync(file, "utf8"));
    value.tasks.find((task) => task.id === "MF-5016").status = "pending";
    writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
    assert(
      verifyGmf2Closure({ root }).some((failure) =>
        failure.includes("MF-5016 must be done"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
