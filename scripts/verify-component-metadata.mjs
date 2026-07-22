import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { verifyMaturityMetadata } from "./verify-component-maturity.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const packages = new Set([
  "@vyrnforge/ui-core",
  "@vyrnforge/ui-behaviors",
  "@vyrnforge/ui-components",
  "@vyrnforge/ui-elements",
  "@vyrnforge/ui-data-grid",
]);
const categories = new Set([
  "primitive",
  "form-control",
  "composite",
  "navigation",
  "overlay",
  "feedback",
  "data-display",
  "data-grid",
  "grid-feature",
  "internal",
]);
const maturities = new Set([
  "planned",
  "experimental",
  "alpha-stable",
  "beta-stable",
  "stable",
  "deprecated",
  "internal",
]);
const unresolvedValues = new Set([
  "pending",
  "requires-verification",
  "not-applicable",
]);
const packageEntryFiles = {
  "@vyrnforge/ui-core": "packages/ui-core/src/index.ts",
  "@vyrnforge/ui-behaviors": "packages/ui-behaviors/src/index.ts",
  "@vyrnforge/ui-components": "packages/ui-components/src/index.ts",
  "@vyrnforge/ui-elements": "packages/ui-elements/src/index.ts",
  "@vyrnforge/ui-data-grid": "packages/ui-data-grid/src/index.ts",
};

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function rootExports(root, relativePath) {
  const source = readFileSync(path.join(root, relativePath), "utf8");
  const exports = new Set();

  for (const match of source.matchAll(
    /\bexport\s+(?:type\s+)?\{([\s\S]*?)\}\s+from\s+["'][^"']+["']/g,
  )) {
    for (const rawSpecifier of match[1].split(",")) {
      const specifier = rawSpecifier.trim();
      const alias =
        /^(?:type\s+)?([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/.exec(
          specifier,
        );
      if (alias) exports.add(alias[2] ?? alias[1]);
    }
  }

  for (const match of source.matchAll(
    /\bexport\s+(?:declare\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g,
  )) {
    exports.add(match[1]);
  }

  return exports;
}

function playgroundRoutes(root) {
  const source = readFileSync(
    path.join(root, "examples/basic-playground/src/app/routes.ts"),
    "utf8",
  );
  return new Set(
    [...source.matchAll(/\bpath:\s+"([^"]+)"/g)].map((match) => match[1]),
  );
}

function isUnresolved(value) {
  return typeof value === "string" && unresolvedValues.has(value);
}

function isExistingRepositoryPath(root, value, requiredPrefix) {
  return (
    typeof value === "string" &&
    !isUnresolved(value) &&
    value.startsWith(requiredPrefix) &&
    existsSync(path.join(root, value))
  );
}

function addFailure(failures, component, message) {
  failures.push(`${component.id || "<missing-id>"}: ${message}`);
}

export function verifyComponentMetadata(
  catalog,
  { root = repositoryRoot } = {},
) {
  const failures = [];
  if (
    catalog?.schemaVersion !== 2 ||
    catalog?.sourceOfTruth?.canonical !== true
  ) {
    return ["components.json must use canonical schema version 2"];
  }
  if (!Array.isArray(catalog.components)) {
    return ["components.json: components must be an array"];
  }

  const componentIds = new Set();
  const canonicalNames = new Set();
  const routes = playgroundRoutes(root);
  const exportsByPackage = new Map(
    Object.entries(packageEntryFiles).map(([packageName, entryFile]) => [
      packageName,
      rootExports(root, entryFile),
    ]),
  );

  for (const component of catalog.components) {
    if (!component || typeof component !== "object") {
      failures.push("components.json contains a non-object component entry");
      continue;
    }
    if (
      typeof component.id !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(component.id)
    ) {
      addFailure(
        failures,
        component,
        "id must be a stable kebab-case identifier",
      );
    } else if (componentIds.has(component.id)) {
      addFailure(failures, component, "duplicate component id");
    } else {
      componentIds.add(component.id);
    }
    if (
      typeof component.displayName !== "string" ||
      component.displayName.length === 0
    ) {
      addFailure(failures, component, "displayName is required");
    } else {
      const nameKey = `${component.package}:${component.displayName}`;
      if (canonicalNames.has(nameKey))
        addFailure(
          failures,
          component,
          "duplicate canonical displayName in package",
        );
      canonicalNames.add(nameKey);
    }
    if (!packages.has(component.package))
      addFailure(failures, component, `invalid package '${component.package}'`);
    if (!categories.has(component.category))
      addFailure(
        failures,
        component,
        `invalid category '${component.category}'`,
      );
    if (!maturities.has(component.maturity))
      addFailure(
        failures,
        component,
        `invalid maturity '${component.maturity}'`,
      );
    if (typeof component.owner !== "string" || component.owner.length === 0)
      addFailure(failures, component, "owner is required");
    if (component.maturity === "planned") {
      if (component.sourcePath !== "not-applicable")
        addFailure(
          failures,
          component,
          "planned component sourcePath must be not-applicable",
        );
    } else if (
      !isExistingRepositoryPath(root, component.sourcePath, "packages/")
    )
      addFailure(
        failures,
        component,
        "sourcePath must reference an existing package source file",
      );
    if (!isExistingRepositoryPath(root, component.docsPath, "docs/"))
      addFailure(
        failures,
        component,
        "docsPath must reference an existing docs file",
      );
    if (
      typeof component.playgroundPath !== "string" ||
      (!isUnresolved(component.playgroundPath) &&
        !routes.has(component.playgroundPath))
    )
      addFailure(
        failures,
        component,
        "playgroundPath must be a registered route or an allowed unresolved value",
      );
    if (!Array.isArray(component.knownLimitations))
      addFailure(failures, component, "knownLimitations must be an array");
    if (component.evidence?.maturityEvidenceKey !== component.id)
      addFailure(
        failures,
        component,
        "evidence must reference the component id",
      );
    if (!isUnresolved(component.evidence?.status))
      addFailure(
        failures,
        component,
        "evidence status must use an allowed unresolved value until evidence is recorded",
      );
    if (component.category === "internal" && component.publicExport === true)
      addFailure(failures, component, "internal component must not be public");
    if (component.maturity === "internal" && component.category !== "internal")
      addFailure(
        failures,
        component,
        "internal maturity requires the internal category",
      );
    if (component.maturity !== "internal" && component.category === "internal")
      addFailure(
        failures,
        component,
        "only internal maturity may use the internal category",
      );
    if (component.maturity === "planned" && component.publicExport === true)
      addFailure(failures, component, "planned component must not be public");
    if (typeof component.publicExport !== "boolean")
      addFailure(failures, component, "publicExport must be boolean");
    if (
      component.publicExport === true &&
      !exportsByPackage.get(component.package)?.has(component.displayName)
    )
      addFailure(
        failures,
        component,
        "publicExport does not match the package-root export inventory",
      );
    if (
      component.package === "@vyrnforge/ui-components" &&
      component.publicExport === true
    ) {
      const parity = component.frameworkParity;
      if (!parity || parity.betaScope !== "included")
        addFailure(
          failures,
          component,
          "public non-grid component requires included frameworkParity metadata",
        );
      if (
        parity?.react?.package !== "@vyrnforge/ui-components" ||
        parity?.react?.export !== component.displayName ||
        parity?.react?.status !== "current"
      )
        addFailure(
          failures,
          component,
          "frameworkParity React mapping must match the current public export",
        );
      if (
        parity?.behaviors?.package !== "@vyrnforge/ui-behaviors" ||
        parity?.behaviors?.status !== "foundation-current"
      )
        addFailure(
          failures,
          component,
          "frameworkParity must reference the current ui-behaviors foundation",
        );
      if (
        parity?.native?.package !== "@vyrnforge/ui-elements" ||
        parity?.native?.status !== "planned-s6"
      )
        addFailure(
          failures,
          component,
          "frameworkParity must reference planned S6 native rendering",
        );
      if (
        parity?.angular?.status !== "planned-gmf4" ||
        parity?.vue?.status !== "planned-gmf4"
      )
        addFailure(
          failures,
          component,
          "Angular and Vue mappings must remain planned until GMF4",
        );
    }
    if (component.maturity === "deprecated") {
      const deprecation = component.deprecation;
      if (
        !deprecation ||
        typeof deprecation !== "object" ||
        typeof deprecation.reason !== "string" ||
        (!deprecation.replacement && !deprecation.reason)
      )
        addFailure(
          failures,
          component,
          "deprecated component requires a replacement or reason",
        );
    }
  }

  if (catalog.maturityEvidence) {
    failures.push(...verifyMaturityMetadata(catalog));
  }

  return failures.sort();
}

export function verifyRepositoryComponentMetadata({
  root = repositoryRoot,
} = {}) {
  return verifyComponentMetadata(
    readJson(root, "docs/metadata/components.json"),
    { root },
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const failures = verifyRepositoryComponentMetadata();
  if (failures.length > 0) {
    throw new Error(
      `Component metadata verification failed:\n- ${failures.join("\n- ")}`,
    );
  }
  console.log(
    "Component metadata verification passed: canonical schema, paths, routes, exports, and ownership are consistent.",
  );
}
