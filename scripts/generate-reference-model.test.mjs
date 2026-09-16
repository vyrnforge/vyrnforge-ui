import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildReferenceModel,
  REFERENCE_MODEL_PATH,
  serializeReferenceModel,
  verifyReferenceModel,
} from "./generate-reference-model.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const requiredFixturePaths = [
  "docs/metadata/reference-portal.json",
  "docs/generated/consumer-knowledge.json",
  "docs/generated/framework-api-reference.json",
  "docs/metadata/packages.json",
  "docs/metadata/design-tokens.json",
  "docs/metadata/patterns.json",
  "docs/metadata/executable-examples.json",
  "tests/consumers/manifest.json",
  REFERENCE_MODEL_PATH,
];

function fixture(mutator, callback) {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-reference-model-"));
  try {
    for (const relativePath of requiredFixturePaths) {
      const source = path.join(repositoryRoot, relativePath);
      const destination = path.join(root, relativePath);
      mkdirSync(path.dirname(destination), { recursive: true });
      cpSync(source, destination);
    }
    mutator?.(root);
    callback(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("builds the committed deterministic Reference model", () => {
  const model = buildReferenceModel();
  assert.equal(model.product.id, "vyrnforge-reference");
  assert.equal(model.product.semanticOwnership, "framework-neutral");
  assert.deepEqual(
    model.frameworks.map((framework) => framework.id),
    ["native-html", "react", "angular", "vue"],
  );
  assert.deepEqual(verifyReferenceModel(), model);
});

test("keeps detailed API facts in the generated framework API authority", () => {
  const model = buildReferenceModel();
  assert.equal(
    model.apiFacts.authority,
    "docs/generated/framework-api-reference.json",
  );
  assert.equal(
    model.apiFacts.canonicalAuthority,
    "docs/metadata/component-contracts.json",
  );
  assert.deepEqual(
    model.apiFacts.surfaces.map(({ id }) => id),
    ["native-html", "react", "angular", "vue"],
  );
});

test("maps every non-search content domain into a derived search record", () => {
  const model = buildReferenceModel();
  assert.equal(model.search.ownsFacts, false);
  assert.deepEqual(
    model.search.records.map((record) => record.domain),
    model.domains
      .filter((domain) => domain.id !== "search")
      .map((domain) => domain.id),
  );
});

test("binds framework examples to executable consumer identities", () => {
  const model = buildReferenceModel();
  assert.deepEqual(
    model.examples.map(({ id, framework }) => [id, framework]),
    [
      ["native-html", "native-html"],
      ["react", "react"],
      ["angular", "angular"],
      ["vue", "vue"],
    ],
  );
  for (const example of model.examples) {
    assert.equal(example.registry, "docs/metadata/executable-examples.json");
    assert.equal(example.consumerManifest, "tests/consumers/manifest.json");
  }
});

test("keeps token data and deep-link semantics source-owned", () => {
  const model = buildReferenceModel();
  assert.equal(model.tokenData.authority, "docs/metadata/design-tokens.json");
  assert.equal(model.deepLinks.identity, "stable-id");
  assert.equal(model.deepLinks.stable, true);
  assert.deepEqual(model.deepLinks.preserveContext, ["framework", "version"]);
  assert.equal(model.deepLinks.templates.components, "/components/{id}");
});

test("rejects stale generated reference output", () =>
  fixture(
    (root) => {
      const output = path.join(root, REFERENCE_MODEL_PATH);
      const model = JSON.parse(readFileSync(output, "utf8"));
      model.product.label = "Stale Reference";
      writeFileSync(output, `${JSON.stringify(model, null, 2)}\n`);
    },
    (root) =>
      assert.throws(
        () => verifyReferenceModel({ root }),
        /reference-model\.json is stale/u,
      ),
  ));

test("regeneration is byte-deterministic", () => {
  const first = serializeReferenceModel(buildReferenceModel());
  const second = serializeReferenceModel(buildReferenceModel());
  assert.equal(first, second);
});
