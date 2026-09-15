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

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
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
