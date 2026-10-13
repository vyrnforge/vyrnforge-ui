import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadOwnedComponentDocumentation } from "./component-documentation-sources.mjs";
import { getPublicNonGridBetaComponents } from "./non-grid-component-scope.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stableValue(value[key])]),
  );
}

function stableJson(value) {
  return JSON.stringify(stableValue(value));
}

function isZeroSha(value) {
  return !value || /^0+$/u.test(value);
}

function gitOutput(root, args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" });
}

function readGitJson(root, ref, relativePath) {
  return JSON.parse(gitOutput(root, ["show", `${ref}:${relativePath}`]));
}

function changedFiles(root, base, head) {
  return gitOutput(root, [
    "diff",
    "--name-only",
    "--diff-filter=ACDMRTUXB",
    base,
    head,
    "--",
  ])
    .split(/\r?\n/u)
    .map((file) => file.trim().replaceAll("\\", "/"))
    .filter(Boolean);
}

function componentMap(catalog) {
  return new Map(
    (catalog.components ?? []).map((component) => [component.id, component]),
  );
}

function contractMap(contracts) {
  return new Map(
    (contracts.componentContracts ?? []).map((contract) => [contract.id, contract]),
  );
}

function implementationReferences(catalog, componentId) {
  const reference =
    catalog.maturityEvidence?.entries?.[componentId]?.implementationLocation
      ?.reference;
  return typeof reference === "string" && reference.trim()
    ? [reference.trim().replaceAll("\\", "/")]
    : [];
}

function baseOwnedComponentIds(reference) {
  return new Set(
    (reference.components ?? [])
      .filter((component) => component.source?.componentDocumentation)
      .map((component) => component.id),
  );
}

function compareAgainstBase({
  base,
  head,
  currentCatalog,
  currentContracts,
  currentOwnedIds,
  currentRequiredIds,
  root,
}) {
  const failures = [];
  if (isZeroSha(base) || !head) return failures;

  let baseCatalog;
  let baseContracts;
  let baseReference;
  let files;
  try {
    baseCatalog = readGitJson(root, base, "docs/metadata/components.json");
    baseContracts = readGitJson(
      root,
      base,
      "docs/metadata/component-contracts.json",
    );
    baseReference = readGitJson(
      root,
      base,
      "docs/generated/component-reference.json",
    );
    files = new Set(changedFiles(root, base, head));
  } catch (error) {
    return [
      `Unable to verify documentation ownership against CI base ${base}: ${error.message}`,
    ];
  }

  const previousOwnedIds = baseOwnedComponentIds(baseReference);
  for (const componentId of previousOwnedIds) {
    if (
      currentRequiredIds.has(componentId) &&
      !currentOwnedIds.has(componentId)
    ) {
      failures.push(
        `${componentId}: package-owned documentation was removed while the component remains in the required public scope`,
      );
    }
  }

  const baseComponents = componentMap(baseCatalog);
  const currentComponents = componentMap(currentCatalog);
  const baseContractsById = contractMap(baseContracts);
  const currentContractsById = contractMap(currentContracts);

  for (const componentId of currentRequiredIds) {
    if (currentOwnedIds.has(componentId)) continue;

    const previousComponent = baseComponents.get(componentId);
    const currentComponent = currentComponents.get(componentId);
    if (stableJson(previousComponent) !== stableJson(currentComponent)) {
      failures.push(
        `${componentId}: canonical public component metadata changed but documentation still relies on centralized fallback metadata; add or update package-owned ${componentId}.docs.json in the same change`,
      );
    }

    const previousContract = baseContractsById.get(componentId);
    const currentContract = currentContractsById.get(componentId);
    if (stableJson(previousContract) !== stableJson(currentContract)) {
      failures.push(
        `${componentId}: canonical component contract changed but documentation still relies on centralized fallback metadata; add or update package-owned ${componentId}.docs.json in the same change`,
      );
    }

    const implementationSources = new Set([
      ...implementationReferences(baseCatalog, componentId),
      ...implementationReferences(currentCatalog, componentId),
    ]);
    for (const source of implementationSources) {
      if (files.has(source)) {
        failures.push(
          `${componentId}: owning implementation source ${source} changed while documentation still relies on centralized fallback metadata; add or update package-owned ${componentId}.docs.json in the same change`,
        );
      }
    }
  }

  return [...new Set(failures)].sort();
}

export function verifyComponentDocumentationCoverage({
  root = repositoryRoot,
  base = process.env.CI_BASE_SHA,
  head = process.env.CI_HEAD_SHA,
} = {}) {
  const failures = [];
  const catalog = readJson(root, "docs/metadata/components.json");
  const contracts = readJson(root, "docs/metadata/component-contracts.json");
  const config = readJson(root, "docs/metadata/component-reference-config.json");
  const ownership = config.documentationOwnership;
  const documentation = loadOwnedComponentDocumentation({ root });
  const requiredComponents = getPublicNonGridBetaComponents(catalog);
  const requiredIds = new Set(requiredComponents.map((component) => component.id));
  const ownedIds = new Set(
    documentation.documents
      .map((document) => document.componentId)
      .filter((componentId) => requiredIds.has(componentId)),
  );
  const fallbackIds = requiredComponents
    .map((component) => component.id)
    .filter((componentId) => !ownedIds.has(componentId));

  if (!ownership) {
    failures.push(
      "component reference configuration must declare documentationOwnership migration policy",
    );
  } else {
    if (ownership.requiredScope !== "public-non-grid-beta") {
      failures.push(
        'documentationOwnership.requiredScope must remain "public-non-grid-beta" and derive from the canonical beta-scope helper',
      );
    }
    if (ownership.ownershipMustNotRegress !== true) {
      failures.push(
        "documentationOwnership.ownershipMustNotRegress must explicitly be true",
      );
    }
    if (ownership.changedPublicComponentRequiresOwnedDocumentation !== true) {
      failures.push(
        "documentationOwnership.changedPublicComponentRequiresOwnedDocumentation must explicitly be true",
      );
    }

    const baseline = ownership.migrationBaseline ?? {};
    if (
      ownedIds.size < baseline.ownedComponentCount ||
      fallbackIds.length > baseline.fallbackComponentCount
    ) {
      failures.push(
        `owned documentation coverage regressed: ${ownedIds.size}/${requiredComponents.length} owned and ${fallbackIds.length} fallback; baseline requires at least ${baseline.ownedComponentCount} owned and at most ${baseline.fallbackComponentCount} fallback`,
      );
    }
  }

  failures.push(
    ...compareAgainstBase({
      base,
      head,
      currentCatalog: catalog,
      currentContracts: contracts,
      currentOwnedIds: ownedIds,
      currentRequiredIds: requiredIds,
      root,
    }),
  );

  return {
    failures: [...new Set(failures)].sort(),
    coverage: {
      requiredComponentCount: requiredComponents.length,
      ownedComponentCount: ownedIds.size,
      fallbackComponentCount: fallbackIds.length,
      fallbackComponentIds: fallbackIds,
    },
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = verifyComponentDocumentationCoverage();
  if (result.failures.length > 0) {
    console.error("Component documentation ownership verification failed:");
    for (const failure of result.failures) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log(
      `Component documentation ownership passed: ${result.coverage.ownedComponentCount}/${result.coverage.requiredComponentCount} required components are package-owned; ${result.coverage.fallbackComponentCount} remain migration debt.`,
    );
  }
}
