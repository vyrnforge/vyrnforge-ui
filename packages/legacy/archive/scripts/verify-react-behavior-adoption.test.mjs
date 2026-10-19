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

import { verifyReactBehaviorAdoption } from "./verify-react-behavior-adoption.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function createFixture() {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-react-adoption-"));
  for (const entry of ["docs/metadata", "packages/ui-components"]) {
    cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
      recursive: true,
    });
  }
  return root;
}

test("repository React behavior adoption evidence is complete", () => {
  assert.deepEqual(verifyReactBehaviorAdoption(), []);
});

test("rejects an unclassified React public export", () => {
  const root = createFixture();
  try {
    const file = path.join(root, "docs/metadata/react-behavior-adoption.json");
    const value = JSON.parse(readFileSync(file, "utf8"));
    value.classifications.find(
      (group) => group.id === "presentation-or-composition",
    ).components = value.classifications
      .find((group) => group.id === "presentation-or-composition")
      .components.filter((name) => name !== "ToolbarButton");
    writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
    assert(
      verifyReactBehaviorAdoption({ root }).some((failure) =>
        failure.includes("must be classified"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects missing shared behavior adoption evidence", () => {
  const root = createFixture();
  try {
    const file = path.join(
      root,
      "packages/ui-components/src/components/IconButton/IconButton.tsx",
    );
    const source = readFileSync(file, "utf8").replaceAll(
      "resolveActionState",
      "resolveLocalActionState",
    );
    writeFileSync(file, source);
    assert(
      verifyReactBehaviorAdoption({ root }).some((failure) =>
        failure.includes("resolveActionState"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
