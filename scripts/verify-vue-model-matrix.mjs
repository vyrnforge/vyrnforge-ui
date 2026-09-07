import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildVueCatalogArtifact } from "./vue-catalog-generation.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifact = buildVueCatalogArtifact({ root });
const models = artifact.components.filter((component) => component.model);

assert.equal(models.length, 29, "Vue model matrix must cover 29 canonical models");
assert.deepEqual(
  [...new Set(models.map((component) => component.model.kind))].sort(),
  ["checked", "open", "pressed", "value"],
  "Vue model matrix must cover canonical value/checked/open/pressed kinds",
);

for (const component of models) {
  const model = component.model;
  assert.ok(model.publicProperty, `${component.id}: public model property missing`);
  assert.ok(model.publicEvent, `${component.id}: public model event missing`);
  assert.ok(model.canonicalProperty, `${component.id}: canonical property missing`);
  assert.ok(
    model.canonicalChangeEvent,
    `${component.id}: canonical change event missing`,
  );
  assert.ok(model.detailField, `${component.id}: canonical detail field missing`);
}

const namedModels = new Map(
  models.map((component) => [component.id, component.model]),
);
assert.equal(namedModels.get("dialog")?.publicEvent, "update:open");
assert.equal(namedModels.get("toggle-button")?.publicEvent, "update:pressed");
assert.equal(namedModels.get("checkbox")?.publicEvent, "update:modelValue");
assert.equal(namedModels.get("multi-select")?.publicProperty, "modelValue");

const generatedPath = path.join(root, artifact.path);
const tracked = readFileSync(generatedPath, "utf8");
assert.equal(
  tracked,
  artifact.content,
  "Generated Vue catalog model wiring is stale; run npm run generate:framework-artifacts",
);
assert.match(tracked, /useVyrnForgeModel/);
assert.match(tracked, /update:open/);
assert.match(tracked, /update:pressed/);

console.log(
  "Vue model matrix verification passed: 29 canonical models cover value, checked, selection/value arrays, open, and pressed semantics.",
);
