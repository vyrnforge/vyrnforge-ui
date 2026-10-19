import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { loadCanonicalComponentContracts } from "./canonical-component-contracts.mjs";
import {
  createComponentPresetReference,
  loadComponentPresets,
  validateComponentPresets,
} from "./component-presets.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function load() {
  const contracts = loadCanonicalComponentContracts({ root: repositoryRoot });
  return {
    contracts,
    presets: loadComponentPresets({ root: repositoryRoot, contracts }),
  };
}

test("canonical component presets are deterministic and base-component backed", () => {
  const { presets } = load();
  assert.equal(presets.presets.length, 6);
  assert.deepEqual(
    presets.presets.map((preset) => preset.id),
    [
      "clear-button",
      "close-button",
      "more-button",
      "refresh-button",
      "status-badge",
      "toast-action",
    ],
  );
  for (const preset of presets.presets) {
    assert.equal(preset.surfaceBindings.native.supportLevel, "first-class");
    assert.equal(preset.surfaceBindings.react.supportLevel, "first-class");
    assert.equal(preset.surfaceBindings.angular.supportLevel, "first-class");
    assert.equal(preset.surfaceBindings.vue.supportLevel, "first-class");
  }
});

test("status badge preset preserves current status normalization contract", () => {
  const { presets } = load();
  const status = presets.byId.get("status-badge");
  assert.equal(status.baseComponent, "badge");
  assert.equal(status.kind, "transform");
  assert.deepEqual(status.transforms[0].map, {
    active: "success",
    success: "success",
    inactive: "neutral",
    neutral: "neutral",
    pending: "warning",
    warning: "warning",
    danger: "danger",
    error: "danger",
    info: "info",
  });
  assert.equal(status.transforms[0].fallback, "neutral");
  assert.deepEqual(status.content.sourceOrder, ["default", "label", "status"]);
  assert.equal(status.surfaceBindings.react.publicName, "StatusBadge");
});

test("utility action presets preserve icon, label, tooltip and variant defaults", () => {
  const { presets } = load();
  const expected = {
    "clear-button": ["Close", "Clear", "ghost"],
    "close-button": ["Close", "Close", "ghost"],
    "more-button": ["MoreHorizontal", "More actions", "ghost"],
    "refresh-button": ["Refresh", "Refresh", "subtle"],
  };
  for (const [id, [icon, label, variant]] of Object.entries(expected)) {
    const preset = presets.byId.get(id);
    assert.equal(preset.baseComponent, "icon-button");
    assert.equal(preset.semanticDefaults.icon, icon);
    assert.equal(preset.semanticDefaults.accessibleName, label);
    assert.equal(preset.semanticDefaults.tooltip, label);
    assert.equal(preset.baseDefaults.variant, variant);
  }
});

test("toast action is represented as Button composition instead of a renderer", () => {
  const { presets } = load();
  const preset = presets.byId.get("toast-action");
  assert.equal(preset.baseComponent, "button");
  assert.equal(preset.kind, "composition");
  assert.deepEqual(preset.baseDefaults, { size: "sm", variant: "subtle" });
  assert.equal(preset.semanticDefaults.accessibleNameInput, "altText");
  assert.equal(preset.surfaceBindings.react.publicName, "ToastAction");
});

test("preset validation rejects targets outside canonical component contracts", () => {
  const { contracts, presets } = load();
  const invalid = structuredClone(presets.document);
  invalid.presets[0].baseComponent = "missing-component";
  assert(
    validateComponentPresets(invalid, contracts).some((failure) =>
      failure.includes("unknown canonical component"),
    ),
  );
});

test("preset reference is compact and framework-neutral", () => {
  const { presets } = load();
  const reference = createComponentPresetReference(presets);
  assert.equal(reference.records.length, 6);
  assert.equal(reference.source, "docs/metadata/component-presets.json");
  assert.equal(
    reference.records.some((record) =>
      JSON.stringify(record).includes("ReactNode"),
    ),
    false,
  );
});
