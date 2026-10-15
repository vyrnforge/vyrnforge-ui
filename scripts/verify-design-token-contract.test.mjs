import assert from "node:assert/strict";
import test from "node:test";

import {
  loadDesignTokenInputs,
  verifyDesignTokenContract,
} from "./verify-design-token-contract.mjs";

async function cloneInputs() {
  const inputs = await loadDesignTokenInputs();

  return {
    ...inputs,
    registry: structuredClone(inputs.registry),
  };
}

test("the repository design token contract passes", async () => {
  assert.deepEqual(verifyDesignTokenContract(await cloneInputs()), []);
});

test("unregistered CSS tokens are rejected", async () => {
  const inputs = await cloneInputs();
  inputs.tokensCss = inputs.tokensCss.replace(
    ":root {",
    ":root {\n  --vf-unregistered-test-token: 1px;",
  );

  assert(
    verifyDesignTokenContract(inputs).some((failure) =>
      failure.includes("--vf-unregistered-test-token exists"),
    ),
  );
});

test("missing primitive CSS declarations are rejected", async () => {
  const inputs = await cloneInputs();
  inputs.tokensCss = inputs.tokensCss.replace(
    /--vf-space-1\s*:[^;]+;/u,
    "",
  );

  assert(
    verifyDesignTokenContract(inputs).some((failure) =>
      failure.includes("--vf-space-1 is registered but missing"),
    ),
  );
});

test("reader categories cannot drift from semantic groups", async () => {
  const inputs = await cloneInputs();
  inputs.registry.vyrnForgeDesignTokenCategories[0].tokens.pop();

  assert(
    verifyDesignTokenContract(inputs).some((failure) =>
      failure.includes("reader token category 'surface' drifted"),
    ),
  );
});

test("duplicate registered token names are rejected", async () => {
  const inputs = await cloneInputs();
  inputs.registry.vyrnForgePrimitiveTokenGroups.shadow.push("--vf-space-1");

  assert(
    verifyDesignTokenContract(inputs).some((failure) =>
      failure.includes("token registry contains duplicate '--vf-space-1'"),
    ),
  );
});

test("incomplete theme presets are rejected", async () => {
  const inputs = await cloneInputs();
  inputs.themePresetSource = inputs.themePresetSource.replace(
    /"--vf-text-primary"\s*:[^,]+,\n/u,
    "",
  );

  assert(
    verifyDesignTokenContract(inputs).some((failure) =>
      failure.includes("is missing theme-scoped token --vf-text-primary"),
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
      failure.includes("density alias 'standard'"),
    ),
  );
});

test("compatibility bridges cannot silently break", async () => {
  const inputs = await cloneInputs();
  inputs.tokensCss = inputs.tokensCss.replace(
    "--vf-surface-page: var(--vf-bg);",
    "--vf-surface-page: #ffffff;",
  );

  assert(
    verifyDesignTokenContract(inputs).some((failure) =>
      failure.includes("must preserve compatibility through --vf-bg"),
    ),
  );
});

test("layer levels must remain unique and increasing", async () => {
  const inputs = await cloneInputs();
  inputs.registry.vyrnForgeLayerOrder[2].level =
    inputs.registry.vyrnForgeLayerOrder[1].level;

  assert(
    verifyDesignTokenContract(inputs).some((failure) =>
      failure.includes("layer levels must be unique"),
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
      failure.includes("automatic reduced-motion media query is missing"),
    ),
  );
});
