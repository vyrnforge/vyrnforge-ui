import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { loadOwnedComponentDocumentation } from "./component-documentation-sources.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

test("owned component documentation stays package-local and generator-owned", () => {
  const documentation = loadOwnedComponentDocumentation({ root });
  const button = documentation.documentByComponentId.button;
  const generator = read("scripts/generate-component-reference.mjs");
  const referenceData = read("apps/docs/src/referenceData.ts");
  const specimenHost = read("apps/docs/src/ReferenceComponentSpecimen.tsx");

  assert(button, "Button must remain the first owned documentation vertical slice");
  assert.equal(button.owner.package, "@vyrnforge/ui-elements");
  assert.match(button.sourcePath, /^packages\/ui-elements\//u);
  assert.deepEqual(
    new Set(button.examples.flatMap((example) => example.frameworks)),
    new Set(["native-html", "react", "angular", "vue"]),
  );

  assert.match(
    generator,
    /loadOwnedComponentDocumentation/u,
    "the existing component-reference generator must ingest package-owned documentation",
  );
  assert.doesNotMatch(
    referenceData,
    /\.docs\.json/u,
    "the Docs data adapter must consume generated projections rather than package-local documentation files",
  );
  assert.doesNotMatch(
    specimenHost,
    /\.docs\.json/u,
    "the React specimen host may render examples but must not import owned documentation sources directly",
  );
});

test("the ownership contract records the remaining projection gap", () => {
  const architecture = read(
    "docs/architecture/15-component-documentation-ownership.md",
  );

  assert.match(architecture, /apps\/docs.*must not import package-local/iu);
  assert.match(architecture, /owned `examples` and `releaseNotes`/u);
  assert.match(architecture, /rendering adapters/u);
});
