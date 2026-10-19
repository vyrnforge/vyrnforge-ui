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

import { verifyVueConsumer } from "./verify-vue-consumer.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function withRepositoryFixture(mutator, callback) {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-vue-consumer-"));
  try {
    for (const entry of ["docs", "scripts", "tests", "package.json"]) {
      cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
        recursive: true,
      });
    }
    mutator?.(root);
    callback(verifyVueConsumer({ root }));
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

function mutateJson(root, relativePath, mutator) {
  const file = path.join(root, relativePath);
  const value = JSON.parse(readFileSync(file, "utf8"));
  mutator(value);
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

test("accepts the verified Vue consumer implementation", () => {
  withRepositoryFixture(null, (failures) => {
    assert.deepEqual(failures, []);
  });
});

test("rejects a regressed Vue support claim", () => {
  withRepositoryFixture(
    (root) => {
      mutateJson(root, "tests/consumers/vue/fixture.json", (value) => {
        value.supportClaim = "architecture-fixture-only";
      });
    },
    (failures) => {
      assert(
        failures.some((failure) =>
          failure.includes("support claim must be packed-vue-runtime-verified"),
        ),
      );
    },
  );
});

test("rejects workspace VyrnForge dependencies in the Vue fixture", () => {
  withRepositoryFixture(
    (root) => {
      mutateJson(root, "tests/consumers/vue/package.json", (value) => {
        value.dependencies["@vyrnforge/ui-elements"] = "workspace:*";
      });
    },
    (failures) => {
      assert(
        failures.includes(
          "Vue fixture must receive VyrnForge packages from runtime tarballs",
        ),
      );
    },
  );
});

test("rejects missing Vue custom-element compiler recognition", () => {
  withRepositoryFixture(
    (root) => {
      const file = path.join(root, "tests/consumers/vue/vite.config.ts");
      writeFileSync(
        file,
        readFileSync(file, "utf8").replace("isCustomElement", "customTag"),
      );
    },
    (failures) => {
      assert(
        failures.includes("Vue compiler config is missing isCustomElement"),
      );
    },
  );
});

test("rejects an invalid v-model adapter decision", () => {
  withRepositoryFixture(
    (root) => {
      mutateJson(root, "docs/metadata/vue-consumer.json", (value) => {
        value.modelAdapterDecision.status = "not-needed";
      });
    },
    (failures) => {
      assert(failures.includes("Vue model adapter decision status is invalid"));
    },
  );
});

test("rejects a missing Vue template type bridge", () => {
  withRepositoryFixture(
    (root) => {
      rmSync(
        path.join(root, "tests/consumers/vue/src/vyrnforge-elements.d.ts"),
      );
    },
    (failures) => {
      assert(
        failures.includes(
          "required Vue consumer file is missing: tests/consumers/vue/src/vyrnforge-elements.d.ts",
        ),
      );
    },
  );
});
