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

import { verifyGmf4Closure } from "./verify-gmf4-closure.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function copyFile(root, relativePath) {
  const destination = path.join(root, relativePath);
  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(path.join(repositoryRoot, relativePath), destination);
}

function createFixture() {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-gmf4-"));
  const closure = JSON.parse(
    readFileSync(
      path.join(repositoryRoot, "docs/metadata/gmf4-closure.json"),
      "utf8",
    ),
  );

  const files = new Set([
    "package.json",
    "docs/metadata/gmf4-closure.json",
    "docs/testing/gmf4-cross-framework-compatibility-gate.md",
    "docs/metadata/multi-framework.json",
    ...closure.evidence,
    ...[
      "scripts/verify-native-element-foundations.mjs",
      "scripts/verify-multi-framework-architecture.mjs",
      "scripts/verify-package-boundaries.mjs",
      "scripts/verify-consumer-foundations.mjs",
      "scripts/verify-angular-consumer.mjs",
      "scripts/verify-angular-forms-adapter.mjs",
      "scripts/verify-vue-consumer.mjs",
      "scripts/verify-vue-model-adapter.mjs",
      "scripts/verify-ssr-bundler-compatibility.mjs",
      "scripts/verify-cross-framework-browser-matrix.mjs",
      "scripts/verify-component-reference.mjs",
      "scripts/verify-cross-framework-accessibility.mjs",
      "scripts/verify-multi-framework-migration-guide.mjs",
    ],
    ...[
      "packages/ui-core/package.json",
      "packages/ui-behaviors/package.json",
      "packages/ui-components/package.json",
      "packages/ui-elements/package.json",
      "packages/ui-data-grid/package.json",
    ],
  ]);

  for (const relativePath of files) copyFile(root, relativePath);
  return root;
}

function mutateJson(root, relativePath, update) {
  const file = path.join(root, relativePath);
  const value = JSON.parse(readFileSync(file, "utf8"));
  update(value);
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

test("repository GMF4 evidence is internally complete", () => {
  assert.deepEqual(verifyGmf4Closure(), []);
});

test("rejects an incomplete CF-7014 task", () => {
  const root = createFixture();
  try {
    mutateJson(root, "docs/metadata/gmf4-closure.json", (value) => {
      value.tasks.find((task) => task.id === "CF-7014").status = "pending";
    });
    assert(
      verifyGmf4Closure({ root, verifyDependencies: false }).some((failure) =>
        failure.includes("CF-7014 must be done"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects removal of a verified consumer", () => {
  const root = createFixture();
  try {
    mutateJson(root, "docs/metadata/gmf4-closure.json", (value) => {
      value.supportModel.supportedConsumers =
        value.supportModel.supportedConsumers.filter(
          (consumer) => consumer !== "vue",
        );
    });
    assert(
      verifyGmf4Closure({ root, verifyDependencies: false }).some((failure) =>
        failure.includes("must include vue"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects adding the data grid to the non-grid beta release group", () => {
  const root = createFixture();
  try {
    mutateJson(root, "docs/metadata/gmf4-closure.json", (value) => {
      value.releaseGroup.includedPackages.push("@vyrnforge/ui-data-grid");
    });
    assert(
      verifyGmf4Closure({ root, verifyDependencies: false }).some((failure) =>
        failure.includes("must not include ui-data-grid"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects a leaked Vue runtime dependency", () => {
  const root = createFixture();
  try {
    mutateJson(root, "packages/ui-elements/package.json", (value) => {
      value.dependencies = {
        ...(value.dependencies ?? {}),
        vue: "^3.5.0",
      };
    });
    assert(
      verifyGmf4Closure({ root, verifyDependencies: false }).some((failure) =>
        failure.includes("must not expose runtime dependency vue"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects unresolved GMF4 blockers", () => {
  const root = createFixture();
  try {
    mutateJson(root, "docs/metadata/gmf4-closure.json", (value) => {
      value.unresolvedBlockers = ["example blocker"];
    });
    assert(
      verifyGmf4Closure({ root, verifyDependencies: false }).some((failure) =>
        failure.includes("unresolvedBlockers must be an empty array"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("current verifiers accept the completed GMF4 transition", () => {
  const consumerSource = readFileSync(
    path.join(repositoryRoot, "scripts/verify-consumer-foundations.mjs"),
    "utf8",
  );
  const nativeFoundationSource = readFileSync(
    path.join(repositoryRoot, "scripts/verify-native-element-foundations.mjs"),
    "utf8",
  );
  const gmf4Source = readFileSync(
    path.join(repositoryRoot, "scripts/verify-gmf4-closure.mjs"),
    "utf8",
  );
  const fixtureDocs = readFileSync(
    path.join(
      repositoryRoot,
      "docs/testing/multi-framework-consumer-fixtures.md",
    ),
    "utf8",
  );

  assert(consumerSource.includes("gmf4-runtime-evidence-complete"));
  assert(
    consumerSource.includes(
      "consumer manifest and multi-framework program completion state must agree",
    ),
  );
  assert(nativeFoundationSource.includes("native-parity-current"));
  assert(
    nativeFoundationSource.includes(
      "native element foundation metadata must be canonical",
    ),
  );
  assert(
    gmf4Source.includes('"scripts/verify-native-element-foundations.mjs"'),
  );
  assert(!gmf4Source.includes('"scripts/verify-gmf3-closure.mjs"'));
  assert(fixtureDocs.includes("packed-vue-runtime-verified"));
});
