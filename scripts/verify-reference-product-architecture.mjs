import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const referencePortalPath = "docs/metadata/reference-portal.json";
export const documentationSystemPath =
  "docs/engineering/documentation-system.md";

const expectedFrameworks = ["angular", "native-html", "react", "vue"];
const expectedSurfaces = ["docs", "playground"];
const expectedDomains = [
  "accessibility",
  "components",
  "examples",
  "guides",
  "packages",
  "patterns",
  "search",
  "tokens",
];

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8").replaceAll(
    "\r\n",
    "\n",
  );
}

function readJson(root, relativePath) {
  return JSON.parse(read(root, relativePath));
}

function sameMembers(actual, expected) {
  return (
    JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort())
  );
}

export function verifyReferenceProductArchitecture({
  root = repositoryRoot,
} = {}) {
  const failures = [];

  for (const relativePath of [referencePortalPath, documentationSystemPath]) {
    if (!existsSync(path.join(root, relativePath))) {
      failures.push(`reference product architecture requires ${relativePath}`);
    }
  }
  if (failures.length) return failures.sort();

  const portal = readJson(root, referencePortalPath);
  const documentationSystem = read(root, documentationSystemPath);

  if (portal.schemaVersion !== 1) {
    failures.push(
      "reference portal schemaVersion must remain 1 until an explicit migration is implemented",
    );
  }
  if (portal.product?.id !== "vyrnforge-reference") {
    failures.push(
      "reference portal must identify the product as vyrnforge-reference",
    );
  }
  if (portal.product?.semanticOwnership !== "framework-neutral") {
    failures.push(
      "reference product semantic ownership must remain framework-neutral",
    );
  }
  if (portal.product?.implementationHost !== "react") {
    failures.push(
      "current reference product implementation host must be recorded as react",
    );
  }

  if (!sameMembers(Object.keys(portal.frameworks ?? {}), expectedFrameworks)) {
    failures.push(
      `reference portal must expose exactly ${expectedFrameworks.join(", ")}`,
    );
  }
  if (!sameMembers(Object.keys(portal.surfaces ?? {}), expectedSurfaces)) {
    failures.push(
      `reference portal must expose exactly ${expectedSurfaces.join(", ")}`,
    );
  }
  if (
    !sameMembers(Object.keys(portal.contentOwnership ?? {}), expectedDomains)
  ) {
    failures.push(
      `reference portal must define ownership for ${expectedDomains.join(", ")}`,
    );
  }

  if (portal.context?.framework?.queryParameter !== "framework") {
    failures.push(
      "reference framework context must use the framework query parameter",
    );
  }
  if (portal.context?.framework?.preserveAcrossSurfaces !== true) {
    failures.push(
      "reference framework context must be preserved across surfaces",
    );
  }
  if (portal.context?.version?.catalog !== portal.versionCatalog) {
    failures.push(
      "reference version context must use the canonical versionCatalog",
    );
  }
  if (portal.versionCatalog !== "vyrnforge-versions.json") {
    failures.push("reference portal must use vyrnforge-versions.json");
  }

  if (
    portal.routing?.identity !== "stable-id" ||
    portal.routing?.stableDeepLinks !== true
  ) {
    failures.push(
      "reference routing must preserve stable-id deep-link semantics",
    );
  }
  if (!Array.isArray(portal.routing?.transitionalRegistries)) {
    failures.push("reference routing must declare transitionalRegistries");
  } else if (portal.routing.transitionalRegistries.length !== 0) {
    failures.push(
      "reference routing must not retain transitional runtime registries after migration",
    );
  }

  if (portal.contentOwnership?.search?.ownsFacts !== false) {
    failures.push("reference search must explicitly own no canonical facts");
  }
  if (
    portal.contentOwnership?.components?.mode !==
    "generated-facts-plus-curated-guidance"
  ) {
    failures.push(
      "component reference must use generated facts plus curated guidance",
    );
  }
  if (
    portal.contentOwnership?.examples?.mode !== "registry-backed-executable"
  ) {
    failures.push(
      "reference examples must remain registry-backed executable examples",
    );
  }

  if (
    portal.deployment?.assemblyContract !== "scripts/reference-artifact.mjs"
  ) {
    failures.push(
      "reference deployment must preserve scripts/reference-artifact.mjs as the assembly contract",
    );
  }
  if (
    portal.deployment?.productionSourceBranch !== "main" ||
    portal.deployment?.immutable !== true
  ) {
    failures.push(
      "reference production deployment must remain immutable and main-bound",
    );
  }

  for (const marker of [
    "VyrnForge Reference",
    "reference-portal.json",
    "framework-neutral",
    "transitional runtime registries have been retired",
    "generated Reference model",
    "reference-artifact.mjs",
  ]) {
    if (!documentationSystem.includes(marker)) {
      failures.push(
        `${documentationSystemPath}: missing architecture marker ${marker}`,
      );
    }
  }
  if (documentationSystem.includes(".ai/DOC_USAGE_GUIDE.md")) {
    failures.push(
      `${documentationSystemPath}: must not link to removed .ai/DOC_USAGE_GUIDE.md`,
    );
  }
  if (
    documentationSystem.includes(
      "docsRegistry.ts` is the executable source for documentation routes",
    )
  ) {
    failures.push(
      `${documentationSystemPath}: must not treat docsRegistry.ts as durable route authority`,
    );
  }

  return failures.sort();
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const failures = verifyReferenceProductArchitecture();
  if (failures.length) {
    console.error(
      `Reference product architecture verification failed:\n- ${failures.join("\n- ")}`,
    );
    process.exitCode = 1;
  } else {
    console.log("Reference product architecture verification passed.");
  }
}
