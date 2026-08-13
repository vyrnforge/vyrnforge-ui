import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  CANONICAL_COMPONENT_CONTRACT_PATH,
  CANONICAL_COMPONENT_CONTRACT_SCHEMA_PATH,
  CanonicalComponentContractError,
  loadCanonicalComponentContracts,
  normalizeCanonicalComponentContracts,
  validateCanonicalComponentContracts,
} from "./canonical-component-contracts.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function readJson(relativePath) {
  return JSON.parse(
    readFileSync(path.join(repositoryRoot, relativePath), "utf8"),
  );
}

function clone(value) {
  return structuredClone(value);
}

const canonicalDocument = readJson(CANONICAL_COMPONENT_CONTRACT_PATH);
const canonicalSchema = readJson(CANONICAL_COMPONENT_CONTRACT_SCHEMA_PATH);

test("loads the full canonical catalog through one normalized loader", () => {
  const loaded = loadCanonicalComponentContracts({ root: repositoryRoot });

  assert.equal(loaded.schemaVersion, 2);
  assert.equal(loaded.sourceOfTruth.canonical, true);
  assert.equal(
    loaded.components.length,
    canonicalDocument.componentContracts.length,
  );
  assert.equal(loaded.events.length, canonicalDocument.eventVocabulary.length);
  assert.equal(loaded.slots.length, canonicalDocument.slotVocabulary.length);
  assert.equal(loaded.componentById.size, loaded.components.length);
});

test("rejects an unsupported schema version deterministically", () => {
  const malformed = clone(canonicalDocument);
  malformed.schemaVersion = 999;

  const failures = validateCanonicalComponentContracts(
    malformed,
    canonicalSchema,
  );
  assert.deepEqual(failures, [...failures].sort());
  assert.match(failures.join("\n"), /schemaVersion/);
  assert.match(failures.join("\n"), /supported version 2/);
});

test("rejects missing canonical source ownership", () => {
  const malformed = clone(canonicalDocument);
  malformed.sourceOfTruth.canonical = false;

  const failures = validateCanonicalComponentContracts(
    malformed,
    canonicalSchema,
  );
  assert.match(failures.join("\n"), /sourceOfTruth\.canonical/);
});

test("rejects unknown fields using the canonical schema", () => {
  const malformed = clone(canonicalDocument);
  malformed.componentContracts[0].futureAccidentalField = true;

  const failures = validateCanonicalComponentContracts(
    malformed,
    canonicalSchema,
  );
  assert.match(
    failures.join("\n"),
    /componentContracts\[0\]\.futureAccidentalField is not an allowed property/,
  );
});

test("rejects malformed nested framework mapping fields", () => {
  const malformed = clone(canonicalDocument);
  malformed.componentContracts[0].frameworkMappings.native.status = "maybe";

  const failures = validateCanonicalComponentContracts(
    malformed,
    canonicalSchema,
  );
  assert.match(failures.join("\n"), /frameworkMappings\.native\.status/);
});

test("rejects component events that are absent from the canonical vocabulary", () => {
  const malformed = clone(canonicalDocument);
  const component = malformed.componentContracts.find((candidate) =>
    Array.isArray(candidate.events),
  );
  component.events.push({ name: "vf-not-canonical", source: "controller" });

  const failures = validateCanonicalComponentContracts(
    malformed,
    canonicalSchema,
  );
  assert.match(
    failures.join("\n"),
    /references unknown canonical event vf-not-canonical/,
  );
});

test("normalization is reproducible and component lookup is order-independent", () => {
  const first = normalizeCanonicalComponentContracts(canonicalDocument);
  const reordered = clone(canonicalDocument);
  reordered.componentContracts.reverse();
  reordered.eventVocabulary.reverse();
  reordered.slotVocabulary.reverse();
  const second = normalizeCanonicalComponentContracts(reordered);

  assert.deepEqual(
    first.components.map((component) => component.id),
    second.components.map((component) => component.id),
  );
  assert.deepEqual(
    first.events.map((event) => event.name),
    second.events.map((event) => event.name),
  );
  assert.deepEqual(
    first.slots.map((slot) => slot.name),
    second.slots.map((slot) => slot.name),
  );
  assert.equal(JSON.stringify(first.document), JSON.stringify(second.document));
  assert.equal(
    JSON.stringify(first.componentById.get(first.components[0].id)),
    JSON.stringify(second.componentById.get(second.components[0].id)),
  );
});

test("loader failures use the dedicated deterministic error type", () => {
  const malformed = clone(canonicalDocument);
  delete malformed.sourceOfTruth;
  const failures = validateCanonicalComponentContracts(
    malformed,
    canonicalSchema,
  );
  const error = new CanonicalComponentContractError(failures);

  assert.deepEqual(error.failures, [...error.failures].sort());
  assert.match(error.message, /Canonical component contract validation failed/);
});
