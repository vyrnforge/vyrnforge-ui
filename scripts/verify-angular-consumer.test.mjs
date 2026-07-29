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

import { verifyAngularConsumer } from "./verify-angular-consumer.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function withRepositoryFixture(mutator, callback) {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-angular-consumer-"));
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

test("repository Angular consumer evidence is internally complete", () => {
  assert.deepEqual(verifyAngularConsumer(), []);
});

test("rejects a downgraded Angular fixture claim", () => {
  withRepositoryFixture(
    (root) => {
      mutateJson(root, "tests/consumers/angular/fixture.json", (value) => {
        value.supportClaim = "architecture-fixture-only";
      });
    },
    (root) => {
      assert(
        verifyAngularConsumer({ root }).some((failure) =>
          failure.includes(
            "support claim must be packed-angular-runtime-verified",
          ),
        ),
      );
    },
  );
});

test("rejects an incompatible Angular TypeScript line", () => {
  withRepositoryFixture(
    (root) => {
      mutateJson(root, "tests/consumers/angular/package.json", (value) => {
        value.devDependencies.typescript = "7.0.2";
      });
    },
    (root) => {
      assert(
        verifyAngularConsumer({ root }).some((failure) =>
          failure.includes("TypeScript must be pinned to 6.0.2"),
        ),
      );
    },
  );
});

test("rejects missing Custom Element schema configuration", () => {
  withRepositoryFixture(
    (root) => {
      const file = path.join(
        root,
        "tests/consumers/angular/src/app/app.component.ts",
      );
      const value = readFileSync(file, "utf8").replace(
        "schemas: [CUSTOM_ELEMENTS_SCHEMA],",
        "schemas: [],",
      );
      writeFileSync(file, value);
    },
    (root) => {
      assert(
        verifyAngularConsumer({ root }).some((failure) =>
          failure.includes("schemas: [CUSTOM_ELEMENTS_SCHEMA]"),
        ),
      );
    },
  );
});

test("rejects deprecated Angular fixture compiler options", () => {
  withRepositoryFixture(
    (root) => {
      mutateJson(root, "tests/consumers/angular/tsconfig.json", (value) => {
        value.compilerOptions.baseUrl = "./";
      });
    },
    (root) => {
      assert(
        verifyAngularConsumer({ root }).some((failure) =>
          failure.includes("deprecated compiler option baseUrl"),
        ),
      );
    },
  );
});

test("rejects missing Angular global VyrnForge styles", () => {
  withRepositoryFixture(
    (root) => {
      const file = path.join(root, "tests/consumers/angular/src/styles.css");
      const value = readFileSync(file, "utf8").replace(
        '@import "@vyrnforge/ui-elements/styles/index.css";\n',
        "",
      );
      writeFileSync(file, value);
    },
    (root) => {
      assert(
        verifyAngularConsumer({ root }).some((failure) =>
          failure.includes(
            'Angular styles are missing @import "@vyrnforge/ui-elements/styles/index.css";',
          ),
        ),
      );
    },
  );
});

test("rejects Angular runtime leakage into ui-elements", () => {
  withRepositoryFixture(
    (root) => {
      mutateJson(root, "packages/ui-elements/package.json", (value) => {
        value.dependencies["@angular/core"] = "22.0.8";
      });
    },
    (root) => {
      assert(
        verifyAngularConsumer({ root }).some((failure) =>
          failure.includes("must not depend on @angular/core"),
        ),
      );
    },
  );
});
