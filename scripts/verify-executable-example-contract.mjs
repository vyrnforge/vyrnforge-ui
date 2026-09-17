import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const metadataPath = "docs/metadata/executable-examples.json";
const consumerManifestPath = "tests/consumers/manifest.json";
const frameworkIds = ["native-html", "react", "angular", "vue"];

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(root, relativePath) {
  return JSON.parse(read(root, relativePath));
}

function requireMarkers(text, relativePath, markers, failures) {
  for (const marker of markers) {
    if (!text.includes(marker)) {
      failures.push(`${relativePath}: missing ${marker}`);
    }
  }
}

export function verifyExecutableExampleContract({
  root = repositoryRoot,
} = {}) {
  const failures = [];
  for (const required of [metadataPath, consumerManifestPath]) {
    if (!existsSync(path.join(root, required))) {
      failures.push(
        `executable example contract required file is missing: ${required}`,
      );
    }
  }
  if (failures.length > 0) return failures.sort();

  const contract = readJson(root, metadataPath);
  const manifest = readJson(root, consumerManifestPath);
  if (contract.schemaVersion !== 1) {
    failures.push("executable example contract schemaVersion must be 1");
  }
  if (contract.sourceOfTruth !== consumerManifestPath) {
    failures.push(
      "executable example contract must name tests/consumers/manifest.json as sourceOfTruth",
    );
  }

  const fixtures = new Map(
    (manifest.fixtures ?? []).map((fixture) => [fixture.id, fixture]),
  );
  for (const frameworkId of frameworkIds) {
    const example = contract.frameworks?.[frameworkId];
    if (!example) {
      failures.push(`executable example contract is missing ${frameworkId}`);
      continue;
    }
    const fixture = fixtures.get(example.fixtureId);
    if (!fixture) {
      failures.push(
        `${frameworkId}: unknown consumer fixture ${example.fixtureId}`,
      );
      continue;
    }
    if (fixture.directory !== example.directory) {
      failures.push(
        `${frameworkId}: example directory must match consumer fixture directory`,
      );
    }
    if (fixture.contractFile !== example.contractFile) {
      failures.push(
        `${frameworkId}: contractFile must match consumer fixture contractFile`,
      );
    }
    if (!(fixture.exampleFiles ?? []).includes(example.entrypoint)) {
      failures.push(
        `${frameworkId}: entrypoint must be a manifest-listed consumer example file`,
      );
    }
    const entrypoint = path.join(example.directory, example.entrypoint);
    if (!existsSync(path.join(root, entrypoint))) {
      failures.push(
        `${frameworkId}: executable example entrypoint is missing: ${entrypoint}`,
      );
    }
    const fixtureContractPath = path.join(
      example.directory,
      example.contractFile,
    );
    if (!existsSync(path.join(root, fixtureContractPath))) {
      failures.push(
        `${frameworkId}: fixture contract is missing: ${fixtureContractPath}`,
      );
    }
    const verification = new Set(example.verification ?? []);
    for (const requiredVerification of ["typecheck", "build", "runtime"]) {
      if (!verification.has(requiredVerification)) {
        failures.push(
          `${frameworkId}: missing ${requiredVerification} example verification`,
        );
      }
    }
  }

  const declared = Object.keys(contract.frameworks ?? {}).sort();
  const expected = [...frameworkIds].sort();
  if (JSON.stringify(declared) !== JSON.stringify(expected)) {
    failures.push(
      "executable example contract must contain exactly the four first-class framework surfaces",
    );
  }

  const adapterPath =
    "examples/basic-playground/src/data/executableExampleContract.ts";
  const routePath =
    "examples/basic-playground/src/app/executableExampleRoutes.tsx";
  const pagePath =
    "examples/basic-playground/src/pages/reference/ExecutableExamplesPage.tsx";
  const appPath = "examples/basic-playground/src/app/App.tsx";
  const navPath = "examples/basic-playground/src/app/PlaygroundNav.tsx";
  for (const required of [adapterPath, routePath, pagePath, appPath, navPath]) {
    if (!existsSync(path.join(root, required))) {
      failures.push(`executable example reader file is missing: ${required}`);
    }
  }
  if (failures.length > 0) return failures.sort();

  requireMarkers(
    read(root, adapterPath),
    adapterPath,
    [
      "tests/consumers/manifest.json?raw",
      "tests/consumers/native-html/src/main.ts?raw",
      "tests/consumers/react/src/main.tsx?raw",
      "tests/consumers/angular/src/app/app.component.html?raw",
      "tests/consumers/vue/src/App.vue?raw",
      "fixture.exampleFiles.includes(evidence.entrypoint)",
      "source.path !== expectedSourcePath",
    ],
    failures,
  );
  requireMarkers(
    read(root, routePath),
    routePath,
    [
      "referenceModel.examples.map",
      'getReferenceRecordRoute(referenceModel, "examples"',
      "exampleFrameworkId: example.framework",
    ],
    failures,
  );
  requireMarkers(
    read(root, pagePath),
    pagePath,
    [
      "executableExampleRecords",
      "getExecutableExampleRecord",
      "Executable source",
      "Verification contract",
      "Runtime evidence",
      "usePlaygroundFramework",
    ],
    failures,
  );
  requireMarkers(
    read(root, appPath),
    appPath,
    [
      "executableExamplesCatalogRoute",
      "executableExampleDetailRoutes",
      "getExecutableExampleRouteForFramework",
      "activeRoute.exampleFrameworkId",
    ],
    failures,
  );
  requireMarkers(
    read(root, navPath),
    navPath,
    ['route.id === "executable-examples"', 'return "examples"'],
    failures,
  );

  return failures.sort();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const failures = verifyExecutableExampleContract();
  if (failures.length > 0) {
    console.error("Executable example contract verification failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log("Executable example contract verification passed.");
  }
}
