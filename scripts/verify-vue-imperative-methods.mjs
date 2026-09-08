import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCanonicalComponentContracts } from "./canonical-component-contracts.mjs";
import { createFrameworkGenerationModel } from "./framework-generation.mjs";
import { buildVueCatalogArtifact } from "./vue-catalog-generation.mjs";
import { buildVueTypedCatalogArtifact } from "./vue-type-generation.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const model = createFrameworkGenerationModel(
  loadCanonicalComponentContracts({ root }),
);
const records = model.surfaces.vue.components.filter(
  (record) =>
    ["current", "target"].includes(record.status) && record.methods.length > 0,
);
if (records.length !== 23) {
  throw new Error(
    `Expected 23 Vue components with canonical methods, received ${records.length}`,
  );
}
const catalog = buildVueCatalogArtifact({ root });
const typed = buildVueTypedCatalogArtifact({ root });
const generatedCatalog = readFileSync(path.join(root, catalog.path), "utf8");
const generatedTyped = readFileSync(path.join(root, typed.path), "utf8");
if (generatedCatalog !== catalog.content)
  throw new Error("Vue catalog is stale");
if (generatedTyped !== typed.content)
  throw new Error("Vue typed catalog is stale");
for (const record of records) {
  const typedComponent = typed.components.find(
    (entry) => entry.id === record.id,
  );
  const runtimeComponent = catalog.components.find(
    (entry) => entry.id === record.id,
  );
  if (!typedComponent || !runtimeComponent)
    throw new Error(`Missing Vue method component ${record.id}`);
  const expected = record.methods.map((method) => method.name);
  if (JSON.stringify(runtimeComponent.methods) !== JSON.stringify(expected)) {
    throw new Error(`Runtime method inventory mismatch for ${record.id}`);
  }
  if (
    JSON.stringify(typedComponent.methods.map((method) => method.name)) !==
    JSON.stringify(expected)
  ) {
    throw new Error(`Typed method inventory mismatch for ${record.id}`);
  }
}
for (const marker of [
  "VfTextInputRef",
  "readonly setCustomValidity:",
  "VfDialogRef",
  "readonly show:",
  "VfPopoverRef",
  "readonly toggle:",
]) {
  if (!generatedTyped.includes(marker))
    throw new Error(`Missing typed ref marker: ${marker}`);
}
console.log(
  "Vue imperative method verification passed for 23 canonical method-bearing components.",
);
