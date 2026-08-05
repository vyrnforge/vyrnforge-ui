import assert from "node:assert/strict";
import { test } from "node:test";

import { loadG3ClosureInputs, verifyG3Closure } from "./verify-g3-closure.mjs";

function clone(value) {
  return structuredClone(value);
}

const validInputs = loadG3ClosureInputs();

test("accepts the committed VF-3012 G3 closure record", () => {
  assert.deepEqual(verifyG3Closure(validInputs), []);
});

test("rejects missing S3 tasks", () => {
  const inputs = clone(validInputs);
  inputs.closure.tasks.pop();

  assert.match(
    verifyG3Closure(inputs).join("\n"),
    /must account for VF-3001 through VF-3012/u,
  );
});

test("rejects unresolved blockers", () => {
  const inputs = clone(validInputs);
  inputs.closure.blockers.push("visual evidence missing");

  assert.match(
    verifyG3Closure(inputs).join("\n"),
    /must not retain unresolved blockers/u,
  );
});

test("rejects incomplete design-token gate metadata", () => {
  const inputs = clone(validInputs);
  delete inputs.designTokens.sourceOfTruth.gateState;

  assert.match(
    verifyG3Closure(inputs).join("\n"),
    /design-token metadata must identify G3 as evidence-complete/u,
  );
});

test("rejects missing G3 quality commands", () => {
  const inputs = clone(validInputs);
  delete inputs.packageJson.scripts["verify:g3-closure"];

  assert.match(
    verifyG3Closure(inputs).join("\n"),
    /missing G3 command verify:g3-closure/u,
  );
});

test("rejects missing closure evidence files", () => {
  const inputs = clone(validInputs);
  inputs.closure.evidence[0].path = "docs/metadata/missing.json";

  assert.match(
    verifyG3Closure(inputs).join("\n"),
    /G3 evidence file is missing/u,
  );
});
