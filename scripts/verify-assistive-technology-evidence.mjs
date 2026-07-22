import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const statuses = new Set(["pending", "complete", "blocked"]);
const outcomes = new Set(["passed", "failed", "conditional"]);

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function readFixtureInventory(root) {
  const source = readFileSync(
    path.join(root, "apps/regression-fixtures/src/fixtureRegistry.ts"),
    "utf8",
  );
  const fixtures = new Map();

  for (const match of source.matchAll(
    /\{\s*id:\s*"([^"]+)"[\s\S]*?componentMetadataId:\s*"([^"]+)"[\s\S]*?route:\s*"([^"]+)"[\s\S]*?\}/g,
  )) {
    fixtures.set(match[1], {
      componentMetadataId: match[2],
      route: match[3],
    });
  }

  return fixtures;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoDate(value) {
  return isNonEmptyString(value) && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function addFailure(failures, scope, message) {
  failures.push(`${scope}: ${message}`);
}

export function verifyAssistiveTechnologyEvidence(
  evidence,
  {
    componentIds = new Set(),
    fixtureInventory = new Map(),
    root = repositoryRoot,
    requireComplete = false,
  } = {},
) {
  const failures = [];

  if (
    evidence?.schemaVersion !== 1 ||
    evidence?.sourceOfTruth?.canonical !== true
  ) {
    return [
      "assistive-technology-reviews.json must use canonical schema version 1",
    ];
  }

  if (!Array.isArray(evidence.scenarios) || evidence.scenarios.length === 0) {
    failures.push("assistive-technology-reviews.json: scenarios are required");
  }

  if (
    !evidence.environments ||
    typeof evidence.environments !== "object" ||
    Array.isArray(evidence.environments)
  ) {
    failures.push(
      "assistive-technology-reviews.json: environments are required",
    );
    return failures;
  }

  const environmentIds = new Set();
  for (const [environmentId, environment] of Object.entries(
    evidence.environments,
  )) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(environmentId)) {
      addFailure(failures, environmentId, "environment id must be kebab-case");
    }
    environmentIds.add(environmentId);

    if (!statuses.has(environment?.status)) {
      addFailure(failures, environmentId, "unsupported environment status");
      continue;
    }

    for (const field of ["operatingSystem", "browser", "assistiveTechnology"]) {
      if (!isNonEmptyString(environment?.[field]?.name)) {
        addFailure(failures, environmentId, `${field}.name is required`);
      }
      if (!isNonEmptyString(environment?.[field]?.version)) {
        addFailure(failures, environmentId, `${field}.version is required`);
      }
    }

    if (
      !Array.isArray(environment.inputModes) ||
      environment.inputModes.length === 0
    ) {
      addFailure(failures, environmentId, "inputModes are required");
    }

    if (environment.status === "complete") {
      if (!isNonEmptyString(environment.reviewer)) {
        addFailure(
          failures,
          environmentId,
          "complete environment needs reviewer",
        );
      }
      if (!isIsoDate(environment.testedAt)) {
        addFailure(
          failures,
          environmentId,
          "complete environment needs testedAt in YYYY-MM-DD format",
        );
      }
      for (const field of [
        "operatingSystem",
        "browser",
        "assistiveTechnology",
      ]) {
        if (environment[field]?.version === "pending") {
          addFailure(
            failures,
            environmentId,
            `complete environment cannot keep ${field}.version pending`,
          );
        }
      }
    } else if (!isNonEmptyString(environment.rationale)) {
      addFailure(
        failures,
        environmentId,
        `${environment.status} environment needs rationale`,
      );
    }

    if (requireComplete && environment.status !== "complete") {
      addFailure(
        failures,
        environmentId,
        "release verification requires a complete environment",
      );
    }
  }

  const scenarioIds = new Set();
  for (const scenario of evidence.scenarios ?? []) {
    const scope = scenario?.id ?? "<missing-scenario-id>";

    if (!/^AT-\d{3}$/.test(scope)) {
      addFailure(failures, scope, "scenario id must use AT-###");
    } else if (scenarioIds.has(scope)) {
      addFailure(failures, scope, "duplicate scenario id");
    } else {
      scenarioIds.add(scope);
    }

    if (!isNonEmptyString(scenario?.title)) {
      addFailure(failures, scope, "title is required");
    }
    if (!statuses.has(scenario?.status)) {
      addFailure(failures, scope, "unsupported scenario status");
    }
    if (
      !Array.isArray(scenario?.componentIds) ||
      scenario.componentIds.length === 0
    ) {
      addFailure(failures, scope, "componentIds are required");
    } else {
      for (const componentId of scenario.componentIds) {
        if (!componentIds.has(componentId)) {
          addFailure(failures, scope, `unknown component id '${componentId}'`);
        }
      }
    }
    if (
      !Array.isArray(scenario?.fixtureIds) ||
      scenario.fixtureIds.length === 0
    ) {
      addFailure(failures, scope, "fixtureIds are required");
    } else {
      for (const fixtureId of scenario.fixtureIds) {
        const fixture = fixtureInventory.get(fixtureId);
        if (!fixture) {
          addFailure(failures, scope, `unknown fixture id '${fixtureId}'`);
        } else if (
          !scenario.componentIds.includes(fixture.componentMetadataId)
        ) {
          addFailure(
            failures,
            scope,
            `fixture '${fixtureId}' belongs to unlisted component '${fixture.componentMetadataId}'`,
          );
        }
      }
    }
    if (
      !Array.isArray(scenario?.contracts) ||
      scenario.contracts.length === 0
    ) {
      addFailure(failures, scope, "manual contracts are required");
    }
    if (
      !Array.isArray(scenario?.environmentIds) ||
      scenario.environmentIds.length === 0
    ) {
      addFailure(failures, scope, "environmentIds are required");
    } else {
      for (const environmentId of scenario.environmentIds) {
        if (!environmentIds.has(environmentId)) {
          addFailure(failures, scope, `unknown environment '${environmentId}'`);
        }
      }
    }

    if (!Array.isArray(scenario?.results)) {
      addFailure(failures, scope, "results must be an array");
      continue;
    }

    const resultsByEnvironment = new Map();
    for (const result of scenario.results) {
      const environmentId = result?.environmentId;
      if (!environmentIds.has(environmentId)) {
        addFailure(
          failures,
          scope,
          `result references unknown environment '${environmentId}'`,
        );
        continue;
      }
      if (!(scenario.environmentIds ?? []).includes(environmentId)) {
        addFailure(
          failures,
          scope,
          `result environment '${environmentId}' is not declared by the scenario`,
        );
      }
      if (resultsByEnvironment.has(environmentId)) {
        addFailure(
          failures,
          scope,
          `duplicate result for environment '${environmentId}'`,
        );
      }
      resultsByEnvironment.set(environmentId, result);

      if (!outcomes.has(result?.outcome)) {
        addFailure(failures, scope, "result outcome is unsupported");
      }
      if (!isNonEmptyString(result?.reviewer)) {
        addFailure(failures, scope, "result reviewer is required");
      }
      if (!isIsoDate(result?.testedAt)) {
        addFailure(
          failures,
          scope,
          "result testedAt must use YYYY-MM-DD format",
        );
      }
      if (!isNonEmptyString(result?.reference)) {
        addFailure(failures, scope, "result reference is required");
      } else if (
        !result.reference.startsWith(
          "docs/quality/assistive-technology-results/",
        )
      ) {
        addFailure(
          failures,
          scope,
          "result reference must use the canonical assistive-technology results directory",
        );
      } else if (!existsSync(path.join(root, result.reference))) {
        addFailure(
          failures,
          scope,
          `result reference does not exist: ${result.reference}`,
        );
      }
      if (!isNonEmptyString(result?.notes)) {
        addFailure(failures, scope, "result notes are required");
      }
    }

    if (scenario.status === "complete") {
      for (const environmentId of scenario.environmentIds ?? []) {
        if (!resultsByEnvironment.has(environmentId)) {
          addFailure(
            failures,
            scope,
            `complete scenario is missing result for '${environmentId}'`,
          );
        }
        if (evidence.environments[environmentId]?.status !== "complete") {
          addFailure(
            failures,
            scope,
            `complete scenario requires complete environment '${environmentId}'`,
          );
        }
      }
    } else if (!isNonEmptyString(scenario.rationale)) {
      addFailure(
        failures,
        scope,
        `${scenario.status} scenario needs rationale`,
      );
    }

    if (requireComplete && scenario.status !== "complete") {
      addFailure(
        failures,
        scope,
        "release verification requires a complete scenario",
      );
    }
    if (requireComplete) {
      for (const result of scenario.results ?? []) {
        if (result?.outcome !== "passed") {
          addFailure(
            failures,
            scope,
            `release verification requires a passed result for '${result?.environmentId ?? "unknown-environment"}'`,
          );
        }
      }
    }
  }

  return failures.sort();
}

export function verifyRepositoryAssistiveTechnologyEvidence({
  root = repositoryRoot,
  requireComplete = false,
} = {}) {
  const componentCatalog = readJson(root, "docs/metadata/components.json");
  return verifyAssistiveTechnologyEvidence(
    readJson(root, "docs/metadata/assistive-technology-reviews.json"),
    {
      componentIds: new Set(
        componentCatalog.components.map((component) => component.id),
      ),
      fixtureInventory: readFixtureInventory(root),
      requireComplete,
      root,
    },
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const requireComplete = process.argv.includes("--require-complete");
  const failures = verifyRepositoryAssistiveTechnologyEvidence({
    requireComplete,
  });

  if (failures.length > 0) {
    throw new Error(
      `Assistive-technology evidence verification failed:\n- ${failures.join("\n- ")}`,
    );
  }

  console.log(
    requireComplete
      ? "Assistive-technology release evidence is complete."
      : "Assistive-technology evidence schema, fixtures, components, and pending-state honesty are consistent.",
  );
}
