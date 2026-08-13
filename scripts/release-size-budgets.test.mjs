import assert from "node:assert/strict";
import test from "node:test";

import { evaluateReleaseSizeBudgets } from "./release-size-budgets.mjs";

test("size budgets apply only to packages that declare a policy", () => {
  const releaseGroup = {
    packages: [
      {
        name: "@vyrnforge/ui-angular",
        policies: {
          sizeBudget: {
            packedBytes: 100,
            unpackedBytes: 200,
            fileCount: 10,
            runtimeJavaScriptBytes: 100,
            declarationBytes: 50,
            cssBytes: 0,
          },
        },
      },
      { name: "@vyrnforge/no-budget", policies: {} },
    ],
  };
  const measurements = [
    {
      name: "@vyrnforge/ui-angular",
      packedBytes: 101,
      unpackedBytes: 200,
      fileCount: 10,
      runtimeJavaScriptBytes: 100,
      declarationBytes: 50,
      cssBytes: 0,
    },
  ];
  assert.deepEqual(evaluateReleaseSizeBudgets({ releaseGroup, measurements }), [
    "@vyrnforge/ui-angular: packedBytes 101 exceeds 100",
  ]);
});
