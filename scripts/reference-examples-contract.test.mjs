import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frameworkIds = ["native-html", "react", "angular", "vue"];

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function json(relativePath) {
  return JSON.parse(read(relativePath));
}

test("Docs executable examples stay bound to verified consumer fixtures", () => {
  const metadata = json("docs/metadata/executable-examples.json");
  const manifest = json("tests/consumers/manifest.json");
  const model = json("docs/generated/reference-model.json");
  const expectedFrameworkIds = [...frameworkIds].sort();

  assert.equal(metadata.sourceOfTruth, "tests/consumers/manifest.json");
  assert.deepEqual(
    Object.keys(metadata.frameworks).sort(),
    expectedFrameworkIds,
  );
  assert.deepEqual(
    model.examples.map((example) => example.framework).sort(),
    expectedFrameworkIds,
  );

  for (const frameworkId of frameworkIds) {
    const example = metadata.frameworks[frameworkId];
    const fixture = manifest.fixtures.find(
      (candidate) => candidate.id === example.fixtureId,
    );
    assert(fixture, `fixture ${example.fixtureId} must exist`);
    assert.equal(example.directory, fixture.directory);
    assert.equal(example.contractFile, fixture.contractFile);
    assert(
      fixture.exampleFiles.includes(example.entrypoint),
      `${frameworkId} entrypoint must be a manifest-listed example file`,
    );
    assert.deepEqual(example.verification, ["typecheck", "build", "runtime"]);
  }

  const runtime = read("docs/reference/referenceRuntime.ts");
  assert.match(runtime, /ReferenceExample/u);
  assert.match(runtime, /getReferenceExample/u);
  assert.match(runtime, /executable example records are incomplete/u);

  const adapter = read(
    "apps/docs/src/examples/data/executableExampleContract.ts",
  );
  for (const marker of [
    "tests/consumers/manifest.json?raw",
    "native-html/src/main.ts?raw",
    "react/src/main.tsx?raw",
    "angular/src/app/app.component.html?raw",
    "vue/src/App.vue?raw",
    "fixture.exampleFiles.includes(evidence.entrypoint)",
    "source.path !== expectedSourcePath",
  ]) {
    assert.match(
      adapter,
      new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }

  const registry = json("docs/generated/documentation-registry.json");
  const executableExamples = registry.pages.find(
    (page) => page.id === "executable-examples",
  );
  assert(executableExamples);
  assert.equal(executableExamples.sourcePath, "tests/consumers/manifest.json");
  assert.equal(executableExamples.renderer, "executable-examples");

  const page = read("apps/docs/src/examples/ExecutableExamplesPage.tsx");
  for (const marker of [
    "getExecutableExampleRecord",
    "Framework quick start",
    "Minimal consumer entry point",
    "packed VyrnForge packages",
    "Supported integration behaviors",
  ]) {
    assert.match(page, new RegExp(marker));
  }

  const docsPage = read("apps/docs/src/DocsPage.tsx");
  assert.match(docsPage, /ExecutableExamplesPage/u);
  assert.match(docsPage, /route\.kind === "executable-examples"/u);
});

test("Reference examples integrate preview, source, and generated evidence without Playground chrome", () => {
  const migrated = read("apps/docs/src/examples/MigratedExamplePage.tsx");
  const executable = read("apps/docs/src/examples/ExecutableExamplesPage.tsx");
  const code = read("apps/docs/src/examples/components/CodeBlock.tsx");

  assert.doesNotMatch(migrated, /\bCard\b/u);
  assert.doesNotMatch(executable, /\bCard\b/u);
  assert.match(migrated, /vf-docs-example-workbench/u);
  assert.match(migrated, /implementation\.sourcePath/u);
  assert.match(executable, /resolveDocumentationExample/u);
  assert.match(code, /vf-docs-code-block/u);
  assert.doesNotMatch(code, /vf-playground-code-block/u);
});
