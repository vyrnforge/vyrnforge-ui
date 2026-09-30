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

import { verifyFirstClassSurfaceVerification } from "./verify-first-class-surface-verification.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function fixture(mutator, callback) {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-first-class-"));
  try {
    for (const entry of ["docs", "packages", "tests", "scripts"]) {
      cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
        recursive: true,
      });
    }
    cpSync(
      path.join(repositoryRoot, "package.json"),
      path.join(root, "package.json"),
    );
    mutator?.(root);
    callback(verifyFirstClassSurfaceVerification({ root }));
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

test("accepts explicit equivalent obligations for all first-class surfaces", () => {
  assert.deepEqual(verifyFirstClassSurfaceVerification(), []);
});

test("rejects a silently omitted first-class surface", () =>
  fixture(
    (root) => {
      mutateJson(
        root,
        "docs/metadata/first-class-surface-verification.json",
        (value) => {
          value.surfaces = value.surfaces.filter(
            (surface) => surface.id !== "vue",
          );
        },
      );
    },
    (failures) => {
      assert(
        failures.some((failure) =>
          failure.includes("missing first-class surface vue"),
        ),
      );
    },
  ));

test("rejects root quality scripts that omit a first-class package", () =>
  fixture(
    (root) => {
      mutateJson(root, "package.json", (value) => {
        value.scripts.typecheck = value.scripts.typecheck.replace(
          " && npm run typecheck --workspace @vyrnforge/ui-angular",
          "",
        );
      });
    },
    (failures) => {
      assert(
        failures.some((failure) =>
          failure.includes("angular is omitted from root typecheck"),
        ),
      );
    },
  ));

test("rejects an unreasoned coverage-equivalent claim", () =>
  fixture(
    (root) => {
      mutateJson(
        root,
        "docs/metadata/first-class-surface-verification.json",
        (value) => {
          const angular = value.surfaces.find(
            (surface) => surface.id === "angular",
          );
          angular.coverage.rationale = "same enough";
          angular.coverage.evidence = [];
        },
      );
    },
    (failures) => {
      assert(
        failures.some((failure) =>
          failure.includes(
            "angular coverage-equivalent mode requires a concrete rationale",
          ),
        ),
      );
      assert(
        failures.some((failure) =>
          failure.includes("angular coverage-equivalent mode requires evidence"),
        ),
      );
    },
  ));

test("rejects product support rank drift", () =>
  fixture(
    (root) => {
      mutateJson(root, "docs/metadata/multi-framework.json", (value) => {
        value.frameworks.find(
          (framework) => framework.id === "native-html",
        ).supportLevel = "secondary";
      });
    },
    (failures) => {
      assert(
        failures.some((failure) =>
          failure.includes(
            "native-html architecture support must remain first-class",
          ),
        ),
      );
    },
  ));
