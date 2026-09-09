import assert from "node:assert/strict";
import test from "node:test";

import { evaluateSizeBudgets } from "./beta-package-size-budgets.mjs";

const metrics = {
  packedBytes: 10,
  unpackedBytes: 20,
  fileCount: 3,
  runtimeJavaScriptBytes: 4,
  declarationBytes: 5,
  cssBytes: 6,
};

function manifest(budgets = {}) {
  return {
    packages: [
      {
        name: "@vyrnforge/ui-core",
        budgets: { ...metrics, ...budgets },
      },
    ],
  };
}

const measurements = [{ name: "@vyrnforge/ui-core", ...metrics }];

test("accepts measurements within every canonical release-group budget", () => {
  const result = evaluateSizeBudgets({
    manifest: manifest(),
    measurements,
  });
  assert.deepEqual(result.failures, []);
  assert.deepEqual(result.waiverResults, []);
});

test("rejects a package budget regression", () => {
  const result = evaluateSizeBudgets({
    manifest: manifest({ cssBytes: 5 }),
    measurements,
  });
  assert(
    result.failures.some((failure) => failure.includes("cssBytes 6 exceeds 5")),
  );
});

test("rejects missing measurements", () => {
  const result = evaluateSizeBudgets({
    manifest: manifest(),
    measurements: [],
  });
  assert.deepEqual(result.failures, [
    "@vyrnforge/ui-core: size measurement is missing",
  ]);
});

test("rejects missing canonical metric limits", () => {
  const { cssBytes: _cssBytes, ...incomplete } = metrics;
  const result = evaluateSizeBudgets({
    manifest: {
      packages: [
        {
          name: "@vyrnforge/ui-core",
          budgets: incomplete,
        },
      ],
    },
    measurements,
  });
  assert(
    result.failures.some((failure) =>
      failure.includes("cssBytes budget is invalid"),
    ),
  );
});
