import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { loadCanonicalComponentContracts } from "./canonical-component-contracts.mjs";
import {
  FRAMEWORK_SURFACES,
  createFrameworkApiReference,
  createFrameworkGenerationModel,
  deriveCanonicalNativeTags,
} from "./framework-generation.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function loadContracts() {
  return loadCanonicalComponentContracts({ root: repositoryRoot });
}

test("builds a deterministic generation plan for every canonical component", () => {
  const contracts = loadContracts();
  const model = createFrameworkGenerationModel(contracts);

  for (const framework of FRAMEWORK_SURFACES) {
    const ids = model.surfaces[framework].components.map((record) => record.id);
    assert.equal(ids.length, contracts.components.length);
    assert.deepEqual(ids, [...ids].sort());
    assert.equal(new Set(ids).size, ids.length);
  }

  const reversed = {
    ...contracts,
    components: [...contracts.components].reverse(),
  };
  assert.deepEqual(
    createFrameworkApiReference(reversed),
    createFrameworkApiReference(contracts),
  );
});

test("React adapter plans preserve canonical facade ownership", () => {
  const contracts = loadContracts();
  const react = createFrameworkGenerationModel(contracts).surfaces.react;

  assert.equal(react.package, "@vyrnforge/ui-components");
  for (const record of react.components) {
    assert.equal(record.adapter.kind, "react-facade");
    assert.equal(record.adapter.canonicalRenderer, "@vyrnforge/ui-elements");
    assert.notEqual(record.package, "@vyrnforge/ui-angular");
    assert.notEqual(record.package, "@vyrnforge/ui-vue");
  }
});

test("Angular Forms metadata is derived from canonical model and form records", () => {
  const contracts = loadContracts();
  const angular = createFrameworkGenerationModel(contracts).surfaces.angular;
  const formRecords = angular.components.filter(
    (record) => record.adapter.forms.enabled,
  );

  assert(formRecords.length > 0, "expected canonical Angular Forms mappings");
  for (const record of formRecords) {
    const component = contracts.componentById.get(record.id);
    const forms = record.adapter.forms;
    assert.equal(component.frameworkMappings.angular.model.mode, "forms");
    assert.equal(forms.canonicalProperty, component.model.stateProperty);
    assert.equal(forms.canonicalChangeEvent, component.model.changeEvent);
    assert.equal(
      forms.controlValueAccessor.disabledProperty,
      component.form.disabledProperty ??
        component.model.disabledProperty ??
        null,
    );
    assert.equal(forms.validator.enabled, component.form.validity.supported);
  }
});

test("Vue v-model metadata is derived from canonical model mappings", () => {
  const contracts = loadContracts();
  const vue = createFrameworkGenerationModel(contracts).surfaces.vue;
  const modelRecords = vue.components.filter(
    (record) => record.adapter.vModel.enabled,
  );

  assert(modelRecords.length > 0, "expected canonical Vue v-model mappings");
  for (const record of modelRecords) {
    const component = contracts.componentById.get(record.id);
    const model = record.adapter.vModel;
    assert.equal(component.frameworkMappings.vue.model.mode, "v-model");
    assert.equal(model.canonicalProperty, component.model.stateProperty);
    assert.equal(model.canonicalChangeEvent, component.model.changeEvent);
    assert.equal(
      model.publicProperty,
      component.frameworkMappings.vue.model.property,
    );
    assert.equal(
      model.publicEvent,
      component.frameworkMappings.vue.model.event,
    );
  }
});

test("native manifest generation no longer encodes a fixed element count", () => {
  const contracts = loadContracts();
  const mappedTags = contracts.components
    .filter(
      (component) => component.frameworkMappings.native?.status === "current",
    )
    .map((component) => component.frameworkMappings.native.tag);
  const canonicalTags = deriveCanonicalNativeTags(contracts);
  assert(canonicalTags.length > 0);
  assert.deepEqual(canonicalTags, [...new Set(mappedTags)].sort());

  const generator = readFileSync(
    path.join(repositoryRoot, "scripts/generate-ui-elements-manifest.mjs"),
    "utf8",
  );
  assert.doesNotMatch(generator, /Expected 58 registered elements/u);
  assert.doesNotMatch(generator, /definitions\.length\s*===\s*58/u);
});

test("framework API reference records generated ownership and all four surfaces", () => {
  const reference = createFrameworkApiReference(loadContracts());
  assert.equal(reference.generated.editable, false);
  assert.equal(
    reference.generated.generator,
    "scripts/generate-framework-api-reference.mjs",
  );
  assert.deepEqual(Object.keys(reference.surfaces), [...FRAMEWORK_SURFACES]);
  assert.equal(reference.surfaces.angular.package, "@vyrnforge/ui-angular");
  assert.equal(reference.surfaces.vue.package, "@vyrnforge/ui-vue");
});
