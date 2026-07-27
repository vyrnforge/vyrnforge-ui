import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function read(root, relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) return null;
  return readFileSync(absolutePath, "utf8").replaceAll("\r\n", "\n");
}

function readJson(root, relativePath) {
  const content = read(root, relativePath);
  return content === null ? null : JSON.parse(content);
}

function rootValueExports(source) {
  const exports = [];
  for (const match of source.matchAll(/export\s*\{([\s\S]*?)\}\s*from/g)) {
    for (const entry of match[1].split(",")) {
      const value = entry.trim();
      if (!value) continue;
      const alias = value.match(/^(\w+)\s+as\s+(\w+)$/);
      exports.push(alias?.[2] ?? value);
    }
  }
  return exports;
}

function sameMembers(actual, expected) {
  return (
    actual.size === expected.size &&
    [...expected].every((value) => actual.has(value))
  );
}

export function verifyReactBehaviorAdoption({ root = repositoryRoot } = {}) {
  const failures = [];
  const metadataPath = "docs/metadata/react-behavior-adoption.json";
  const metadata = readJson(root, metadataPath);
  if (!metadata) return [`missing ${metadataPath}`];

  if (metadata.schemaVersion !== 1)
    failures.push("React behavior adoption schemaVersion must be 1");
  if (
    metadata.program?.sprint !== "S5" ||
    metadata.program?.task !== "MF-5015"
  ) {
    failures.push("React behavior adoption must describe S5 / MF-5015");
  }
  if (metadata.program?.status !== "evidence-complete") {
    failures.push(
      "MF-5015 React behavior adoption audit must be evidence-complete",
    );
  }

  const indexPath = metadata.sourceOfTruth?.publicEntry;
  const indexSource =
    typeof indexPath === "string" ? read(root, indexPath) : null;
  if (indexSource === null)
    failures.push("React public entry point is missing");

  const actualExports = new Set(
    indexSource === null ? [] : rootValueExports(indexSource),
  );
  const declaredExports = new Set(metadata.publicValueExports ?? []);
  if (!sameMembers(actualExports, declaredExports)) {
    failures.push(
      "React public value exports changed without updating the MF-5015 compatibility audit",
    );
  }

  const classified = new Map();
  for (const group of metadata.classifications ?? []) {
    if (!group.id || !group.description)
      failures.push(
        "every React behavior classification requires an id and description",
      );
    for (const component of group.components ?? []) {
      if (classified.has(component))
        failures.push(`${component} is classified more than once`);
      classified.set(component, group.id);
    }
  }
  const nonComponents = new Set(
    (metadata.nonComponentExports ?? []).map((entry) => entry.name),
  );
  const classifiedOrExcluded = new Set([
    ...classified.keys(),
    ...nonComponents,
  ]);
  if (!sameMembers(classifiedOrExcluded, actualExports)) {
    failures.push(
      "every React public value export must be classified or explicitly identified as a non-component export",
    );
  }

  for (const evidence of metadata.adoptionEvidence ?? []) {
    const source = read(root, evidence.source);
    if (source === null) {
      failures.push(
        `missing React adoption evidence source ${evidence.source}`,
      );
      continue;
    }
    for (const marker of evidence.markers ?? []) {
      if (!source.includes(marker))
        failures.push(`${evidence.source} must include ${marker}`);
    }
  }

  const parityTest = read(
    root,
    "packages/ui-components/src/components/__tests__/behavior-parity.test.tsx",
  );
  for (const marker of [
    "IconButton",
    "shared action state",
    "React adapters preserve shared behavior parity",
  ]) {
    if (!parityTest?.includes(marker))
      failures.push(`behavior-parity.test.tsx must include ${marker}`);
  }

  if (
    !Array.isArray(metadata.unresolvedBehaviorDuplication) ||
    metadata.unresolvedBehaviorDuplication.length !== 0
  ) {
    failures.push(
      "MF-5015 unresolvedBehaviorDuplication must be an empty array",
    );
  }

  const requiredCommands = new Set(metadata.requiredCommands ?? []);
  for (const command of [
    "npm run test:react-behavior-adoption",
    "npm run verify:react-behavior-adoption",
    "npm run test:coverage --workspace @vyrnforge/ui-components",
    "npm run typecheck --workspace @vyrnforge/ui-components",
    "npm run verify:consumer",
    "npm run quality",
  ]) {
    if (!requiredCommands.has(command))
      failures.push(`React behavior adoption metadata is missing ${command}`);
  }

  return [...new Set(failures)].sort();
}

export function assertReactBehaviorAdoption(options) {
  const failures = verifyReactBehaviorAdoption(options);
  if (failures.length)
    throw new Error(
      `React behavior adoption verification failed:\n- ${failures.join("\n- ")}`,
    );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  assertReactBehaviorAdoption();
  console.log(
    "React behavior adoption passed: every public React component is classified, shared behavior adapters are evidenced, and compatibility invariants are complete.",
  );
}
