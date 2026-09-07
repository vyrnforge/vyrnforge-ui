import assert from "node:assert/strict";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { verifyAngularSupportEvidence } from "./angular-support-evidence.mjs";
import { applyDependencyOverrides } from "./compatibility-release-matrix.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function angularEvidenceFixture(mutator, callback) {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-angular-evidence-"));
  try {
    for (const entry of [".github", "docs"]) {
      cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
        recursive: true,
      });
    }
    for (const entry of ["packages/ui-angular", "tests/consumers/angular"]) {
      mkdirSync(path.dirname(path.join(root, entry)), { recursive: true });
      cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
        recursive: true,
      });
    }
    mkdirSync(path.join(root, "scripts"), { recursive: true });
    cpSync(
      path.join(repositoryRoot, "scripts/verify-angular-packed-fixture-ownership.mjs"),
      path.join(root, "scripts/verify-angular-packed-fixture-ownership.mjs"),
    );
    mutator?.(root);
    callback(verifyAngularSupportEvidence({ root }));
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

test("applies exact framework overrides without removing fixture tooling", () => {
  const original = {
    dependencies: { react: "19.2.7", "react-dom": "19.2.7" },
    devDependencies: { vite: "8.1.5", typescript: "7.0.2" },
  };
  const next = applyDependencyOverrides(original, {
    dependencies: { react: "18.3.1", "react-dom": "18.3.1" },
    devDependencies: { "@types/react": "18.3.31" },
  });
  assert.equal(next.dependencies.react, "18.3.1");
  assert.equal(next.devDependencies.vite, "8.1.5");
  assert.equal(next.devDependencies["@types/react"], "18.3.31");
  assert.equal(original.dependencies.react, "19.2.7");
});

test("preserves dependency groups that are not overridden", () => {
  const original = {
    dependencies: { vue: "3.5.40" },
    peerDependencies: { example: "1.0.0" },
  };
  const next = applyDependencyOverrides(original, {
    dependencies: { vue: "3.4.38" },
  });
  assert.deepEqual(next.peerDependencies, { example: "1.0.0" });
});

test("accepts the first-class Angular 22 compatibility and accessibility evidence", () =>
  angularEvidenceFixture(null, (failures) => assert.deepEqual(failures, [])));

test("rejects widening the Angular support claim beyond the public peer range", () =>
  angularEvidenceFixture(
    (root) => {
      const file = path.join(root, "docs/metadata/angular-support-evidence.json");
      const value = JSON.parse(readFileSync(file, "utf8"));
      value.package.peerRange = ">=21 <23";
      writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
    },
    (failures) =>
      assert(
        failures.some((failure) => failure.includes(">=22 <23 core peer contract")),
      ),
  ));

test("rejects missing Angular manual accessibility evidence", () =>
  angularEvidenceFixture(
    (root) => {
      const file = path.join(
        root,
        "docs/quality/assistive-technology-results/cf-7010-cross-framework-nvda.json",
      );
      const value = JSON.parse(readFileSync(file, "utf8"));
      value.consumers = value.consumers.filter(({ id }) => id !== "angular");
      writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
    },
    (failures) =>
      assert(failures.includes("MFD-1214 Angular NVDA evidence is incomplete")),
  ));

test("rejects missing packed Angular ownership enforcement", () =>
  angularEvidenceFixture(
    (root) => {
      const file = path.join(root, "tests/consumers/angular/package.json");
      const value = JSON.parse(readFileSync(file, "utf8"));
      delete value.scripts["verify:ownership"];
      writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
    },
    (failures) =>
      assert(
        failures.includes(
          "MFD-1214 packed Angular fixture must enforce package ownership",
        ),
      ),
  ));
