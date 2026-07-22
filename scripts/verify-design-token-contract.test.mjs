import assert from "node:assert/strict";
import test from "node:test";

import {
  loadDesignTokenInputs,
  verifyDesignTokenContract,
} from "./verify-design-token-contract.mjs";

function cloneInputs() {
  const inputs = loadDesignTokenInputs();

  return {
    ...inputs,
    contract: structuredClone(inputs.contract),
  };
}

test("the repository design token contract passes", () => {
  assert.deepEqual(verifyDesignTokenContract(cloneInputs()), []);
});

test("duplicate canonical token names are rejected", () => {
  const inputs = cloneInputs();
  inputs.contract.categories[1].tokens.push(
    structuredClone(inputs.contract.categories[0].tokens[0]),
  );

  assert(
    verifyDesignTokenContract(inputs).some((failure) =>
      failure.includes("duplicate canonical token"),
    ),
  );
});

test("missing CSS declarations are rejected", () => {
  const inputs = cloneInputs();
  inputs.tokensCss = inputs.tokensCss.replace(
    /--vf-surface-page\s*:[^;]+;/u,
    "",
  );

  assert(
    verifyDesignTokenContract(inputs).some((failure) =>
      failure.includes("--vf-surface-page is missing"),
    ),
  );
});

test("incomplete theme presets are rejected", () => {
  const inputs = cloneInputs();
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

test("density aliases must remain represented in CSS", () => {
  const inputs = cloneInputs();
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

test("compatibility bridges cannot silently break", () => {
  const inputs = cloneInputs();
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

test("layer levels must remain unique and increasing", () => {
  const inputs = cloneInputs();
  inputs.contract.layers[2].level = inputs.contract.layers[1].level;

  assert(
    verifyDesignTokenContract(inputs).some((failure) =>
      failure.includes("layer levels must be unique"),
    ),
  );
});

test("reduced-motion fallbacks are mandatory", () => {
  const inputs = cloneInputs();
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
