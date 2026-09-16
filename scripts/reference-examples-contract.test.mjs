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

test("Playground executable examples stay bound to verified consumer fixtures", () => {
  const metadata = json("docs/metadata/executable-examples.json");
  const manifest = json("tests/consumers/manifest.json");
  const model = json("docs/generated/reference-model.json");

  assert.equal(metadata.sourceOfTruth, "tests/consumers/manifest.json");
  assert.deepEqual(Object.keys(metadata.frameworks), frameworkIds);
  assert.deepEqual(
    model.examples.map((example) => example.framework),
    frameworkIds,
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
  assert.match(runtime, /ReferenceExample/);
  assert.match(runtime, /getReferenceExample/);
  assert.match(runtime, /executable example records are incomplete/);

  const adapter = read(
    "examples/basic-playground/src/data/executableExampleContract.ts",
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

  const routes = read(
    "examples/basic-playground/src/app/executableExampleRoutes.tsx",
  );
  assert.match(routes, /referenceModel\.examples\.map/);
  assert.match(routes, /getReferenceRecordRoute\(referenceModel, "examples"/);
  assert.match(routes, /exampleFrameworkId: example\.framework/);

  const app = read("examples/basic-playground/src/app/App.tsx");
  assert.match(app, /executableExamplesCatalogRoute/);
  assert.match(app, /executableExampleDetailRoutes/);
  assert.match(app, /getExecutableExampleRouteForFramework/);
  assert.match(app, /activeRoute\.exampleFrameworkId/);

  const nav = read("examples/basic-playground/src/app/PlaygroundNav.tsx");
  assert.match(nav, /route\.id === "executable-examples"/);
  assert.match(nav, /return "examples"/);

  const page = read(
    "examples/basic-playground/src/pages/reference/ExecutableExamplesPage.tsx",
  );
  for (const marker of [
    "executableExampleRecords",
    "getExecutableExampleRecord",
    "Executable source",
    "Verification contract",
    "Runtime evidence",
    "usePlaygroundFramework",
  ]) {
    assert.match(page, new RegExp(marker));
  }
});
