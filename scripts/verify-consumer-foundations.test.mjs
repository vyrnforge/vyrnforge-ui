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

import { verifyConsumerFoundations } from "./verify-consumer-foundations.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function withRepositoryFixture(mutator, callback) {
  const root = mkdtempSync(
    path.join(tmpdir(), "vyrnforge-consumer-foundation-"),
  );
  try {
    for (const entry of [
      "docs",
      "packages",
      "tests/consumers",
      "scripts",
      "package.json",
    ]) {
      cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
        recursive: true,
      });
    }
    mutator?.(root);
    callback(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function mutateJson(root, relativePath, update) {
  const file = path.join(root, relativePath);
  const value = JSON.parse(readFileSync(file, "utf8"));
  update(value);
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

test("repository consumer foundation evidence is internally complete", () => {
  assert.deepEqual(verifyConsumerFoundations(), []);
});

test("rejects an incomplete consumer task", () => {
  withRepositoryFixture(
    (root) => {
      mutateJson(root, "docs/metadata/consumer-foundations.json", (value) => {
        value.tasks.find((task) => task.id === "CF-7002").status =
          "in-progress";
      });
    },
    (root) => {
      assert(
        verifyConsumerFoundations({ root }).some((failure) =>
          failure.includes("CF-7002 must be done"),
        ),
      );
    },
  );
});

test("rejects stale Custom Elements metadata", () => {
  withRepositoryFixture(
    (root) => {
      mutateJson(root, "packages/ui-elements/custom-elements.json", (value) => {
        value.modules[0].declarations = value.modules[0].declarations.filter(
          (declaration) => declaration.tagName !== "vf-button",
        );
      });
    },
    (root) => {
      assert(
        verifyConsumerFoundations({ root }).some((failure) =>
          failure.includes("custom-elements.json is missing vf-button"),
        ),
      );
    },
  );
});

test("rejects a React dependency in the native package", () => {
  withRepositoryFixture(
    (root) => {
      mutateJson(root, "packages/ui-elements/package.json", (value) => {
        value.dependencies.react = "19.2.7";
      });
    },
    (root) => {
      assert(
        verifyConsumerFoundations({ root }).some((failure) =>
          failure.includes("must not acquire a React dependency"),
        ),
      );
    },
  );
});
