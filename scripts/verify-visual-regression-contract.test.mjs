import assert from "node:assert/strict";
import { test } from "node:test";

import {
  loadVisualRegressionInputs,
  verifyVisualRegressionContract,
} from "./verify-visual-regression-contract.mjs";

function clone(value) {
  return structuredClone(value);
}

const validInputs = loadVisualRegressionInputs();

test("accepts the committed VF-3011 visual regression contract", () => {
  assert.deepEqual(verifyVisualRegressionContract(validInputs), []);
});

test("rejects incomplete theme and density dimensions", () => {
  const inputs = clone(validInputs);
  inputs.matrix.dimensions.themes = ["light"];

  assert.match(
    verifyVisualRegressionContract(inputs).join("\n"),
    /must cover light\/dark/u,
  );
});

test("rejects unknown fixtures", () => {
  const inputs = clone(validInputs);
  inputs.matrix.suites[0].fixtureId = "unknown-fixture";

  assert.match(
    verifyVisualRegressionContract(inputs).join("\n"),
    /references unknown fixture/u,
  );
});

test("rejects unknown shared tokens", () => {
  const inputs = clone(validInputs);
  inputs.matrix.suites[0].targets[0].expectations[0].token =
    "--vf-does-not-exist";

  assert.match(
    verifyVisualRegressionContract(inputs).join("\n"),
    /unknown shared token/u,
  );
});

test("rejects undefined grid tokens", () => {
  const inputs = clone(validInputs);
  inputs.matrix.suites[1].targets[0].expectations[0].token =
    "--udg-does-not-exist";

  assert.match(
    verifyVisualRegressionContract(inputs).join("\n"),
    /undefined grid token/u,
  );
});

test("rejects incorrect expanded case totals", () => {
  const inputs = clone(validInputs);
  inputs.matrix.expectedCaseCount = 13;

  assert.match(
    verifyVisualRegressionContract(inputs).join("\n"),
    /does not match 14 expanded cases/u,
  );
});

test("rejects missing screenshot artifact integration", () => {
  const inputs = clone(validInputs);
  inputs.browserWorkflow = inputs.browserWorkflow.replace(
    "test-results/visual-evidence/",
    "test-results/removed/",
  );

  assert.match(
    verifyVisualRegressionContract(inputs).join("\n"),
    /must upload successful visual-regression evidence/u,
  );
});
