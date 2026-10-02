import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildDocumentationRegistry } from "./generate-documentation-registry.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frameworks = ["native-html", "react", "angular", "vue"];

test("generated documentation examples preserve conceptual identity and framework implementations", () => {
  const registry = buildDocumentationRegistry();
  const consumer = registry.examples.find(
    (example) => example.id === "framework-consumer",
  );

  assert(consumer);
  assert.equal(consumer.documentId, "executable-examples");
  assert.equal(consumer.category, "basic");
  assert.deepEqual(
    consumer.implementations
      .map((implementation) => implementation.framework)
      .sort(),
    [...frameworks].sort(),
  );
  assert(
    consumer.implementations.every((implementation) =>
      implementation.verification.includes("runtime"),
    ),
  );
});

test("generated example implementations use the canonical framework language conventions", () => {
  const registry = buildDocumentationRegistry();
  const consumer = registry.examples.find(
    (example) => example.id === "framework-consumer",
  );

  assert(consumer);
  assert.deepEqual(
    Object.fromEntries(
      consumer.implementations.map((implementation) => [
        implementation.framework,
        implementation.language,
      ]),
    ),
    {
      react: "tsx",
      "native-html": "html-typescript",
      angular: "angular-typescript-template",
      vue: "vue-sfc-typescript",
    },
  );
});

test("migrated preview examples are registered with exact source files instead of a page-local map", () => {
  const registry = buildDocumentationRegistry();
  const migrated = registry.examples.filter(
    (example) => example.id !== "framework-consumer",
  );

  assert(migrated.length > 10);
  for (const example of migrated) {
    assert.equal(example.implementations.length, 1);
    const implementation = example.implementations[0];
    assert.equal(implementation.framework, "react");
    assert.equal(implementation.language, "tsx");
    assert(
      existsSync(path.join(root, implementation.sourcePath)),
      `Missing example source ${implementation.sourcePath}`,
    );
  }

  const page = readFileSync(
    path.join(root, "apps/docs/src/examples/MigratedExamplePage.tsx"),
    "utf8",
  );
  assert.match(page, /resolveDocumentationExample/u);
  assert.match(page, /import\.meta\.glob/u);
  assert.doesNotMatch(page, /const examples\s*=\s*\{/u);
});
