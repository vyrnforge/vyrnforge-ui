import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function json(relativePath) {
  return JSON.parse(read(relativePath));
}

test("reference detail routes and package facts stay generated and canonical", () => {
  const model = json("docs/generated/reference-model.json");
  const knowledge = json("docs/generated/consumer-knowledge.json");
  const packages = json("docs/metadata/packages.json");

  const componentDomain = model.domains.find(
    (domain) => domain.id === "components",
  );
  const packageDomain = model.domains.find((domain) => domain.id === "packages");
  assert.equal(componentDomain?.routeTemplate, "/components/{id}");
  assert.equal(packageDomain?.routeTemplate, "/packages/{id}");
  assert.equal(componentDomain?.recordSource?.collection, "components");
  assert.equal(packageDomain?.recordSource?.collection, "packages");

  assert.deepEqual(
    knowledge.packages.map((entry) => entry.name).sort(),
    packages.packages.map((entry) => entry.name).sort(),
  );
  for (const generated of knowledge.packages) {
    const canonical = packages.packages.find(
      (entry) => entry.name === generated.name,
    );
    assert(canonical, `canonical package metadata missing ${generated.name}`);
    assert.equal(generated.purpose, canonical.purpose);
    assert.equal(generated.status, canonical.status);
    assert.equal(generated.releaseTrack, canonical.releaseTrack);
    assert.equal(generated.cssImport, canonical.cssImport);
  }

  const runtime = read("docs/reference/referenceRuntime.ts");
  assert.match(runtime, /getReferenceRecordRoute/);
  assert.match(runtime, /matchReferenceRecordRoute/);
  assert.match(runtime, /domain\.routeTemplate/);

  const app = read("apps/docs/src/App.tsx");
  assert.match(app, /matchReferenceRecordRoute/);
  assert.match(app, /routeId: "component-reference"/);
  assert.match(app, /routeId: "package-reference"/);

  const referenceData = read("apps/docs/src/referenceData.ts");
  assert.match(referenceData, /consumer-knowledge\.json\?raw/);
  assert.match(referenceData, /metadata\/packages\.json\?raw/);
  assert.match(referenceData, /packageMetadata\.packages\.length/);

  const componentPage = read("apps/docs/src/ComponentReferencePage.tsx");
  assert.match(componentPage, /getReferenceRecordRoute/);
  assert.match(componentPage, /componentReferenceRecords/);
  assert.doesNotMatch(componentPage, /component: componentId/);

  const packagePage = read("apps/docs/src/PackageReferencePage.tsx");
  assert.match(packagePage, /packageReferenceRecords/);
  assert.match(packagePage, /packageDependencyRules/);
  assert.doesNotMatch(packagePage, /const packages = \[/);
  assert.doesNotMatch(packagePage, /const dependencyRules = \[/);
  assert.doesNotMatch(packagePage, /name: "@vyrnforge\/ui-core"/);
});
