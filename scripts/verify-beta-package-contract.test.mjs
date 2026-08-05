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

import {
  buildBetaPackageContract,
  validatePackageManifest,
  validatePackedFiles,
  writeBetaPackageContract,
} from "./beta-package-artifacts.mjs";
import { verifyBetaPackageContract } from "./verify-beta-package-contract.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const fixtureEntries = [
  ".github",
  "docs",
  "packages",
  "scripts",
  "tests/beta-package-consumer",
  "package.json",
];

function fixture(mutator, callback) {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-beta-artifacts-"));
  try {
    for (const entry of fixtureEntries) {
      cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
        recursive: true,
      });
    }
    mutator?.(root);
    callback(verifyBetaPackageContract({ root }));
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

test("accepts the BT-8003 beta package artifact contract", () =>
  fixture(null, (failures) => assert.deepEqual(failures, [])));

test("rejects beta package version drift", () =>
  fixture(
    (root) => {
      mutateJson(root, "packages/ui-elements/package.json", (value) => {
        value.version = "0.2.0-beta.3";
      });
    },
    (failures) =>
      assert(failures.some((failure) => failure.includes("version must be"))),
  ));

test("rejects an undocumented public entry point", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "docs/release/beta-package-artifact-verification.md",
      );
      writeFileSync(
        file,
        readFileSync(file, "utf8").replace(
          /^- `@vyrnforge\/ui-elements\/register`\r?\n/mu,
          "",
        ),
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("missing @vyrnforge/ui-elements/register"),
        ),
      ),
  ));

test("rejects an export that points into package source", () =>
  fixture(
    (root) => {
      mutateJson(root, "packages/ui-core/package.json", (value) => {
        value.exports["./internal"] = "./src/index.ts";
      });
      writeBetaPackageContract({ root });
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("must not point to source"),
        ),
      ),
  ));

test("rejects missing and forbidden tarball files", () => {
  const packageRecord = buildBetaPackageContract().packages[0];
  const failures = validatePackedFiles(packageRecord, [
    "package.json",
    "README.md",
    "LICENSE",
    "src/index.ts",
  ]);
  assert(failures.some((failure) => failure.includes("tarball is missing")));
  assert(
    failures.some((failure) => failure.includes("forbidden tarball file")),
  );
});

test("rejects workspace or local published dependencies", () => {
  const packageRecord = buildBetaPackageContract().packages[1];
  const packageJson = JSON.parse(
    readFileSync(
      path.join(repositoryRoot, packageRecord.directory, "package.json"),
      "utf8",
    ),
  );
  packageJson.dependencies["@vyrnforge/ui-core"] = "workspace:*";
  const failures = validatePackageManifest(packageRecord, packageJson);
  assert(
    failures.some((failure) =>
      failure.includes("must not use a workspace or local dependency spec"),
    ),
  );
});

test("rejects consumer source imports that bypass public packages", () =>
  fixture(
    (root) => {
      const file = path.join(root, "tests/beta-package-consumer/src/main.tsx");
      writeFileSync(
        file,
        `${readFileSync(file, "utf8")}\nimport "../../packages/ui-core/src/index";\n`,
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("consumer must use public package entry points"),
        ),
      ),
  ));
