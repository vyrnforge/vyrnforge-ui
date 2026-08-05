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

import { verifyGmf1Closure } from "./verify-gmf1-closure.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

test("repository GMF1 evidence is internally complete", () => {
  assert.deepEqual(verifyGmf1Closure(), []);
});

test("rejects an incomplete GMF1 task", () => {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-gmf1-"));
  try {
    for (const directory of ["docs", "packages", "tests/consumers"])
      cpSync(path.join(repositoryRoot, directory), path.join(root, directory), {
        recursive: true,
      });
    const file = path.join(root, "docs/metadata/gmf1-closure.json");
    const value = JSON.parse(readFileSync(file, "utf8"));
    value.tasks.find((task) => task.id === "MF-4012").status = "pending";
    writeFileSync(
      file,
      `${JSON.stringify(value, null, 2)}
`,
    );
    assert(
      verifyGmf1Closure({ root }).some((failure) =>
        failure.includes("MF-4012 must be done"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
