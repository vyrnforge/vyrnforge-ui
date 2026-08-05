import assert from "node:assert/strict";
import test from "node:test";

import {
  loadSemanticTokenAdoptionInputs,
  verifySemanticTokenAdoption,
} from "./verify-semantic-token-adoption.mjs";

function cloneInputs() {
  const inputs = loadSemanticTokenAdoptionInputs();
  return structuredClone(inputs);
}

test("the repository semantic token adoption passes", () => {
  assert.deepEqual(verifySemanticTokenAdoption(cloneInputs()), []);
});

test("legacy shared token references are rejected", () => {
  const inputs = cloneInputs();
  inputs.componentCssFiles.push({
    path: "fixture.css",
    source: ".fixture { color: var(--vf-text); }",
  });

  assert(
    verifySemanticTokenAdoption(inputs).some((failure) =>
      failure.includes("legacy shared token --vf-text"),
    ),
  );
});

test("component hard-coded colors are rejected", () => {
  const inputs = cloneInputs();
  inputs.componentCssFiles.push({
    path: "fixture.css",
    source: ".fixture { color: #ffffff; }",
  });

  assert(
    verifySemanticTokenAdoption(inputs).some((failure) =>
      failure.includes("hard-coded color #ffffff"),
    ),
  );
});

test("literal component motion timings are rejected", () => {
  const inputs = cloneInputs();
  inputs.componentCssFiles.push({
    path: "fixture.css",
    source: ".fixture { transition: opacity 120ms ease; }",
  });

  assert(
    verifySemanticTokenAdoption(inputs).some((failure) =>
      failure.includes("literal motion timing"),
    ),
  );
});

test("shared themes cannot reintroduce duplicated grid color maps", () => {
  const inputs = cloneInputs();
  inputs.gridThemesCss += '\n.udg[data-theme="dark"] { --udg-bg: #000000; }\n';

  assert(
    verifySemanticTokenAdoption(inputs).some((failure) =>
      failure.includes("theme 'dark' must inherit"),
    ),
  );
});

test("missing grid semantic mappings are rejected", () => {
  const inputs = cloneInputs();
  inputs.gridTokensCss = inputs.gridTokensCss.replace(
    "--udg-row-border: var(--vf-divider);",
    "--udg-row-border: transparent;",
  );

  assert(
    verifySemanticTokenAdoption(inputs).some((failure) =>
      failure.includes("--udg-row-border must map to --vf-divider"),
    ),
  );
});

test("the documented high-contrast grid exception remains allowed", () => {
  const inputs = cloneInputs();
  const highContrast = inputs.gridCssFiles.find((file) =>
    file.path.endsWith("tokens/data-grid.themes.css"),
  );
  assert(highContrast?.source.includes("#ffffff"));
  assert.deepEqual(verifySemanticTokenAdoption(inputs), []);
});
