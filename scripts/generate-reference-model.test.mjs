import assert from "node:assert/strict";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildReferenceModel,
  DOCUMENT_SOURCE_BINDINGS_PATH,
  REFERENCE_MODEL_PATH,
  serializeDocumentSourceBindings,
  serializeReferenceModel,
  verifyReferenceModel,
} from "./generate-reference-model.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const publicDocumentManifestPath =
  "docs/metadata/public-documents.json";
const publicDocumentManifest = JSON.parse(
  readFileSync(path.join(repositoryRoot, publicDocumentManifestPath), "utf8"),
);

const requiredFixturePaths = [
  "docs/metadata/reference-portal.json",
  publicDocumentManifestPath,
  "docs/metadata/public-documents.schema.json",
  "docs/generated/consumer-knowledge.json",
  "docs/generated/framework-api-reference.json",
  "docs/metadata/packages.json",
  "docs/metadata/design-tokens.json",
  "docs/metadata/patterns.json",
  "docs/metadata/executable-examples.json",
  "tests/consumers/manifest.json",
  REFERENCE_MODEL_PATH,
  DOCUMENT_SOURCE_BINDINGS_PATH,
  ...new Set(
    publicDocumentManifest.documents.map((document) => document.sourcePath),
  ),
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

test("uses the generated component displayName as the component and accessibility label", () => {
  const model = buildReferenceModel();
  for (const domainId of ["components", "accessibility"]) {
    const domain = model.domains.find((candidate) => candidate.id === domainId);
    assert.equal(domain?.recordSource?.identityField, "id");
    assert.equal(domain?.recordSource?.labelField, "displayName");
  }
});

test("builds the public document registry from canonical presentation metadata", () => {
  const model = buildReferenceModel();
  assert.equal(
    model.documentRegistry.source,
    "docs/metadata/public-documents.json",
  );
  assert.deepEqual(
    model.documentRegistry.categories.map((category) => category.id),
    [
      "getting-started",
      "components",
      "foundations",
      "patterns",
      "data-grid",
      "api",
      "releases",
    ],
  );
  assert(model.documentRegistry.documents.length > 0);
  assert(
    model.documentRegistry.documents.every((document) =>
      document.path.startsWith("/"),
    ),
  );
  assert.deepEqual(
    Object.fromEntries(
      model.documentRegistry.documents
        .filter((document) => document.recordDomain)
        .map((document) => [document.id, document.recordDomain]),
    ),
    {
      "component-reference": "components",
      "token-reference": "tokens",
      "pattern-reference": "patterns",
      "package-reference": "packages",
    },
  );
});

test("generates deterministic Markdown source bindings from document metadata", () => {
  const model = buildReferenceModel();
  const expected = serializeDocumentSourceBindings(model);
  assert.equal(
    readFileSync(path.join(repositoryRoot, DOCUMENT_SOURCE_BINDINGS_PATH), "utf8"),
    expected,
  );
  assert.match(expected, /docs\/api\/import-and-setup\.md\?raw/u);
  assert.match(expected, /packages\/ui-data-grid\/README\.md\?raw/u);
});

test("rejects duplicate public document identities and slugs", () =>
  fixture(
    (root) => {
      const file = path.join(root, publicDocumentManifestPath);
      const manifest = JSON.parse(readFileSync(file, "utf8"));
      manifest.documents[1].id = manifest.documents[0].id;
      manifest.documents[1].slug = manifest.documents[0].slug;
      writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
    },
    (root) =>
      assert.throws(
        () => buildReferenceModel({ root }),
        /duplicate public document (?:id|slug)/u,
      ),
  ));

test("rejects duplicate public document categories", () =>
  fixture(
    (root) => {
      const file = path.join(root, publicDocumentManifestPath);
      const manifest = JSON.parse(readFileSync(file, "utf8"));
      manifest.categories[1].id = manifest.categories[0].id;
      writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
    },
    (root) =>
      assert.throws(
        () => buildReferenceModel({ root }),
        /duplicate public document category id/u,
      ),
  ));

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
  const firstModel = buildReferenceModel();
  const secondModel = buildReferenceModel();
  assert.equal(
    serializeReferenceModel(firstModel),
    serializeReferenceModel(secondModel),
  );
  assert.equal(
    serializeDocumentSourceBindings(firstModel),
    serializeDocumentSourceBindings(secondModel),
  );
});
