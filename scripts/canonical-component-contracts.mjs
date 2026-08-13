import { readFileSync } from "node:fs";
import path from "node:path";

export const CANONICAL_COMPONENT_CONTRACT_SCHEMA_VERSION = 2;
export const CANONICAL_COMPONENT_CONTRACT_PATH =
  "docs/metadata/component-contracts.json";
export const CANONICAL_COMPONENT_CONTRACT_SCHEMA_PATH =
  "docs/metadata/component-contract.schema.json";

export class CanonicalComponentContractError extends Error {
  constructor(failures) {
    const orderedFailures = [...failures].sort();
    super(
      `Canonical component contract validation failed:\n- ${orderedFailures.join("\n- ")}`,
    );
    this.name = "CanonicalComponentContractError";
    this.failures = orderedFailures;
  }
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function resolveLocalRef(schemaRoot, ref) {
  if (!ref.startsWith("#/")) {
    throw new Error(`Unsupported non-local schema reference: ${ref}`);
  }

  return ref
    .slice(2)
    .split("/")
    .map((segment) => segment.replaceAll("~1", "/").replaceAll("~0", "~"))
    .reduce((current, segment) => current?.[segment], schemaRoot);
}

function formatPath(parts) {
  if (parts.length === 0) return "$";
  return `$${parts
    .map((part) =>
      typeof part === "number" ? `[${part}]` : `.${String(part)}`,
    )
    .join("")}`;
}

function matchesType(value, expectedType) {
  if (expectedType === "null") return value === null;
  if (expectedType === "array") return Array.isArray(value);
  if (expectedType === "object") return isObject(value);
  if (expectedType === "integer") return Number.isInteger(value);
  if (expectedType === "number") {
    return typeof value === "number" && Number.isFinite(value);
  }
  return typeof value === expectedType;
}

function validateNode(value, schema, schemaRoot, parts, failures) {
  if (!isObject(schema)) return;

  if (typeof schema.$ref === "string") {
    const resolved = resolveLocalRef(schemaRoot, schema.$ref);
    if (!resolved) {
      failures.push(
        `${formatPath(parts)} references missing schema ${schema.$ref}`,
      );
      return;
    }
    validateNode(value, resolved, schemaRoot, parts, failures);
    return;
  }

  if (Array.isArray(schema.anyOf)) {
    const matches = schema.anyOf.some((candidate) => {
      const candidateFailures = [];
      validateNode(value, candidate, schemaRoot, parts, candidateFailures);
      return candidateFailures.length === 0;
    });
    if (!matches)
      failures.push(`${formatPath(parts)} does not match any allowed schema`);
    return;
  }

  if (Object.hasOwn(schema, "const") && !Object.is(value, schema.const)) {
    failures.push(
      `${formatPath(parts)} must equal ${JSON.stringify(schema.const)}, received ${JSON.stringify(value)}`,
    );
    return;
  }

  if (
    Array.isArray(schema.enum) &&
    !schema.enum.some((item) => Object.is(item, value))
  ) {
    failures.push(
      `${formatPath(parts)} must be one of ${schema.enum.map((item) => JSON.stringify(item)).join(", ")}, received ${JSON.stringify(value)}`,
    );
    return;
  }

  const expectedTypes = Array.isArray(schema.type)
    ? schema.type
    : schema.type
      ? [schema.type]
      : [];
  if (
    expectedTypes.length > 0 &&
    !expectedTypes.some((expectedType) => matchesType(value, expectedType))
  ) {
    failures.push(
      `${formatPath(parts)} must be ${expectedTypes.join(" or ")}, received ${value === null ? "null" : Array.isArray(value) ? "array" : typeof value}`,
    );
    return;
  }

  if (typeof value === "string") {
    if (Number.isInteger(schema.minLength) && value.length < schema.minLength) {
      failures.push(
        `${formatPath(parts)} must contain at least ${schema.minLength} characters`,
      );
    }
    if (
      typeof schema.pattern === "string" &&
      !new RegExp(schema.pattern, "u").test(value)
    ) {
      failures.push(`${formatPath(parts)} does not match ${schema.pattern}`);
    }
  }

  if (Array.isArray(value)) {
    if (Number.isInteger(schema.minItems) && value.length < schema.minItems) {
      failures.push(
        `${formatPath(parts)} must contain at least ${schema.minItems} items`,
      );
    }
    if (schema.uniqueItems === true) {
      const seen = new Set();
      for (const item of value) {
        const serialized = JSON.stringify(stableClone(item));
        if (seen.has(serialized)) {
          failures.push(`${formatPath(parts)} must contain unique items`);
          break;
        }
        seen.add(serialized);
      }
    }
    if (schema.items) {
      value.forEach((item, index) =>
        validateNode(
          item,
          schema.items,
          schemaRoot,
          [...parts, index],
          failures,
        ),
      );
    }
  }

  if (isObject(value)) {
    const properties = isObject(schema.properties) ? schema.properties : {};
    for (const requiredName of schema.required ?? []) {
      if (!Object.hasOwn(value, requiredName)) {
        failures.push(
          `${formatPath(parts)} is missing required property ${requiredName}`,
        );
      }
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.hasOwn(properties, key)) {
          failures.push(
            `${formatPath([...parts, key])} is not an allowed property`,
          );
        }
      }
    }
    for (const [key, propertySchema] of Object.entries(properties)) {
      if (Object.hasOwn(value, key)) {
        validateNode(
          value[key],
          propertySchema,
          schemaRoot,
          [...parts, key],
          failures,
        );
      }
    }
  }
}

export function validateCanonicalComponentContracts(document, schema) {
  const failures = [];
  validateNode(document, schema, schema, [], failures);

  if (document?.schemaVersion !== CANONICAL_COMPONENT_CONTRACT_SCHEMA_VERSION) {
    failures.push(
      `$.schemaVersion must equal supported version ${CANONICAL_COMPONENT_CONTRACT_SCHEMA_VERSION}`,
    );
  }
  if (document?.$schema !== "./component-contract.schema.json") {
    failures.push(
      '$.$schema must declare "./component-contract.schema.json" as the canonical schema',
    );
  }
  if (document?.sourceOfTruth?.canonical !== true) {
    failures.push("$.sourceOfTruth.canonical must explicitly be true");
  }

  const componentIds = new Set();
  for (const [index, component] of (
    document?.componentContracts ?? []
  ).entries()) {
    if (componentIds.has(component.id)) {
      failures.push(
        `$.componentContracts[${index}].id duplicates ${component.id}`,
      );
    }
    componentIds.add(component.id);
  }

  const eventNames = new Set(
    (document?.eventVocabulary ?? []).map((event) => event.name),
  );
  const slotNames = new Set(
    (document?.slotVocabulary ?? []).map((slot) => slot.name),
  );
  for (const [componentIndex, component] of (
    document?.componentContracts ?? []
  ).entries()) {
    for (const [eventIndex, event] of (component.events ?? []).entries()) {
      if (!eventNames.has(event.name)) {
        failures.push(
          `$.componentContracts[${componentIndex}].events[${eventIndex}].name references unknown canonical event ${event.name}`,
        );
      }
    }
    for (const [slotIndex, slot] of (component.slots ?? []).entries()) {
      if (!slotNames.has(slot.name)) {
        failures.push(
          `$.componentContracts[${componentIndex}].slots[${slotIndex}].name references unknown canonical slot ${slot.name}`,
        );
      }
    }
  }

  return [...new Set(failures)].sort();
}

function stableClone(value) {
  if (Array.isArray(value)) return value.map(stableClone);
  if (!isObject(value)) return value;

  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stableClone(value[key])]),
  );
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (!isObject(value)) return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, cloneValue(child)]),
  );
}

function compareText(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value))
    return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

export function normalizeCanonicalComponentContracts(document) {
  const normalizedDocument = cloneValue(document);
  normalizedDocument.componentContracts.sort((left, right) =>
    compareText(left.id, right.id),
  );
  normalizedDocument.eventVocabulary.sort((left, right) =>
    compareText(left.name, right.name),
  );
  normalizedDocument.slotVocabulary.sort((left, right) =>
    compareText(left.name, right.name),
  );

  const components = normalizedDocument.componentContracts;
  const events = normalizedDocument.eventVocabulary;
  const slots = normalizedDocument.slotVocabulary;

  const componentById = new Map(
    components.map((component) => [component.id, component]),
  );
  const eventByName = new Map(events.map((event) => [event.name, event]));
  const slotByName = new Map(slots.map((slot) => [slot.name, slot]));

  return deepFreeze({
    schemaVersion: normalizedDocument.schemaVersion,
    sourceOfTruth: normalizedDocument.sourceOfTruth,
    formAssociation: normalizedDocument.formAssociation,
    catalogCoverage: normalizedDocument.catalogCoverage ?? null,
    components,
    events,
    slots,
    componentById,
    eventByName,
    slotByName,
    document: normalizedDocument,
  });
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function loadCanonicalComponentContracts({
  root,
  contractPath = CANONICAL_COMPONENT_CONTRACT_PATH,
  schemaPath = CANONICAL_COMPONENT_CONTRACT_SCHEMA_PATH,
} = {}) {
  if (!root)
    throw new Error(
      "loadCanonicalComponentContracts requires a repository root",
    );

  const document = readJson(path.join(root, contractPath));
  const schema = readJson(path.join(root, schemaPath));
  const failures = validateCanonicalComponentContracts(document, schema);
  if (failures.length > 0) throw new CanonicalComponentContractError(failures);
  return normalizeCanonicalComponentContracts(document);
}
