import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { loadCanonicalComponentContracts } from "./canonical-component-contracts.mjs";
import {
  createFrameworkExceptionReference,
  createFrameworkOverrideHooks,
  loadFrameworkExceptions,
} from "./framework-exceptions.mjs";
import {
  FRAMEWORK_SURFACES,
  createFrameworkApiReference,
  createFrameworkGenerationModel,
  deriveCanonicalNativeTags,
} from "./framework-generation.mjs";
import { buildNativeElementArtifacts } from "./generate-ui-elements-manifest.mjs";
import {
  NativeElementGenerationError,
  createNativeElementGenerationModel,
  loadNativeRegistrationEvidence,
  parseNativeRegistrationEvidence,
} from "./native-element-generation.mjs";

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
  const exceptions = loadFrameworkExceptions({ root: repositoryRoot });
  const reference = createFrameworkApiReference(loadContracts(), {
    exceptionPolicy: createFrameworkExceptionReference(exceptions),
  });
  assert.equal(reference.generated.editable, false);
  assert.equal(
    reference.generated.generator,
    "scripts/generate-framework-api-reference.mjs",
  );
  assert.deepEqual(Object.keys(reference.surfaces), [...FRAMEWORK_SURFACES]);
  assert.equal(reference.surfaces.angular.package, "@vyrnforge/ui-angular");
  assert.equal(reference.surfaces.vue.package, "@vyrnforge/ui-vue");
  assert(
    reference.generated.sources.includes(
      "docs/metadata/framework-exceptions.json",
    ),
  );
  assert.equal(reference.exceptionPolicy.defaultPolicy, "generated-or-generic");
  assert(reference.exceptionPolicy.records.length > 0);
});

test("framework exceptions gate narrow handwritten override hooks", () => {
  const registry = loadFrameworkExceptions({ root: repositoryRoot });
  const nativeException = registry.byId.get("MFD-EX-NATIVE-TOAST-VIEWPORT");
  assert(nativeException);
  assert.equal(nativeException.framework, "native");
  assert.equal(nativeException.scope, "toast-viewport");
  assert.equal(nativeException.state, "active");

  const hooks = createFrameworkOverrideHooks({
    registry,
    overrides: {
      "MFD-EX-NATIVE-TOAST-VIEWPORT": (context) => ({
        ...context,
        handledBy: "declared-exception",
      }),
    },
  });
  assert.equal(hooks.has("MFD-EX-NATIVE-TOAST-VIEWPORT"), true);
  assert.deepEqual(
    hooks.apply("MFD-EX-NATIVE-TOAST-VIEWPORT", {
      framework: "native",
      scope: "toast-viewport",
      tagName: "vf-toast-viewport",
    }),
    {
      framework: "native",
      scope: "toast-viewport",
      tagName: "vf-toast-viewport",
      handledBy: "declared-exception",
    },
  );
  assert.throws(
    () =>
      createFrameworkOverrideHooks({
        registry,
        overrides: { "MFD-EX-UNDECLARED": () => null },
      }),
    /has no declared exception/u,
  );
  assert.throws(
    () =>
      hooks.apply("MFD-EX-NATIVE-TOAST-VIEWPORT", {
        framework: "react",
        scope: "toast-viewport",
      }),
    /cannot run for framework/u,
  );
});

test("native generation reconciles canonical contracts with AST registration evidence", () => {
  const contracts = loadContracts();
  const exceptions = loadFrameworkExceptions({ root: repositoryRoot });
  const registrations = loadNativeRegistrationEvidence({
    root: repositoryRoot,
  });
  const model = createNativeElementGenerationModel({
    contracts,
    exceptions,
    registrations,
  });

  assert.equal(model.summary.registrationCount, registrations.length);
  assert.equal(
    model.summary.canonicalTagCount,
    deriveCanonicalNativeTags(contracts).length,
  );
  assert(model.summary.exceptionBackedRegistrationCount > 0);
  const toastViewport = model.entries.find(
    (entry) => entry.tagName === "vf-toast-viewport",
  );
  assert(toastViewport);
  assert.deepEqual(toastViewport.canonicalComponentIds, []);
  assert(toastViewport.exceptionIds.includes("MFD-EX-NATIVE-TOAST-VIEWPORT"));

  const evidenceSource = readFileSync(
    path.join(repositoryRoot, "scripts/native-element-generation.mjs"),
    "utf8",
  );
  const generatorSource = readFileSync(
    path.join(repositoryRoot, "scripts/generate-ui-elements-manifest.mjs"),
    "utf8",
  );
  assert.match(evidenceSource, /@babel\/eslint-parser/u);
  assert.match(evidenceSource, /babelParser\.parseForESLint/u);
  assert.match(
    evidenceSource,
    /findDefinitionCatalog\(program, catalogName\)/u,
  );
  assert.doesNotMatch(generatorSource, /collectDefinitions/u);
  assert.doesNotMatch(generatorSource, /matchAll/u);
});

test("native manifest and DOM declarations share one reconciled generation model", () => {
  const contracts = loadContracts();
  const artifacts = buildNativeElementArtifacts({ root: repositoryRoot });
  const manifestDeclarations = artifacts.manifest.modules[0].declarations;

  assert.equal(manifestDeclarations.length, artifacts.model.entries.length);
  assert.deepEqual(
    artifacts.manifest.vyrnforge.eventVocabulary,
    contracts.events.map((event) => event.name),
  );
  for (const entry of artifacts.model.entries) {
    assert(
      artifacts.declarations.includes(
        `"${entry.tagName}": VyrnForgeElementInstance<"${entry.className}">;`,
      ),
    );
  }
  assert.deepEqual(artifacts.manifest.vyrnforge.nativeGeneration.sources, {
    contracts: "docs/metadata/component-contracts.json",
    registrationEvidence: "packages/ui-elements/src/registry.ts",
    exceptions: "docs/metadata/framework-exceptions.json",
    descriptions: "docs/metadata/components.json",
  });
});

test("native registration AST evidence rejects duplicate tags deterministically", () => {
  const fixture = `
    export const vyrnForgeElementDefinitions = Object.freeze([
      Object.freeze({ tagName: "vf-sample", constructor: SampleElement }),
      Object.freeze({ tagName: "vf-sample", constructor: OtherElement }),
    ]);
  `;
  assert.throws(
    () => parseNativeRegistrationEvidence(fixture),
    (error) =>
      error instanceof NativeElementGenerationError &&
      error.message.includes("duplicate tags"),
  );
});
