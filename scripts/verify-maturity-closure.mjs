import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function completeReference(record) {
  return (
    record?.status === "complete" &&
    typeof record.reference === "string" &&
    record.reference.length > 0
  );
}

export function verifyMaturityClosure(catalog, { root = repositoryRoot } = {}) {
  const failures = [];
  const policy = catalog?.maturityEvidence?.transitionPolicy;
  const entries = catalog?.maturityEvidence?.entries ?? {};
  const components = new Map(
    (catalog?.components ?? []).map((component) => [component.id, component]),
  );

  if (!policy || policy.closedBy !== "VF-2015") {
    failures.push("components.json: VF-2015 closure marker is missing");
    return failures;
  }

  if ((policy.legacyUnverifiedEntries ?? []).length !== 0) {
    failures.push(
      "components.json: VF-2015 closure cannot retain legacy evidence exceptions",
    );
  }

  if (
    !Array.isArray(policy.closedEntries) ||
    policy.closedEntries.length === 0
  ) {
    failures.push(
      "components.json: VF-2015 closedEntries audit list is required",
    );
    return failures;
  }

  if (new Set(policy.closedEntries).size !== policy.closedEntries.length) {
    failures.push("components.json: VF-2015 closedEntries contains duplicates");
  }

  if (
    typeof policy.closureRecord !== "string" ||
    !existsSync(path.join(root, policy.closureRecord))
  ) {
    failures.push("components.json: VF-2015 closureRecord must exist");
  }

  for (const componentId of policy.closedEntries) {
    const component = components.get(componentId);
    const evidence = entries[componentId];

    if (!component) {
      failures.push(`VF-2015: unknown closed component '${componentId}'`);
      continue;
    }
    if (component.maturity !== policy.closedToMaturity) {
      failures.push(
        `${componentId}: VF-2015 closure requires maturity '${policy.closedToMaturity}'`,
      );
    }
    if (component.evidence?.status !== "pending") {
      failures.push(
        `${componentId}: closed Experimental record must remain honestly pending until promotion evidence is complete`,
      );
    }
    if (!evidence || evidence.maturityState !== component.maturity) {
      failures.push(
        `${componentId}: VF-2015 closure requires a matching maturity evidence record`,
      );
      continue;
    }
    for (const field of [
      "owner",
      "implementationLocation",
      "documentationLocation",
    ]) {
      if (!completeReference(evidence[field])) {
        failures.push(
          `${componentId}: VF-2015 closure requires complete '${field}' evidence`,
        );
      }
    }
  }

  return failures.sort();
}

export function verifyRepositoryMaturityClosure({
  root = repositoryRoot,
} = {}) {
  const catalog = JSON.parse(
    readFileSync(path.join(root, "docs/metadata/components.json"), "utf8"),
  );
  return verifyMaturityClosure(catalog, { root });
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const failures = verifyRepositoryMaturityClosure();

  if (failures.length > 0) {
    throw new Error(
      `VF-2015 maturity closure verification failed:\n- ${failures.join("\n- ")}`,
    );
  }

  console.log(
    "VF-2015 maturity closure passed: legacy exceptions are empty and every migrated component has an explicit Experimental record.",
  );
}
