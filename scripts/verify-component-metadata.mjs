import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const maturityValues = new Set([
  "stable",
  "beta-stable",
  "alpha-stable",
  "experimental",
  "planned",
  "deprecated",
  "internal"
]);
const publicMaturityValues = new Set([
  "stable",
  "beta-stable",
  "alpha-stable",
  "experimental",
  "planned",
  "deprecated"
]);
const packageEntryFiles = {
  "@vyrnforge/ui-core": "packages/ui-core/src/index.ts",
  "@vyrnforge/ui-components": "packages/ui-components/src/index.ts",
  "@vyrnforge/ui-data-grid": "packages/ui-data-grid/src/index.ts"
};
const aggregateStatusEntries = new Set([
  "@vyrnforge/ui-core:Theme tokens",
  "@vyrnforge/ui-core:Density tokens",
  "@vyrnforge/ui-core:Utility classes",
  "@vyrnforge/ui-data-grid:DataGrid state/adapters"
]);
const failures = [];

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function metadataKey(packageName, name) {
  return `${packageName}:${name}`;
}

function addFailure(message) {
  failures.push(message);
}

function getRootExports(relativePath) {
  const source = readFileSync(path.join(root, relativePath), "utf8");
  const exports = new Set();

  // TypeScript 7's native compiler package no longer exposes the historical
  // JavaScript compiler API used here. Package entry points are intentionally
  // declarative, so extract their named re-exports without adding a parser
  // dependency to repository verification.
  for (const match of source.matchAll(/\bexport\s+(?:type\s+)?\{([\s\S]*?)\}\s+from\s+["'][^"']+["']/g)) {
    for (const rawSpecifier of match[1].split(",")) {
      const specifier = rawSpecifier.trim();
      if (!specifier) continue;

      const aliasMatch = /^(?:type\s+)?([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/.exec(specifier);
      if (!aliasMatch) {
        addFailure(`${relativePath} contains an unsupported export specifier: ${specifier}`);
        continue;
      }

      exports.add(aliasMatch[2] ?? aliasMatch[1]);
    }
  }

  for (const match of source.matchAll(/\bexport\s+(?:declare\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)) {
    exports.add(match[1]);
  }

  return exports;
}

const catalog = readJson("docs/metadata/components.json").components;
const statuses = readJson("docs/metadata/component-status.json");
const componentMap = readJson(".ai/COMPONENT_MAP.json");
const publicStatuses = new Map();
const internalStatuses = new Map();
const rootExports = new Map(
  Object.entries(packageEntryFiles).map(([packageName, entryFile]) => [
    packageName,
    getRootExports(entryFile)
  ])
);

for (const [packageName, entries] of Object.entries(statuses)) {
  if (packageName === "schemaVersion" || packageName === "internal") {
    continue;
  }

  if (!packageEntryFiles[packageName]) {
    addFailure(`component-status.json has an unknown package: ${packageName}`);
    continue;
  }

  for (const [name, maturity] of Object.entries(entries)) {
    if (!publicMaturityValues.has(maturity)) {
      addFailure(
        `${metadataKey(packageName, name)} has unsupported public maturity: ${maturity}`
      );
      continue;
    }
    publicStatuses.set(metadataKey(packageName, name), maturity);
  }
}

for (const [packageName, names] of Object.entries(statuses.internal ?? {})) {
  if (!packageEntryFiles[packageName]) {
    addFailure(`internal metadata has an unknown package: ${packageName}`);
    continue;
  }
  if (!Array.isArray(names)) {
    addFailure(`internal metadata for ${packageName} must be an array`);
    continue;
  }

  for (const name of names) {
    if (typeof name !== "string") {
      addFailure(`internal metadata for ${packageName} contains a non-string name`);
      continue;
    }
    const entryKey = metadataKey(packageName, name);
    if (internalStatuses.has(entryKey)) {
      addFailure(`internal metadata contains a duplicate: ${entryKey}`);
    }
    internalStatuses.set(entryKey, "internal");
  }
}

for (const component of catalog) {
  const entryKey = metadataKey(component.package, component.name);
  if (!maturityValues.has(component.status)) {
    addFailure(`${entryKey} uses unsupported catalog maturity: ${component.status}`);
  }
  if (component.status === "internal" || internalStatuses.has(entryKey)) {
    addFailure(`${entryKey} is internal but appears in public components.json`);
  }

  const compactStatus = publicStatuses.get(entryKey);
  if (!compactStatus) {
    addFailure(`${entryKey} is documented public metadata without a compact maturity status`);
  } else if (compactStatus !== component.status) {
    addFailure(
      `${entryKey} disagrees between components.json (${component.status}) and component-status.json (${compactStatus})`
    );
  }
}

for (const [entryKey, maturity] of publicStatuses) {
  const [packageName, name] = entryKey.split(":");
  const packageExports = rootExports.get(packageName);

  if (
    maturity !== "planned" &&
    !aggregateStatusEntries.has(entryKey) &&
    !packageExports.has(name)
  ) {
    addFailure(`${entryKey} is public metadata but is not exported from its package root`);
  }
  if (maturity === "planned" && packageExports.has(name)) {
    addFailure(`${entryKey} is planned but is exported from its package root`);
  }
}

for (const [entryKey] of internalStatuses) {
  const [packageName, name] = entryKey.split(":");
  const packageExports = rootExports.get(packageName);

  if (publicStatuses.has(entryKey)) {
    addFailure(`${entryKey} is listed as both internal and public`);
  }
  if (packageExports.has(name)) {
    addFailure(`${entryKey} is internal but remains exported from its package root`);
  }
}

for (const [packageName, packageMap] of Object.entries(componentMap.packages)) {
  if (
    !Array.isArray(packageMap.current) ||
    !Array.isArray(packageMap.planned) ||
    !Array.isArray(packageMap.internal)
  ) {
    addFailure(
      `${packageName} must define current, planned, and internal arrays in COMPONENT_MAP.json`
    );
    continue;
  }

  for (const name of packageMap.current) {
    const maturity = publicStatuses.get(metadataKey(packageName, name));
    if (!maturity) {
      addFailure(
        `${metadataKey(packageName, name)} is current in COMPONENT_MAP.json without a public maturity status`
      );
    } else if (maturity === "planned") {
      addFailure(
        `${metadataKey(packageName, name)} is current in COMPONENT_MAP.json but planned in component-status.json`
      );
    }
  }

  for (const name of packageMap.planned) {
    if (publicStatuses.get(metadataKey(packageName, name)) !== "planned") {
      addFailure(
        `${metadataKey(packageName, name)} is planned in COMPONENT_MAP.json without planned maturity status`
      );
    }
  }

  for (const name of packageMap.internal) {
    if (!internalStatuses.has(metadataKey(packageName, name))) {
      addFailure(
        `${metadataKey(packageName, name)} is internal in COMPONENT_MAP.json without internal metadata`
      );
    }
  }
}

if (failures.length > 0) {
  throw new Error(`Component metadata consistency failed:\n- ${failures.join("\n- ")}`);
}

const totals = [...publicStatuses.values()].reduce(
  (result, maturity) => ({
    ...result,
    [maturity]: result[maturity] + 1
  }),
  { stable: 0, "beta-stable": 0, "alpha-stable": 0, experimental: 0, planned: 0, deprecated: 0 }
);

console.log(
  `Component metadata consistency passed: ${JSON.stringify({ ...totals, internal: internalStatuses.size })}`
);
