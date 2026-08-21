import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  GeneratedFrameworkArtifactsError,
  buildGeneratedFrameworkArtifacts,
  findStaleGeneratedFrameworkArtifacts,
  generatedTextIsCurrent,
} from "./generated-framework-artifacts.mjs";

test("generated framework text comparison is deterministic across line endings", () => {
  assert.equal(generatedTextIsCurrent("alpha\nbeta\n", "alpha\nbeta\n"), true);
  assert.equal(generatedTextIsCurrent("alpha\r\nbeta\r\n", "alpha\nbeta\n"), true);
  assert.equal(generatedTextIsCurrent("alpha\nbeta\n", "alpha\ngamma\n"), false);
});

test("stale generated artifacts identify their canonical source records", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "vyrnforge-generated-"));
  try {
    writeFileSync(path.join(root, "current.txt"), "current\n", "utf8");
    writeFileSync(path.join(root, "stale.txt"), "old\n", "utf8");

    const artifacts = [
      {
        path: "current.txt",
        sourceRecords: ["component:button"],
        content: "current\n",
      },
      {
        path: "stale.txt",
        sourceRecords: ["component:button"],
        content: "new\n",
      },
      {
        path: "missing.txt",
        sourceRecords: ["component:button", "framework-exception:*"],
        content: "missing\n",
      },
    ];

    const failures = findStaleGeneratedFrameworkArtifacts(artifacts, { root });
    assert.deepEqual(failures, [
      "missing.txt: missing (sources: component:button, framework-exception:*)",
      "stale.txt: stale (sources: component:button)",
    ]);

    const error = new GeneratedFrameworkArtifactsError(failures);
    assert.match(error.message, /generate:framework-artifacts/u);
    assert.match(error.message, /component:button/u);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
});

test("generated framework artifact registry covers every S11 owned output", () => {
  const artifacts = buildGeneratedFrameworkArtifacts();
  assert.equal(artifacts.length, 12);
  assert.deepEqual(
    artifacts.map((artifact) => artifact.path).sort(),
    [
      "docs/generated/framework-api-reference.json",
      "docs/generated/framework-button-slice.json",
      "packages/ui-elements/custom-elements.json",
      "packages/ui-elements/src/custom-elements.ts",
      "tests/consumers/angular/src/app/generated/vf-button.generated.ts",
      "tests/consumers/angular/src/app/generated/vf-text-input.generated.ts",
      "tests/consumers/native-html/src/generated/vf-button.generated.ts",
      "tests/consumers/native-html/src/generated/vf-text-input.generated.ts",
      "tests/consumers/react/src/generated/Button.generated.tsx",
      "tests/consumers/react/src/generated/TextInput.generated.tsx",
      "tests/consumers/vue/src/generated/VfButton.generated.ts",
      "tests/consumers/vue/src/generated/VfTextInput.generated.ts",
    ].sort(),
  );
  for (const artifact of artifacts) {
    assert(artifact.sourceRecords.length > 0, `${artifact.path}: missing source records`);
  }
});
