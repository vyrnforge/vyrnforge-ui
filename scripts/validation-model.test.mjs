import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCommandGraph,
  expandCommandExecutions,
  extractRootScriptDependencies,
  findCommandCycles,
  findDuplicateCommandDefinitions,
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

test("detects duplicate root command definitions despite whitespace", () => {
  assert.deepEqual(
    findDuplicateCommandDefinitions({
      "verify:vue-consumer:runtime":
        "node scripts/verify-consumer-foundations-runtime.mjs --fixture vue",
      "verify:vue-model-adapter:runtime":
        "node   scripts/verify-consumer-foundations-runtime.mjs   --fixture vue",
      "verify:angular-consumer:runtime":
        "node scripts/verify-consumer-foundations-runtime.mjs --fixture angular",
    }),
    [
      {
        command:
          "node scripts/verify-consumer-foundations-runtime.mjs --fixture vue",
        names: [
          "verify:vue-consumer:runtime",
          "verify:vue-model-adapter:runtime",
        ],
      },
    ],
  );
});

test("entrypoint expansion excludes unrelated command groups", () => {
  const graph = buildCommandGraph({
    ci: "npm run check && npm run test:contracts",
    check: "npm run verify:metadata",
    "test:contracts": "npm run test:current",
    "verify:metadata": "npm run verify:current",
    "test:optional": "node optional.test.mjs",
    "verify:optional": "node optional.mjs",
    "test:current": "node current.test.mjs",
    "verify:current": "node current.mjs",
  });

  const reached = expandCommandExecutions(graph, "ci").map(
    (execution) => execution.name,
  );
  assert.equal(reached.includes("test:optional"), false);
  assert.equal(reached.includes("verify:optional"), false);
});
