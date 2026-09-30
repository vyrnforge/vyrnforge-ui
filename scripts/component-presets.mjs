import { readFileSync } from "node:fs";
import path from "node:path";

export const COMPONENT_PRESET_PATH = "docs/metadata/component-presets.json";
export const COMPONENT_PRESET_SCHEMA_PATH =
  "docs/metadata/component-presets.schema.json";
export const COMPONENT_PRESET_SCHEMA_VERSION = 1;

export class ComponentPresetError extends Error {
  constructor(failures) {
    const normalized = Array.isArray(failures) ? failures : [failures];
    super(`Component preset validation failed:\n- ${normalized.join("\n- ")}`);
    this.name = "ComponentPresetError";
    this.failures = Object.freeze([...normalized]);
  }
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (!isObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, clone(child)]),
  );
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

export function validateComponentPresets(document, contracts) {
  const failures = [];
  if (!isObject(document)) {
    return ["Component preset metadata must be an object."];
  }
  if (document.schemaVersion !== COMPONENT_PRESET_SCHEMA_VERSION) {
    failures.push(
      `Unsupported component preset schemaVersion ${String(document.schemaVersion)}.`,
    );
  }
  if (document.sourceOfTruth?.canonical !== true) {
    failures.push("Component preset metadata must be canonical.");
  }
  if (!Array.isArray(document.presets)) {
    failures.push("Component preset metadata presets must be an array.");
    return failures;
  }

  const ids = new Set();
  const canonicalIds = new Set(
    contracts.components.map((component) => component.id),
  );
  const canonicalById = contracts.componentById;
  for (const [index, preset] of document.presets.entries()) {
    const context = `presets[${index}]`;
    if (!isObject(preset)) {
      failures.push(`${context} must be an object.`);
      continue;
    }
    if (!nonEmptyString(preset.id)) {
      failures.push(`${context}.id must be non-empty.`);
    } else if (ids.has(preset.id)) {
      failures.push(`${context}.id duplicates ${preset.id}.`);
    } else {
      ids.add(preset.id);
    }
    if (!canonicalIds.has(preset.baseComponent)) {
      failures.push(
        `${context}.baseComponent references unknown canonical component ${String(preset.baseComponent)}.`,
      );
      continue;
    }
    const base = canonicalById.get(preset.baseComponent);
    const canonicalProperties = new Set(
      (base.properties ?? []).map((property) => property.name),
    );
    for (const property of Object.keys(preset.baseDefaults ?? {})) {
      if (!canonicalProperties.has(property)) {
        failures.push(
          `${context}.baseDefaults references unknown ${preset.baseComponent} property ${property}.`,
        );
      }
    }
    for (const [transformIndex, transform] of (
      preset.transforms ?? []
    ).entries()) {
      if (!canonicalProperties.has(transform.outputProperty)) {
        failures.push(
          `${context}.transforms[${transformIndex}].outputProperty references unknown ${preset.baseComponent} property ${String(transform.outputProperty)}.`,
        );
      }
      const publicInputs = new Set(
        (preset.publicInputs ?? []).map((input) => input.name),
      );
      if (!publicInputs.has(transform.input)) {
        failures.push(
          `${context}.transforms[${transformIndex}].input must reference a declared public input.`,
        );
      }
      if (
        transform.overrideInput &&
        !publicInputs.has(transform.overrideInput)
      ) {
        failures.push(
          `${context}.transforms[${transformIndex}].overrideInput must reference a declared public input.`,
        );
      }
    }
    for (const framework of ["native", "react", "angular", "vue"]) {
      const binding = preset.surfaceBindings?.[framework];
      if (!binding) {
        failures.push(`${context} is missing ${framework} surface binding.`);
        continue;
      }
      if (binding.supportLevel !== "first-class") {
        failures.push(
          `${context}.${framework} supportLevel must be first-class.`,
        );
      }
      if (binding.target !== preset.baseComponent) {
        failures.push(
          `${context}.${framework} target must remain ${preset.baseComponent}.`,
        );
      }
    }
  }
  return failures;
}

export function normalizeComponentPresets(document) {
  const normalized = clone(document);
  normalized.presets.sort((left, right) => compareText(left.id, right.id));
  return deepFreeze({
    schemaVersion: normalized.schemaVersion,
    sourceOfTruth: normalized.sourceOfTruth,
    presets: normalized.presets,
    byId: new Map(normalized.presets.map((preset) => [preset.id, preset])),
    document: normalized,
  });
}

export function loadComponentPresets({ root, contracts } = {}) {
  if (!root) throw new Error("loadComponentPresets requires a repository root");
  if (!contracts) {
    throw new Error("loadComponentPresets requires canonical contracts");
  }
  const document = JSON.parse(
    readFileSync(path.join(root, COMPONENT_PRESET_PATH), "utf8"),
  );
  const failures = validateComponentPresets(document, contracts);
  if (failures.length > 0) throw new ComponentPresetError(failures);
  return normalizeComponentPresets(document);
}

export function createComponentPresetReference(registry) {
  return {
    schemaVersion: registry.schemaVersion,
    source: COMPONENT_PRESET_PATH,
    records: registry.presets.map((preset) => ({
      id: preset.id,
      baseComponent: preset.baseComponent,
      kind: preset.kind,
      publicInputs: clone(preset.publicInputs),
      baseDefaults: clone(preset.baseDefaults),
      semanticDefaults: clone(preset.semanticDefaults),
      transforms: clone(preset.transforms),
      content: clone(preset.content),
      surfaceBindings: clone(preset.surfaceBindings),
    })),
  };
}
