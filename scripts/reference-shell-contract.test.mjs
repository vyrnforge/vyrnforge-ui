import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

test("Docs and Playground consume one generated Reference context", () => {
  const docsContext = read("apps/docs/src/docsContext.ts");
  const playgroundContext = read(
    "examples/basic-playground/src/app/playgroundContext.ts",
  );

  for (const source of [docsContext, playgroundContext]) {
    assert.match(source, /generated\/reference-model\.json\?raw/u);
    assert.match(source, /reference\/referenceRuntime/u);
    assert.doesNotMatch(source, /reference-portal\.json/u);
    assert.match(source, /referenceModel\.frameworkContext\.default/u);
    assert.match(source, /referenceModel\.versionContext\.catalog/u);
  }
});

test("both apps preserve shared framework context in location and mode links", () => {
  for (const relativePath of [
    "apps/docs/src/App.tsx",
    "apps/docs/src/deploymentLinks.ts",
    "examples/basic-playground/src/app/App.tsx",
    "examples/basic-playground/src/app/deploymentLinks.ts",
  ]) {
    assert.match(
      read(relativePath),
      /referenceModel\.frameworkContext\.queryParameter/u,
      `${relativePath} must use the shared framework query contract`,
    );
  }
});

test("both navigation surfaces use generated Reference IA and searchable VyrnForge primitives", () => {
  for (const relativePath of [
    "apps/docs/src/DocsNav.tsx",
    "examples/basic-playground/src/app/PlaygroundNav.tsx",
  ]) {
    const source = read(relativePath);
    assert.match(source, /getReferenceNavigation/u);
    assert.match(source, /SearchInput/u);
    assert.match(source, /SideNav/u);
    assert.match(source, /VyrnForge Reference sections/u);
  }
});

test("Reference shells share product identity and explicit surface modes", () => {
  const docsShell = read("apps/docs/src/DocsShell.tsx");
  const playgroundShell = read(
    "examples/basic-playground/src/app/PlaygroundShell.tsx",
  );

  for (const source of [docsShell, playgroundShell]) {
    assert.match(source, /referenceModel\.product\.label/u);
  }
  assert.match(docsShell, /Playground mode/u);
  assert.match(playgroundShell, /Playground mode/u);
  assert.match(playgroundShell, /Docs mode/u);
});

test("shared runtime requires four framework surfaces and four Reference sections", () => {
  const runtime = read("docs/reference/referenceRuntime.ts");
  for (const frameworkId of ["native-html", "react", "angular", "vue"]) {
    assert.match(runtime, new RegExp(`"${frameworkId}"`, "u"));
  }
  for (const sectionId of ["start", "components", "foundations", "examples"]) {
    assert.match(runtime, new RegExp(`"${sectionId}"`, "u"));
  }
  assert.match(runtime, /preserveContext\.includes\("framework"\)/u);
});
