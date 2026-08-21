import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export const activeContractTests = [
  "test:canonical-contracts",
  "test:ci-scope",
  "test:package-boundaries",
  "test:component-metadata",
  "test:beta-scope",
  "test:release-groups",
  "test:beta-package-contract",
  "test:beta-package-size-budgets",
  "test:release-size-budgets",
  "test:compatibility-release-matrix",
  "test:security-workflow-hardening",
  "test:trusted-publishing-provenance",
  "test:trusted-publishing-dry-run",
  "test:release-artifact",
  "test:release-dry-run",
  "test:multi-framework",
  "test:behavior-foundations",
  "test:component-maturity",
  "test:design-tokens",
  "test:token-adoption",
  "test:visual-regression",
  "test:consumer-foundations",
  "test:component-reference",
  "test:maturity-closure",
  "test:assistive-technology",
  "test:templates",
  "test:documentation-current",
  "test:validation-model",
];

export const historicalEvidenceTests = [
  "test:g3-closure",
  "test:gmf1-closure",
  "test:react-behavior-adoption",
  "test:gmf2-closure",
  "test:native-element-foundations",
  "test:native-core-elements",
  "test:native-advanced-elements",
  "test:gmf3-closure",
  "test:angular-consumer",
  "test:angular-forms-adapter",
  "test:vue-consumer",
  "test:vue-model-adapter",
  "test:ssr-bundler",
  "test:cross-framework-matrix",
  "test:cross-framework-accessibility",
  "test:multi-framework-migration-guide",
  "test:gmf4-closure",
];

export const activeMetadataVerifiers = [
  "verify:component-metadata",
  "verify:beta-scope",
  "verify:release-groups",
  "verify:beta-package-contract",
  "verify:beta-package-size-budget-contract",
  "verify:compatibility-release-matrix",
  "verify:security-workflow-hardening",
  "verify:trusted-publishing-provenance",
  "verify:multi-framework",
  "verify:behavior-foundations",
  "verify:consumer-foundations",
  "verify:component-reference",
];

export const historicalEvidenceVerifiers = [
  "verify:g3-closure",
  "verify:gmf1-closure",
  "verify:react-behavior-adoption",
  "verify:gmf2-closure",
  "verify:native-element-foundations",
  "verify:native-core-elements",
  "verify:native-advanced-elements",
  "verify:gmf3-closure",
  "verify:angular-consumer",
  "verify:angular-forms-adapter",
  "verify:vue-consumer",
  "verify:vue-model-adapter",
  "verify:ssr-bundler",
  "verify:cross-framework-matrix",
  "verify:cross-framework-accessibility",
  "verify:multi-framework-migration-guide",
  "verify:gmf4-closure",
];

export function extractRootScriptDependencies(command) {
  return command.split(/\s*(?:&&|\|\||;)\s*/u).flatMap((segment) => {
    if (!/\bnpm\s+run\s+/u.test(segment)) return [];
    if (/(?:^|\s)--workspace(?:=|\s)/u.test(segment)) return [];

    const match = segment.match(/\bnpm\s+run\s+([A-Za-z0-9:._-]+)/u);
    return match ? [match[1]] : [];
  });
}

export function buildCommandGraph(scripts) {
  return Object.fromEntries(
    Object.entries(scripts).map(([name, command]) => [
      name,
      extractRootScriptDependencies(command).filter((dependency) =>
        Object.hasOwn(scripts, dependency),
      ),
    ]),
  );
}

export function findCommandCycles(graph) {
  const cycles = [];
  const visited = new Set();
  const active = new Set();
  const stack = [];

  function visit(name) {
    if (active.has(name)) {
      const index = stack.indexOf(name);
      cycles.push([...stack.slice(index), name]);
      return;
    }
    if (visited.has(name)) return;

    active.add(name);
    stack.push(name);
    for (const dependency of graph[name] ?? []) visit(dependency);
    stack.pop();
    active.delete(name);
    visited.add(name);
  }

  for (const name of Object.keys(graph)) visit(name);
  return cycles;
}

export function expandCommandExecutions(graph, entrypoint) {
  const executions = [];

  function visit(name, trail) {
    const nextTrail = [...trail, name];
    executions.push({ name, trail: nextTrail });
    for (const dependency of graph[name] ?? []) visit(dependency, nextTrail);
  }

  visit(entrypoint, []);
  return executions;
}

export function findDuplicateExecutions(executions) {
  const occurrences = new Map();
  for (const execution of executions) {
    const list = occurrences.get(execution.name) ?? [];
    list.push(execution.trail);
    occurrences.set(execution.name, list);
  }

  return [...occurrences.entries()]
    .filter(([, trails]) => trails.length > 1)
    .map(([name, trails]) => ({ name, trails }));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function exactDependencies(graph, scriptName, expected) {
  const actual = graph[scriptName] ?? [];
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

export function verifyRepositoryValidationModel({ root, writeReport = true }) {
  const packageJson = JSON.parse(
    readFileSync(path.join(root, "package.json"), "utf8"),
  );
  const metadata = JSON.parse(
    readFileSync(
      path.join(root, "docs/metadata/validation-layers.json"),
      "utf8",
    ),
  );
  const scopedRunner = readFileSync(
    path.join(root, "scripts/run-scoped-quality.mjs"),
    "utf8",
  );
  const scripts = packageJson.scripts ?? {};
  const publicCommands = ["check", "test", "build", "ci"];

  for (const command of publicCommands) {
    assert(
      typeof scripts[command] === "string",
      `missing public command: ${command}`,
    );
  }
  for (const deprecated of ["quality", "verify:ci"]) {
    assert(
      !Object.hasOwn(scripts, deprecated),
      `deprecated command remains: ${deprecated}`,
    );
  }

  assert(
    metadata.schemaVersion === 2,
    "validation metadata must use schemaVersion 2",
  );
  assert(
    JSON.stringify(metadata.publicCommands) === JSON.stringify(publicCommands),
    "validation metadata must expose only check, test, build, and ci",
  );
  assert(
    metadata.historicalEvidence?.normalValidation === false,
    "historical evidence must be excluded from normal validation",
  );
  assert(
    metadata.historicalEvidence?.scopeVariable ===
      "CI_SCOPE_HISTORICAL_EVIDENCE",
    "historical evidence must use its dedicated scope variable",
  );

  const layerNames = Object.keys(metadata.layers ?? {});
  assert(
    JSON.stringify(layerNames) ===
      JSON.stringify(["pull-request", "main", "nightly", "release"]),
    "validation metadata must define pull-request, main, nightly, and release in order",
  );

  const checkIds = new Set();
  const checkCommands = new Set();
  for (const check of metadata.checks ?? []) {
    assert(
      !checkIds.has(check.id),
      `duplicate validation check id: ${check.id}`,
    );
    assert(
      layerNames.includes(check.owner),
      `validation check ${check.id} has unknown owner ${check.owner}`,
    );
    assert(
      !checkCommands.has(check.command),
      `validation command has multiple owners: ${check.command}`,
    );
    checkIds.add(check.id);
    checkCommands.add(check.command);
  }

  assert(
    scopedRunner.includes("CI_SCOPE_HISTORICAL_EVIDENCE"),
    "scoped runner must expose the historical-evidence scope",
  );
  assert(
    scopedRunner.includes('"test:historical-evidence"') &&
      scopedRunner.includes('"verify:historical-evidence"'),
    "scoped runner must execute both historical evidence groups when selected",
  );
  assert(
    !scopedRunner.includes('"verify:ci"'),
    "scoped runner must not invoke verify:ci",
  );
  assert(
    !scopedRunner.includes('"quality"'),
    "scoped runner must not invoke quality",
  );

  const graph = buildCommandGraph(scripts);

  assert(
    exactDependencies(graph, "test:contracts", activeContractTests),
    "test:contracts must contain the exact active contract test group",
  );
  assert(
    exactDependencies(
      graph,
      "test:historical-evidence",
      historicalEvidenceTests,
    ),
    "test:historical-evidence must contain the exact historical test group",
  );
  assert(
    exactDependencies(graph, "verify:metadata", activeMetadataVerifiers),
    "verify:metadata must contain the exact active metadata group",
  );
  assert(
    exactDependencies(
      graph,
      "verify:historical-evidence",
      historicalEvidenceVerifiers,
    ),
    "verify:historical-evidence must contain the exact historical verifier group",
  );

  const historicalNames = new Set([
    "test:historical-evidence",
    "verify:historical-evidence",
    ...historicalEvidenceTests,
    ...historicalEvidenceVerifiers,
  ]);
  for (const entrypoint of ["check", "ci"]) {
    const reached = expandCommandExecutions(graph, entrypoint).map(
      (execution) => execution.name,
    );
    for (const historicalName of historicalNames) {
      assert(
        !reached.includes(historicalName),
        `${entrypoint} must not execute historical evidence: ${historicalName}`,
      );
    }
  }

  const cycles = findCommandCycles(graph);
  assert(cycles.length === 0, `validation command cycles detected: ${JSON.stringify(cycles)}`);

  const duplicateExecutions = findDuplicateExecutions(
    expandCommandExecutions(graph, "ci"),
  ).filter(({ name }) => !["test", "build"].includes(name));
  assert(
    duplicateExecutions.length === 0,
    `normal CI executes commands more than once: ${JSON.stringify(duplicateExecutions)}`,
  );

  if (writeReport) {
    const reportDirectory = path.join(root, "docs/generated");
    mkdirSync(reportDirectory, { recursive: true });
    writeFileSync(
      path.join(reportDirectory, "validation-graph.md"),
      renderValidationGraph({ graph, metadata }),
      "utf8",
    );
  }

  return { graph, metadata };
}

export function renderValidationGraph({ graph, metadata }) {
  const lines = [
    "# Validation Graph",
    "",
    "Generated by `npm run verify:validation-model`. Do not edit manually.",
    "",
    "## Public commands",
    "",
    ...metadata.publicCommands.map((command) => `- \`${command}\``),
    "",
    "## Validation layers",
    "",
    ...Object.entries(metadata.layers).map(
      ([name, layer]) => `- **${name}**: ${layer.description}`,
    ),
    "",
    "## Root command dependencies",
    "",
    ...Object.entries(graph)
      .filter(([, dependencies]) => dependencies.length > 0)
      .map(
        ([name, dependencies]) =>
          `- \`${name}\` -> ${dependencies.map((dependency) => `\`${dependency}\``).join(", ")}`,
      ),
    "",
  ];

  return `${lines.join("\n")}\n`;
}
