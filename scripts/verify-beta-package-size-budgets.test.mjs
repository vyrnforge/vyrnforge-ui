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

function manifest(overrides = {}) {
  return {
    waiverPolicy: { maximumDurationDays: 30 },
    packages: [
      {
        name: "@vyrnforge/ui-core",
        budgets: { ...metrics, ...overrides.budgets },
      },
    ],
    waivers: overrides.waivers ?? [],
  };
}

const measurements = [{ name: "@vyrnforge/ui-core", ...metrics }];
const now = new Date("2026-08-04T00:00:00Z");

test("accepts measurements within every budget", () => {
  const result = evaluateSizeBudgets({
    manifest: manifest(),
    measurements,
    now,
  });
  assert.deepEqual(result.failures, []);
});

test("rejects a package budget regression without a waiver", () => {
  const result = evaluateSizeBudgets({
    manifest: manifest({ budgets: { cssBytes: 5 } }),
    measurements,
    now,
  });
  assert(
    result.failures.some((failure) => failure.includes("cssBytes 6 exceeds 5")),
  );
});

test("accepts a narrow unexpired waiver", () => {
  const result = evaluateSizeBudgets({
    manifest: manifest({
      budgets: { cssBytes: 5 },
      waivers: [
        {
          package: "@vyrnforge/ui-core",
          metric: "cssBytes",
          maxValue: 7,
          owner: "Quality Engineering",
          reason: "Temporary reviewed beta regression",
          expiresOn: "2026-08-20",
        },
      ],
    }),
    measurements,
    now,
  });
  assert.deepEqual(result.failures, []);
  assert.equal(result.waiverResults.length, 1);
});

test("rejects expired, excessive, and insufficient waivers", () => {
  for (const waiver of [
    {
      package: "@vyrnforge/ui-core",
      metric: "cssBytes",
      maxValue: 7,
      owner: "Quality Engineering",
      reason: "Expired",
      expiresOn: "2026-08-03",
    },
    {
      package: "@vyrnforge/ui-core",
      metric: "cssBytes",
      maxValue: 7,
      owner: "Quality Engineering",
      reason: "Too long",
      expiresOn: "2026-12-31",
    },
    {
      package: "@vyrnforge/ui-core",
      metric: "cssBytes",
      maxValue: 5,
      owner: "Quality Engineering",
      reason: "Too small",
      expiresOn: "2026-08-20",
    },
  ]) {
    const result = evaluateSizeBudgets({
      manifest: manifest({ budgets: { cssBytes: 5 }, waivers: [waiver] }),
      measurements,
      now,
    });
    assert(result.failures.length > 0);
  }
});
