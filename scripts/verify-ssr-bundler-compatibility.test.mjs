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
import { verifySsrBundlerCompatibility } from "./verify-ssr-bundler-compatibility.mjs";
const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
function fixture(mutator, callback) {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-ssr-bundler-"));
  try {
    for (const entry of [
      "docs",
      "packages",
      "scripts",
      "tests",
      "package.json",
    ])
      cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
        recursive: true,
      });
    mutator?.(root);
    callback(verifySsrBundlerCompatibility({ root }));
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}
test("accepts the CF-7007 verified matrix", () =>
  fixture(null, (failures) => assert.deepEqual(failures, [])));
test("rejects missing React packed renderer", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "docs/metadata/ssr-bundler-compatibility.json",
      );
      const value = JSON.parse(readFileSync(file, "utf8"));
      value.bundlerMatrix.find((entry) => entry.consumer === "react").packages =
        value.bundlerMatrix
          .find((entry) => entry.consumer === "react")
          .packages.filter((name) => name !== "@vyrnforge/ui-components");
      writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
    },
    (failures) =>
      assert(
        failures.includes(
          "React build matrix must install packed @vyrnforge/ui-components",
        ),
      ),
  ));
test("rejects loss of the server-safe HTMLElement fallback", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "packages/ui-elements/src/base/VyrnForgeElement.ts",
      );
      writeFileSync(
        file,
        readFileSync(file, "utf8").replace(
          "globalThis.HTMLElement ??",
          "globalThis.HTMLElement ||",
        ),
      );
    },
    (failures) =>
      assert(
        failures.includes(
          "ui-elements base must retain the server-safe HTMLElement fallback",
        ),
      ),
  ));
test("rejects missing build-only mode", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "scripts/verify-consumer-foundations-runtime.mjs",
      );
      writeFileSync(
        file,
        readFileSync(file, "utf8").replace(
          '"--build-only"',
          '"--compile-only"',
        ),
      );
    },
    (failures) =>
      assert(failures.some((failure) => failure.includes("--build-only"))),
  ));
