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
import { verifyCrossFrameworkBrowserMatrix } from "./verify-cross-framework-browser-matrix.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function fixture(mutator, callback) {
  const root = mkdtempSync(
    path.join(tmpdir(), "vyrnforge-cross-framework-matrix-"),
  );
  try {
    for (const entry of [".github", "docs", "scripts", "package.json"]) {
      cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
        recursive: true,
      });
    }
    mutator?.(root);
    callback(verifyCrossFrameworkBrowserMatrix({ root }));
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

test("accepts the CF-7009 runtime-ready matrix", () =>
  fixture(null, (failures) => assert.deepEqual(failures, [])));

test("rejects a missing Vue consumer", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "docs/metadata/cross-framework-browser-matrix.json",
      );
      const value = JSON.parse(readFileSync(file, "utf8"));
      value.consumers = value.consumers.filter(
        (consumer) => consumer !== "vue",
      );
      writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
    },
    (failures) => assert(failures.includes("CF-7009 matrix is missing vue")),
  ));

test("rejects a runtime without trace support", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "scripts/verify-consumer-foundations-runtime.mjs",
      );
      writeFileSync(
        file,
        readFileSync(file, "utf8").replaceAll("--trace-dir", "--trace-output"),
      );
    },
    (failures) =>
      assert(failures.some((failure) => failure.includes("--trace-dir"))),
  ));

test("rejects a runtime without rendered-status synchronization", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "scripts/verify-consumer-foundations-runtime.mjs",
      );
      writeFileSync(
        file,
        readFileSync(file, "utf8").replaceAll(
          "waitForSharedMatrixStatus",
          "readSharedMatrixStatus",
        ),
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("waitForSharedMatrixStatus"),
        ),
      ),
  ));

test("rejects a runtime without POSIX preview process-group cleanup", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "scripts/verify-consumer-foundations-runtime.mjs",
      );
      writeFileSync(
        file,
        readFileSync(file, "utf8")
          .replace(
            'detached: process.platform !== "win32",',
            "detached: false,",
          )
          .replace(
            "process.kill(-processHandle.pid, signal);",
            "processHandle.kill(signal);",
          )
          .replace("server.stdout?.destroy();", "void server.stdout;"),
      );
    },
    (failures) => {
      assert(
        failures.some((failure) =>
          failure.includes('detached: process.platform !== "win32"'),
        ),
      );
      assert(
        failures.some((failure) =>
          failure.includes("process.kill(-processHandle.pid"),
        ),
      );
      assert(
        failures.some((failure) =>
          failure.includes("server.stdout?.destroy()"),
        ),
      );
    },
  ));
