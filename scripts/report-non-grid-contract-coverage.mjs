import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(repositoryRoot, relativePath), "utf8"));
}

function scopedComponentIds(catalog) {
  return (catalog.components ?? [])
    .filter(
      (component) =>
        component.publicExport === true &&
        component.package === "@vyrnforge/ui-components" &&
        component.frameworkParity?.betaScope === "included" &&
        component.category !== "data-grid" &&
        component.category !== "grid-feature",
    )
    .map((component) => component.id)
    .sort();
}

function isCompleteContract(contract) {
  if (!contract || typeof contract !== "object") return false;
  const requiredArrays = [
    "properties",
    "attributes",
    "events",
    "slots",
    "methods",
    "accessibility",
  ];
  if (requiredArrays.some((field) => !Array.isArray(contract[field]))) return false;
  if (!contract.form || !contract.model || !contract.ref) return false;
  const mappings = contract.frameworkMappings;
  return Boolean(
    mappings?.native && mappings?.react && mappings?.angular && mappings?.vue,
  );
}

function exceptionComponentIds(exception) {
  const scope = exception?.scope;
  if (typeof scope === "string") return [scope];
  if (Array.isArray(scope)) return scope;
  if (typeof scope?.component === "string") return [scope.component];
  if (Array.isArray(scope?.components)) return scope.components;
  return [];
}

export function createCoverageReport() {
  const catalog = readJson("docs/metadata/components.json");
  const contracts = readJson("docs/metadata/component-contracts.json");
  const exceptions = readJson("docs/metadata/framework-exceptions.json");

  const scopedIds = scopedComponentIds(catalog);
  const scopedSet = new Set(scopedIds);
  const contractRecords = new Map();
  const duplicateContractIds = [];

  for (const contract of contracts.componentContracts ?? []) {
    if (contractRecords.has(contract.id)) duplicateContractIds.push(contract.id);
    contractRecords.set(contract.id, contract);
  }

  const activeExceptionIds = new Set();
  const unknownExceptionScopes = new Set();
  for (const exception of exceptions.exceptions ?? []) {
    if (!["active", "retiring"].includes(exception.state)) continue;
    for (const componentId of exceptionComponentIds(exception)) {
      if (scopedSet.has(componentId)) activeExceptionIds.add(componentId);
      else unknownExceptionScopes.add(componentId);
    }
  }

  const contractComplete = [];
  const exceptionRequired = [];
  const needsContractData = [];
  const ambiguous = [];

  for (const id of scopedIds) {
    const complete = isCompleteContract(contractRecords.get(id));
    const excepted = activeExceptionIds.has(id);
    if (complete && excepted) ambiguous.push(id);
    if (complete) contractComplete.push(id);
    else if (excepted) exceptionRequired.push(id);
    else needsContractData.push(id);
  }

  const unknownContractIds = [...contractRecords.keys()]
    .filter((id) => !scopedSet.has(id))
    .sort();

  return {
    schemaVersion: 1,
    scope: "public beta-included non-grid @vyrnforge/ui-components records",
    totals: {
      scoped: scopedIds.length,
      contractComplete: contractComplete.length,
      exceptionRequired: exceptionRequired.length,
      needsContractData: needsContractData.length,
    },
    contractComplete,
    exceptionRequired,
    needsContractData,
    unknownContractIds,
    unknownExceptionScopes: [...unknownExceptionScopes].sort(),
    duplicateContractIds: [...new Set(duplicateContractIds)].sort(),
    ambiguous,
    g10Ready:
      needsContractData.length === 0 &&
      unknownContractIds.length === 0 &&
      unknownExceptionScopes.size === 0 &&
      duplicateContractIds.length === 0 &&
      ambiguous.length === 0,
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const report = createCoverageReport();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (process.argv.includes("--require-g10-ready") && !report.g10Ready) {
    process.exitCode = 1;
  }
}
