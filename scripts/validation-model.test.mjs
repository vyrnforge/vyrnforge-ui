import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCommandGraph,
  expandCommandExecutions,
  extractRootScriptDependencies,
  findCommandCycles,
  findDuplicateExecutions,
} from "./validation-model.mjs";

test("extracts root npm scripts and ignores workspace adapters", () => {
  assert.deepEqual(
    extractRootScriptDependencies(
      "npm run check && npm run test --workspace @vyrnforge/ui-core && npm run build:packages",
    ),
    ["check", "build:packages"],
  );
});

test("detects cycles in the root command graph", () => {
  const graph = buildCommandGraph({
    a: "npm run b",
    b: "npm run c",
    c: "npm run a",
  });
  assert.deepEqual(findCommandCycles(graph), [["a", "b", "c", "a"]]);
});

test("detects duplicate execution reached through different branches", () => {
  const graph = buildCommandGraph({
    ci: "npm run check && npm run build",
    check: "npm run shared",
    build: "npm run shared",
    shared: "node shared.mjs",
  });
  const duplicates = findDuplicateExecutions(
    expandCommandExecutions(graph, "ci"),
  );
  assert.equal(duplicates.length, 1);
  assert.equal(duplicates[0].name, "shared");
});

test("normal validation can exclude a conditional historical group", () => {
  const graph = buildCommandGraph({
    ci: "npm run check && npm run test:contracts",
    check: "npm run verify:metadata",
    "test:contracts": "npm run test:current",
    "verify:metadata": "npm run verify:current",
    "test:historical-evidence": "npm run test:gmf4-closure",
    "verify:historical-evidence": "npm run verify:gmf4-closure",
    "test:current": "node current.test.mjs",
    "verify:current": "node current.mjs",
    "test:gmf4-closure": "node gmf4.test.mjs",
    "verify:gmf4-closure": "node gmf4.mjs",
  });

  const reached = expandCommandExecutions(graph, "ci").map(
    (execution) => execution.name,
  );
  assert.equal(reached.includes("test:historical-evidence"), false);
  assert.equal(reached.includes("verify:historical-evidence"), false);
  assert.equal(reached.includes("test:gmf4-closure"), false);
  assert.equal(reached.includes("verify:gmf4-closure"), false);
});
