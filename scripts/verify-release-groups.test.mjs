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
import { verifyReleaseGroups } from "./verify-release-groups.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const fixtureEntries = [
  ".github",
  "docs",
  "packages",
  "scripts",
  "package-lock.json",
  "package.json",
];

function fixture(mutator, callback) {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-release-groups-"));
  try {
    for (const entry of fixtureEntries) {
      cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
        recursive: true,
      });
    }
    mutator?.(root);
    callback(verifyReleaseGroups({ root }));
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

test("accepts the generalized release metadata", () =>
  fixture(null, (failures) => assert.deepEqual(failures, [])));

test("rejects malformed schema metadata", () =>
  fixture(
    (root) =>
      mutateJson(root, "docs/metadata/release-groups.json", (value) => {
        value.schemaVersion = 99;
      }),
    (failures) =>
      assert(
        failures.some((failure) => failure.includes("schemaVersion must be 2")),
      ),
  ));

test("rejects duplicate package classification", () =>
  fixture(
    (root) =>
      mutateJson(root, "docs/metadata/release-groups.json", (value) => {
        const [firstLine, secondLine] = Object.values(value.releaseLines);
        secondLine.packages.push(firstLine.packages[0]);
      }),
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("classified more than once"),
        ),
      ),
  ));

test("rejects package ordering errors", () =>
  fixture(
    (root) =>
      mutateJson(root, "docs/metadata/release-groups.json", (value) => {
        const releaseLine = Object.values(value.releaseLines).find(
          (candidate) => candidate.packages.length > 1,
        );
        releaseLine.packages.reverse();
      }),
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("must appear earlier in release order"),
        ),
      ),
  ));

test("rejects invalid release dependency references", () =>
  fixture(
    (root) =>
      mutateJson(root, "docs/metadata/release-groups.json", (value) => {
        const releaseLine = Object.values(value.releaseLines).find(
          (candidate) => candidate.releaseDependencies.length > 0,
        );
        releaseLine.releaseDependencies[0].releaseLine = "missing-line";
      }),
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("unknown release dependency"),
        ),
      ),
  ));

test("rejects package version drift", () =>
  fixture(
    (root) => {
      const manifest = JSON.parse(
        readFileSync(
          path.join(root, "docs/metadata/release-groups.json"),
          "utf8",
        ),
      );
      const packageInfo = Object.values(manifest.releaseLines)[0].packages[0];
      mutateJson(root, path.join(packageInfo.directory, "package.json"), (value) => {
        value.version = "9.9.9-alpha.1";
      });
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("package version must be"),
        ),
      ),
  ));

test("rejects inconsistent dependency declarations", () =>
  fixture(
    (root) =>
      mutateJson(root, "docs/metadata/release-groups.json", (value) => {
        const releaseLine = Object.values(value.releaseLines).find(
          (candidate) =>
            candidate.packages.some(
              (packageInfo) =>
                Object.keys(packageInfo.dependencies ?? {}).length > 0,
            ),
        );
        const packageInfo = releaseLine.packages.find(
          (candidate) => Object.keys(candidate.dependencies ?? {}).length > 0,
        );
        const dependencyName = Object.keys(packageInfo.dependencies)[0];
        packageInfo.dependencies[dependencyName] = "0.0.0-invalid";
      }),
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("metadata dependency"),
        ),
      ),
  ));

test("rejects release tooling that drops release-group selection", () =>
  fixture(
    (root) => {
      const workflowPath = path.join(root, ".github/workflows/release.yml");
      const workflow = readFileSync(workflowPath, "utf8").replaceAll(
        '--release-group "$RELEASE_GROUP"',
        '--release-group "hard-coded"',
      );
      writeFileSync(workflowPath, workflow);
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes('--release-group "$RELEASE_GROUP"'),
        ),
      ),
  ));
