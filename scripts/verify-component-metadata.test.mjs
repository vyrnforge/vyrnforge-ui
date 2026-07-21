import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { verifyComponentMetadata } from "./verify-component-metadata.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(
  readFileSync(path.join(root, "docs/metadata/components.json"), "utf8"),
);
const button = catalog.components.find((component) => component.id === "button");

function fixture(...components) {
  return {
    schemaVersion: 2,
    sourceOfTruth: { canonical: true },
    components,
  };
}

function expectFailure(component, text) {
  assert(
    verifyComponentMetadata(fixture(component), { root }).some((failure) =>
      failure.includes(text),
    ),
  );
}

test("rejects duplicate stable component ids", () => {
  const duplicate = { ...button, displayName: "Button alias" };
  assert(
    verifyComponentMetadata(fixture(button, duplicate), { root }).some((failure) =>
      failure.includes("duplicate component id"),
    ),
  );
});

test("rejects invalid packages and missing source files", () => {
  expectFailure({ ...button, package: "@vyrnforge/not-a-package" }, "invalid package");
  expectFailure({ ...button, sourcePath: "packages/ui-components/src/missing.tsx" }, "sourcePath");
});

test("rejects invalid docs and playground routes", () => {
  expectFailure({ ...button, docsPath: "docs/api/missing.md" }, "docsPath");
  expectFailure({ ...button, playgroundPath: "/components/missing" }, "playgroundPath");
});

test("rejects public export, internal visibility, and deprecated lifecycle mismatches", () => {
  expectFailure({ ...button, displayName: "MissingExport", publicExport: true }, "publicExport does not match");
  expectFailure({ ...button, category: "internal", maturity: "internal", publicExport: true }, "internal component must not be public");
  expectFailure({ ...button, maturity: "deprecated", deprecation: { status: "not-applicable" } }, "deprecated component requires");
});
