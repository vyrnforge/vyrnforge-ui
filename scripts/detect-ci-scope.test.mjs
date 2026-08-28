import assert from "node:assert/strict";
import test from "node:test";

import { planCiScope, planDeliveryScope } from "./detect-ci-scope.mjs";

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

test("package runtime changes derive affected workspaces from the dependency graph", () => {
  const plan = planCiScope(["packages/ui-core/src/theme.ts"]);
  expectEnabled(plan, [
    "quality",
    "packages",
    "consumer",
    "docs",
    "playground",
    "fixtures",
    "browser",
    "integration",
  ]);
  assert.ok(plan.affected_packages.includes("@vyrnforge/ui-core"));
  assert.ok(plan.affected_packages.includes("@vyrnforge/ui-behaviors"));
  assert.ok(plan.affected_packages.includes("@vyrnforge/ui-components"));
  assert.ok(plan.affected_packages.includes("@vyrnforge/ui-elements"));
  assert.ok(plan.affected_packages.includes("@vyrnforge/ui-vue"));
  assert.equal(plan.full, false);
});

test("package tests select only their own workspace quality", () => {
  const plan = planCiScope(["packages/ui-data-grid/src/grid.test.tsx"]);
  expectEnabled(plan, ["quality"]);
  expectDisabled(plan, ["packages", "consumer", "docs", "playground", "full"]);
  assert.deepEqual(plan.affected_packages, ["@vyrnforge/ui-data-grid"]);
});

test("package README changes verify the published payload and consumer", () => {
  const plan = planCiScope(["packages/ui-components/README.md"]);
  expectEnabled(plan, ["packages", "consumer", "integration"]);
  expectDisabled(plan, ["quality", "docs", "playground", "full"]);
  assert.deepEqual(plan.affected_packages, ["@vyrnforge/ui-components"]);
});

test("new framework package paths are discovered without CI topology changes", () => {
  const plan = planCiScope(["packages/ui-vue/src/Button.ts"]);
  expectEnabled(plan, ["quality", "packages", "consumer", "docs", "browser"]);
  assert.deepEqual(plan.affected_packages, ["@vyrnforge/ui-vue"]);
  assert.equal(plan.full, false);
});

test("package configuration changes include metadata validation", () => {
  const plan = planCiScope(["packages/ui-elements/package.json"]);
  expectEnabled(plan, ["quality", "metadata", "packages", "consumer", "docs"]);
  assert.ok(plan.affected_packages.includes("@vyrnforge/ui-elements"));
});

test("canonical docs-only changes build docs without package runtime checks", () => {
  const plan = planCiScope(["docs/release/publication-procedure.md"]);
  expectEnabled(plan, ["docs", "docs_only", "integration"]);
  expectDisabled(plan, [
    "quality",
    "packages",
    "consumer",
    "playground",
    "full",
    "security",
  ]);
  assert.deepEqual(plan.affected_packages, []);
});

test("metadata changes verify metadata and build docs", () => {
  const plan = planCiScope(["docs/metadata/components.json"]);
  expectEnabled(plan, ["quality", "metadata", "docs", "integration"]);
  expectDisabled(plan, [
    "packages",
    "consumer",
    "playground",
    "full",
    "docs_only",
  ]);
});

test("playground changes build the playground without full fallback", () => {
  const plan = planCiScope(["examples/basic-playground/src/App.tsx"]);
  expectEnabled(plan, ["playground", "integration"]);
  expectDisabled(plan, [
    "quality",
    "packages",
    "consumer",
    "docs",
    "browser",
    "full",
  ]);
});

test("consumer fixture changes select the packed-consumer gate", () => {
  for (const file of [
    "tests/package-consumer/src/main.tsx",
    "tests/beta-package-consumer/src/main.tsx",
  ]) {
    const plan = planCiScope([file]);
    expectEnabled(plan, ["consumer", "integration"]);
    expectDisabled(plan, ["quality", "packages", "docs", "playground", "full"]);
  }
});

test("multi-framework fixture changes run architecture, consumer, and docs checks", () => {
  const plan = planCiScope(["tests/consumers/angular/example.component.ts"]);
  expectEnabled(plan, [
    "quality",
    "metadata",
    "consumer",
    "docs",
    "integration",
  ]);
  expectDisabled(plan, [
    "packages",
    "playground",
    "browser",
    "full",
    "docs_only",
  ]);
});

test("repository template changes run quality contract verification", () => {
  for (const file of [
    ".github/pull_request_template.md",
    ".github/PULL_REQUEST_TEMPLATE/ci-cd-infrastructure.md",
    ".github/ISSUE_TEMPLATE/ci-cd-infrastructure.yml",
  ]) {
    const plan = planCiScope([file]);
    expectEnabled(plan, ["quality"]);
    expectDisabled(plan, [
      "metadata",
      "packages",
      "consumer",
      "docs",
      "playground",
      "browser",
      "full",
      "docs_only",
    ]);
  }
});

test("root manifests and workflows force full validation", () => {
  for (const file of [
    "package-lock.json",
    ".github/workflows/ci.yml",
    "scripts/verify-packages.mjs",
  ]) {
    const plan = planCiScope([file]);
    expectEnabled(plan, [
      "quality",
      "metadata",
      "packages",
      "consumer",
      "docs",
      "playground",
      "fixtures",
      "browser",
      "full",
      "integration",
      "security",
    ]);
    assert.ok(plan.affected_packages.includes("@vyrnforge/ui-vue"));
    assert.equal(plan.delivery, false);
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

test("regression fixture changes run fixture quality without full fallback", () => {
  const plan = planCiScope(["apps/regression-fixtures/src/FixtureApp.tsx"]);
  expectEnabled(plan, ["quality", "fixtures", "browser", "integration"]);
  assert.equal(plan.full, false);
});

test("browser contract changes run browser and quality checks", () => {
  for (const file of ["tests/browser/dialog.spec.ts", "playwright.config.ts"]) {
    const plan = planCiScope([file]);
    expectEnabled(plan, ["quality", "browser", "integration"]);
    assert.equal(plan.full, false);
  }
});

test("visual regression metadata selects browser, fixture, quality, and docs", () => {
  const plan = planCiScope(["docs/metadata/visual-regression-matrix.json"]);
  expectEnabled(plan, [
    "quality",
    "metadata",
    "docs",
    "fixtures",
    "browser",
    "integration",
  ]);
  expectDisabled(plan, ["full", "docs_only"]);
});

test("dependency manifests select security validation", () => {
  const plan = planCiScope(["packages/ui-core/package.json"]);
  assert.equal(plan.security, true);
});

test("exact-main delivery rebuilds deployable surfaces without rerunning full validation", () => {
  const plan = planDeliveryScope();
  expectEnabled(plan, ["integration", "docs", "playground", "delivery"]);
  expectDisabled(plan, [
    "quality",
    "security",
    "metadata",
    "packages",
    "consumer",
    "fixtures",
    "browser",
    "full",
    "docs_only",
  ]);
  assert.deepEqual(plan.affected_packages, []);
  assert.match(plan.reasons[0], /exact-main delivery/);
});
