import assert from "node:assert/strict";
import test from "node:test";

import { planCiScope } from "./detect-ci-scope.mjs";

function expectEnabled(plan, keys) {
  for (const key of keys) {
    assert.equal(plan[key], true, `${key} should be enabled`);
  }
}

function expectDisabled(plan, keys) {
  for (const key of keys) {
    assert.equal(plan[key], false, `${key} should be disabled`);
  }
}

test("ui-core runtime changes validate all downstream packages and consumers", () => {
  const plan = planCiScope(["packages/ui-core/src/theme.ts"]);
  expectEnabled(plan, [
    "quality",
    "ui_core",
    "ui_components",
    "ui_data_grid",
    "packages",
    "consumer",
    "docs",
    "playground"
  ]);
  assert.equal(plan.full, false);
});

test("ui-components runtime changes validate components, grid, and consumers", () => {
  const plan = planCiScope(["packages/ui-components/src/Button/Button.tsx"]);
  expectEnabled(plan, [
    "quality",
    "ui_components",
    "ui_data_grid",
    "packages",
    "consumer",
    "docs",
    "playground"
  ]);
  expectDisabled(plan, ["ui_core", "full"]);
});

test("ui-data-grid test changes run only targeted quality", () => {
  const plan = planCiScope(["packages/ui-data-grid/src/grid.test.tsx"]);
  expectEnabled(plan, ["quality", "ui_data_grid"]);
  expectDisabled(plan, ["packages", "consumer", "docs", "playground", "full"]);
});

test("package README changes verify the published payload and consumer", () => {
  const plan = planCiScope(["packages/ui-components/README.md"]);
  expectEnabled(plan, ["packages", "consumer"]);
  expectDisabled(plan, ["quality", "docs", "playground", "full"]);
});

test("canonical docs-only changes build docs without package runtime checks", () => {
  const plan = planCiScope(["docs/release/publication-procedure.md"]);
  expectEnabled(plan, ["docs", "docs_only"]);
  expectDisabled(plan, ["quality", "packages", "consumer", "playground", "full"]);
});

test("metadata changes verify metadata and build docs", () => {
  const plan = planCiScope(["docs/metadata/components.json"]);
  expectEnabled(plan, ["quality", "metadata", "docs"]);
  expectDisabled(plan, ["packages", "consumer", "playground", "full", "docs_only"]);
});

test("playground-only changes build only the playground", () => {
  const plan = planCiScope(["examples/basic-playground/src/App.tsx"]);
  expectEnabled(plan, ["playground"]);
  expectDisabled(plan, ["quality", "packages", "consumer", "docs", "full"]);
});

test("consumer fixture changes run only the packed-consumer gate", () => {
  const plan = planCiScope(["tests/package-consumer/src/main.tsx"]);
  expectEnabled(plan, ["consumer"]);
  expectDisabled(plan, ["quality", "packages", "docs", "playground", "full"]);
});

test("repository template changes run CI contract verification only", () => {
  for (const file of [
    ".github/pull_request_template.md",
    ".github/PULL_REQUEST_TEMPLATE/ci-cd-infrastructure.md",
    ".github/ISSUE_TEMPLATE/ci-cd-infrastructure.yml"
  ]) {
    const plan = planCiScope([file]);
    expectEnabled(plan, ["quality"]);
    expectDisabled(plan, [
      "metadata",
      "ui_core",
      "ui_components",
      "ui_data_grid",
      "packages",
      "consumer",
      "docs",
      "playground",
      "full",
      "docs_only"
    ]);
  }
});

test("root manifests and workflows force full validation", () => {
  for (const file of ["package-lock.json", ".github/workflows/ci.yml", "scripts/verify-packages.mjs"]) {
    const plan = planCiScope([file]);
    expectEnabled(plan, [
      "quality",
      "metadata",
      "ui_core",
      "ui_components",
      "ui_data_grid",
      "packages",
      "consumer",
      "docs",
      "playground",
      "full"
    ]);
  }
});

test("unknown paths use safe full validation", () => {
  const plan = planCiScope(["tooling/new-config.toml"]);
  assert.equal(plan.full, true);
});

test("missing diff uses safe full validation", () => {
  const plan = planCiScope([]);
  assert.equal(plan.full, true);
});
