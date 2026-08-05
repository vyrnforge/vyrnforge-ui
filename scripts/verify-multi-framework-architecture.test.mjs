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

import { verifyMultiFrameworkArchitecture } from "./verify-multi-framework-architecture.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function withRepositoryFixture(mutator, callback) {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-multi-framework-"));
  try {
    for (const directory of ["docs", "tests/consumers"]) {
      cpSync(path.join(repositoryRoot, directory), path.join(root, directory), {
        recursive: true,
      });
    }
    mutator?.(root);
    callback(root);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

function mutateJson(root, relativePath, update) {
  const file = path.join(root, relativePath);
  const value = JSON.parse(readFileSync(file, "utf8"));
  update(value);
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

test("repository multi-framework architecture is internally consistent", () => {
  assert.deepEqual(verifyMultiFrameworkArchitecture(), []);
});

test("rejects promoting the data grid into the non-grid beta", () => {
  withRepositoryFixture(
    (root) => {
      mutateJson(root, "docs/metadata/multi-framework.json", (value) => {
        value.packages.find(
          (packageInfo) => packageInfo.name === "@vyrnforge/ui-data-grid",
        ).betaIncluded = true;
      });
    },
    (root) => {
      assert(
        verifyMultiFrameworkArchitecture({ root }).some((failure) =>
          failure.includes(
            "@vyrnforge/ui-data-grid betaIncluded must be false",
          ),
        ),
      );
    },
  );
});

test("rejects non-namespaced or non-composed public events", () => {
  withRepositoryFixture(
    (root) => {
      mutateJson(root, "docs/metadata/component-contracts.json", (value) => {
        value.eventVocabulary[0].name = "value-change";
        value.eventVocabulary[1].composed = false;
      });
    },
    (root) => {
      const failures = verifyMultiFrameworkArchitecture({ root });
      assert(
        failures.some((failure) =>
          failure.includes("invalid canonical event name"),
        ),
      );
      assert(
        failures.some((failure) =>
          failure.includes(
            "vf-open-change must bubble and cross composition boundaries",
          ),
        ),
      );
    },
  );
});

test("rejects missing consumer fixture examples", () => {
  withRepositoryFixture(
    (root) => {
      mutateJson(root, "tests/consumers/manifest.json", (value) => {
        value.fixtures.find((fixture) => fixture.id === "vue").exampleFiles = [
          "missing.vue",
        ];
      });
    },
    (root) => {
      assert(
        verifyMultiFrameworkArchitecture({ root }).some((failure) =>
          failure.includes("vue fixture example missing.vue is missing"),
        ),
      );
    },
  );
});
