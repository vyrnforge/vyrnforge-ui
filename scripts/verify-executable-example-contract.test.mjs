import assert from "node:assert/strict";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { verifyExecutableExampleContract } from "./verify-executable-example-contract.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function fixtureRepository() {
  const root = mkdtempSync(
    path.join(os.tmpdir(), "vyrnforge-example-contract-"),
  );
  for (const relativePath of [
    "docs/metadata/executable-examples.json",
    "tests/consumers",
    "examples/basic-playground/src",
  ]) {
    cpSync(
      path.join(repositoryRoot, relativePath),
      path.join(root, relativePath),
      {
        recursive: true,
      },
    );
  }
  return root;
}

test("current repository satisfies the cross-framework executable example contract", () => {
  assert.deepEqual(verifyExecutableExampleContract(), []);
});

test("rejects a framework example that loses runtime verification", () => {
  const root = fixtureRepository();
  try {
    const metadataPath = path.join(
      root,
      "docs/metadata/executable-examples.json",
    );
    const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
    metadata.frameworks.vue.verification = ["typecheck", "build"];
    writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
    assert.match(
      verifyExecutableExampleContract({ root }).join("\n"),
      /vue: missing runtime example verification/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
