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
    requiredScenarioIds = null,
    waivedScenarioIds = new Set(),
  } = {},
) {
  const failures = [];
  const requiredScenarioIdSet =
    requiredScenarioIds instanceof Set
      ? requiredScenarioIds
      : new Set((evidence?.scenarios ?? []).map((scenario) => scenario.id));
  const waivedScenarioIdSet =
    waivedScenarioIds instanceof Set
      ? waivedScenarioIds
      : new Set(waivedScenarioIds ?? []);
  const strictScenarioIds = new Set(
    [...requiredScenarioIdSet].filter(
      (scenarioId) => !waivedScenarioIdSet.has(scenarioId),
    ),
  );
  const strictEnvironmentIds = new Set(
    (evidence?.scenarios ?? [])
      .filter((scenario) => strictScenarioIds.has(scenario?.id))
      .flatMap((scenario) => scenario.environmentIds ?? []),
  );

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

    if (
      requireComplete &&
      strictEnvironmentIds.has(environmentId) &&
      environment.status !== "complete"
    ) {
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

    if (
      requireComplete &&
      strictScenarioIds.has(scope) &&
      scenario.status !== "complete"
    ) {
      addFailure(
        failures,
        scope,
        "release verification requires a complete scenario",
      );
    }
    if (requireComplete && strictScenarioIds.has(scope)) {
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
  releaseGroup,
  version,
  allowWaiver = false,
} = {}) {
  const failures = [];
  const componentCatalog = readJson(root, "docs/metadata/components.json");
  const evidence = readJson(
    root,
    "docs/metadata/assistive-technology-reviews.json",
  );
  const allScenarioIds = new Set(
    evidence.scenarios.map((scenario) => scenario.id),
  );
  let requiredScenarioIds = allScenarioIds;
  const waivedScenarioIds = new Set();

  if ((releaseGroup && !version) || (!releaseGroup && version)) {
    failures.push(
      "release-group and version must be supplied together for assistive-technology release verification",
    );
  }

  if (releaseGroup) {
    if (
      releaseGroup !== "non-grid-beta" &&
      releaseGroup !== "data-grid-alpha"
    ) {
      failures.push(
        `unsupported assistive-technology release group: ${releaseGroup}`,
      );
    } else {
      const nonGridScope = readJson(
        root,
        "docs/metadata/non-grid-beta-scope.json",
      );
      const nonGridComponentIds = new Set(
        nonGridScope.components.map((component) => component.id),
      );

      requiredScenarioIds = new Set(
        evidence.scenarios
          .filter((scenario) =>
            releaseGroup === "non-grid-beta"
              ? scenario.componentIds.every((componentId) =>
                  nonGridComponentIds.has(componentId),
                )
              : scenario.componentIds.some(
                  (componentId) => !nonGridComponentIds.has(componentId),
                ),
          )
          .map((scenario) => scenario.id),
      );
    }
  }

  if (allowWaiver) {
    if (!releaseGroup || !version) {
      failures.push(
        "an assistive-technology waiver requires release-group and version",
      );
    } else {
      const waiverManifest = readJson(
        root,
        "docs/metadata/assistive-technology-release-waivers.json",
      );

      if (
        waiverManifest.schemaVersion !== 1 ||
        waiverManifest.sourceOfTruth?.canonical !== true
      ) {
        failures.push(
          "assistive-technology waiver metadata must use canonical schema version 1",
        );
      }

      const matches = (waiverManifest.waivers ?? []).filter(
        (waiver) =>
          waiver.status === "active" &&
          waiver.releaseGroup === releaseGroup &&
          waiver.version === version,
      );

      if (matches.length !== 1) {
        failures.push(
          `expected exactly one active assistive-technology waiver for ${releaseGroup}@${version}`,
        );
      } else {
        const waiver = matches[0];
        const expectedScenarioIds = [...requiredScenarioIds].sort();
        const actualScenarioIds = [...(waiver.scenarioIds ?? [])].sort();
        const expiration = Date.parse(`${waiver.expiresAt ?? ""}T23:59:59Z`);

        if (!/^AT-WAIVER-\d{3}$/.test(waiver.id ?? "")) {
          failures.push("assistive-technology waiver id is invalid");
        }

        if (
          actualScenarioIds.length !== expectedScenarioIds.length ||
          !expectedScenarioIds.every(
            (scenarioId, index) => actualScenarioIds[index] === scenarioId,
          )
        ) {
          failures.push(
            "assistive-technology waiver scope must exactly match the selected release scenarios",
          );
        }

        if (
          typeof waiver.owner !== "string" ||
          waiver.owner.trim().length === 0 ||
          typeof waiver.reason !== "string" ||
          waiver.reason.trim().length === 0
        ) {
          failures.push(
            "assistive-technology waiver requires an owner and reason",
          );
        }

        if (
          !/^https:\/\/github\.com\/vyrnforge\/vyrnforge-ui\/issues\/\d+$/.test(
            waiver.trackingIssue ?? "",
          )
        ) {
          failures.push(
            "assistive-technology waiver requires a VyrnForge tracking issue",
          );
        }

        if (Number.isNaN(expiration) || expiration < Date.now()) {
          failures.push(
            "assistive-technology waiver is expired or has an invalid expiry date",
          );
        }

        if (
          waiver.blocksStablePromotion !== true ||
          waiver.requiresReviewBeforeAccessibilityCompleteClaim !== true
        ) {
          failures.push(
            "assistive-technology waiver must block stable promotion and accessibility-complete claims",
          );
        }

        if (
          !Array.isArray(waiver.knownCriticalAccessibilityFindings) ||
          waiver.knownCriticalAccessibilityFindings.length !== 0
        ) {
          failures.push(
            "assistive-technology waiver cannot cover known critical accessibility findings",
          );
        }

        for (const scenarioId of waiver.scenarioIds ?? []) {
          const scenario = evidence.scenarios.find(
            (candidate) => candidate.id === scenarioId,
          );

          if (
            scenario?.status !== "pending" ||
            !Array.isArray(scenario.results) ||
            scenario.results.length !== 0
          ) {
            failures.push(
              `${scenarioId}: waived scenario must remain pending with no fabricated results`,
            );
          }
        }

        if (failures.length === 0) {
          for (const scenarioId of waiver.scenarioIds) {
            waivedScenarioIds.add(scenarioId);
          }
        }
      }
    }
  }

  failures.push(
    ...verifyAssistiveTechnologyEvidence(evidence, {
      componentIds: new Set(
        componentCatalog.components.map((component) => component.id),
      ),
      fixtureInventory: readFixtureInventory(root),
      requireComplete,
      requiredScenarioIds,
      waivedScenarioIds,
      root,
    }),
  );

  return failures.sort();
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const readArgument = (name) => {
    const index = process.argv.indexOf(name);
    return index === -1 ? undefined : process.argv[index + 1];
  };
  const requireComplete = process.argv.includes("--require-complete");
  const allowWaiver = process.argv.includes("--allow-waiver");
  const releaseGroup = readArgument("--release-group");
  const version = readArgument("--version");
  const failures = verifyRepositoryAssistiveTechnologyEvidence({
    allowWaiver,
    releaseGroup,
    requireComplete,
    version,
  });

  if (failures.length > 0) {
    throw new Error(
      `Assistive-technology evidence verification failed:\n- ${failures.join("\n- ")}`,
    );
  }

  if (requireComplete && allowWaiver) {
    console.log(
      `Assistive-technology release verification passed for ${releaseGroup}@${version} using a valid time-limited waiver. Manual screen-reader completion is not claimed.`,
    );
  } else {
    console.log(
      requireComplete
        ? "Assistive-technology release evidence is complete."
        : "Assistive-technology evidence schema, fixtures, components, and pending-state honesty are consistent.",
    );
  }
}
