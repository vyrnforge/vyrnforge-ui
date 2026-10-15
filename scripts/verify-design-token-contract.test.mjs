import assert from "node:assert/strict";
import test from "node:test";

import {
  loadDesignTokenInputs,
  verifyDesignTokenContract,
} from "./verify-design-token-contract.mjs";

async function cloneInputs() {
  return structuredClone(await loadDesignTokenInputs());
}

test("the repository design token contract passes", async () => {
  assert.deepEqual(verifyDesignTokenContract(await cloneInputs()), []);
});

test("unclassified CSS tokens are rejected", async () => {
  const inputs = await cloneInputs();
  inputs.tokensCss = inputs.tokensCss.replace(
    ":root {",
    ":root {\n  --vf-unregistered-test-token: 1px;",
  );

  assert(
    verifyDesignTokenContract(inputs).some((failure) =>
      failure.includes("--vf-unregistered-test-token is not classified"),
    ),
  );
});

test("missing semantic CSS declarations are rejected", async () => {
  const inputs = await cloneInputs();
  inputs.tokensCss = inputs.tokensCss.replace(
    /--vf-surface-page\s*:[^;]+;/u,
    "",
  );

  assert(
    verifyDesignTokenContract(inputs).some((failure) =>
      failure.includes("--vf-surface-page is registered by ui-core but missing"),
    ),
  );
});

test("duplicate semantic token names are rejected", async () => {
  const inputs = await cloneInputs();
  inputs.reference.categories[1].tokens.push(
    structuredClone(inputs.reference.categories[0].tokens[0]),
  );

  assert(
    verifyDesignTokenContract(inputs).some((failure) =>
      failure.includes("semantic token registry contains duplicate"),
    ),
  );
});

test("generated Reference token ownership cannot drift", async () => {
  const inputs = await cloneInputs();
  inputs.reference.sourceOfTruth.authority = "docs/metadata/design-tokens.json";

  assert(
    verifyDesignTokenContract(inputs).some((failure) =>
      failure.includes("generated projection of ui-core authority"),
    ),
  );
});

test("density aliases must remain represented in CSS", async () => {
  const inputs = await cloneInputs();
  inputs.densityCss = inputs.densityCss.replaceAll(
    '[data-density="standard"]',
    '[data-density="removed-standard"]',
  );

  assert(
    verifyDesignTokenContract(inputs).some((failure) =>
      failure.includes("density.css is missing density 'standard'"),
    ),
  );
});

test("compatibility aliases cannot silently break", async () => {
  const inputs = await cloneInputs();
  inputs.tokensCss = inputs.tokensCss.replace(
    "--vf-z-dialog: var(--vf-layer-modal);",
    "--vf-z-dialog: 80;",
  );

  assert(
    verifyDesignTokenContract(inputs).some((failure) =>
      failure.includes("--vf-z-dialog must alias --vf-layer-modal"),
    ),
  );
});

test("reduced-motion fallbacks are mandatory", async () => {
  const inputs = await cloneInputs();
  inputs.accessibilityCss = inputs.accessibilityCss.replace(
    "@media (prefers-reduced-motion: reduce)",
    "@media (prefers-reduced-motion: no-preference)",
  );

  assert(
    verifyDesignTokenContract(inputs).some((failure) =>
      failure.includes("reduced-motion CSS is missing"),
    ),
  );
});
