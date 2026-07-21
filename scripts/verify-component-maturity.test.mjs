import assert from "node:assert/strict";
import test from "node:test";

import { maturityFixtures } from "./fixtures/component-maturity.mjs";
import { verifyMaturityMetadata } from "./verify-component-maturity.mjs";

function verifyFixture(fixture) {
  return verifyMaturityMetadata(fixture.catalog);
}

test("Alpha Stable interactive evidence requires DOM interaction proof", () => {
  assert(
    verifyFixture(maturityFixtures.alphaInteractiveWithoutDom).some((failure) =>
      failure.includes("missing evidence 'domInteractionTests'"),
    ),
  );
});

test("Alpha Stable non-interactive evidence does not require a keyboard contract", () => {
  assert.deepEqual(
    verifyFixture(maturityFixtures.alphaNonInteractiveWithoutKeyboard),
    [],
  );
});

test("Beta Stable evidence requires consuming-application proof", () => {
  assert(
    verifyFixture(maturityFixtures.betaWithoutConsumer).some((failure) =>
      failure.includes("missing evidence 'consumingApplication'"),
    ),
  );
});

test("Stable evidence requires browser and automated accessibility proof", () => {
  const failures = verifyFixture(
    maturityFixtures.stableWithoutBrowserOrAccessibility,
  );
  assert(
    failures.some((failure) =>
      failure.includes("missing evidence 'browserTests'"),
    ),
  );
  assert(
    failures.some((failure) =>
      failure.includes("missing evidence 'automatedAccessibility'"),
    ),
  );
});

test("Deprecated evidence requires migration guidance", () => {
  assert(
    verifyFixture(maturityFixtures.deprecatedWithoutMigration).some((failure) =>
      failure.includes("missing evidence 'migrationGuidance'"),
    ),
  );
});

test("Experimental evidence may remain incomplete after owner and locations are recorded", () => {
  assert.deepEqual(verifyFixture(maturityFixtures.experimentalIncomplete), []);
});
