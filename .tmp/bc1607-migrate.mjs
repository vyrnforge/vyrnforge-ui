import fs from "node:fs";

const registryPath = "docs/metadata/framework-exceptions.json";
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

const additions = [
  {
    id: "MFD-EX-REACT-OVERLAY-COMPOSITION",
    framework: "react",
    scope: ["dialog", "drawer", "popover", "tooltip", "toast", "confirm-dialog"],
    exceptionClass: "composition",
    reason:
      "Current React overlay and feedback surfaces preserve rich ReactNode composition, trigger ownership, portal targeting, controlled state, anchored positioning, focus management, dismissal, and lifecycle behavior that the canonical elements cannot yet adopt without changing the public React contract.",
    owner: "UI Platform",
    sourcePaths: [
      "packages/ui-components/src/components/Dialog/Dialog.tsx",
      "packages/ui-components/src/components/Drawer/Drawer.tsx",
      "packages/ui-components/src/components/Popover/Popover.tsx",
      "packages/ui-components/src/components/Tooltip/Tooltip.tsx",
      "packages/ui-components/src/components/Toast/Toast.tsx",
      "packages/ui-components/src/components/ConfirmDialog/ConfirmDialog.tsx",
      "packages/ui-elements/src/components/overlays.ts",
      "packages/ui-elements/src/components/feedback.ts",
      "packages/ui-components/src/components/__tests__/overlay-feedback-parity.test.tsx"
    ],
    evidence: [
      "The current overlay-feedback parity suite protects controlled/open-change behavior, ARIA relationships, Escape dismissal, ConfirmDialog behavior, and toast provider/controller integration.",
      "Current React sources retain portal, focus, trigger-composition, rich-content, and callback contracts that are not represented by the canonical string-oriented or DOM-owning renderers."
    ],
    exitCriteria:
      "Add framework-neutral overlay adoption contracts covering rich composition, trigger ownership, portal targeting, controlled state, anchored placement, focus containment/restoration, dismissal, and toast lifecycle behavior; then prove parity through the current overlay-feedback suite before retiring this exception.",
    state: "active",
    reviewMilestone: "S16 baseline hardening"
  },
  {
    id: "MFD-EX-REACT-LAYOUT-NATIVE-HOST",
    framework: "react",
    scope: ["card", "stack", "inline"],
    exceptionClass: "migration-compatibility",
    reason:
      "React Card, Stack, and Inline expose native div roots and HTMLAttributes contracts. Replacing those roots with Custom Elements would change tag identity, event currentTarget typing, ref semantics, and consumer DOM expectations even though visual properties are already represented canonically.",
    owner: "UI Platform",
    sourcePaths: [
      "packages/ui-components/src/components/Card/Card.tsx",
      "packages/ui-components/src/components/Stack/Stack.tsx",
      "packages/ui-components/src/components/Inline/Inline.tsx",
      "packages/ui-elements/src/components/display.ts"
    ],
    evidence: [
      "Current React implementations expose native div hosts while the shared display implementation is a Custom Element host.",
      "The exception is based on the current native-host API contract rather than historical migration status."
    ],
    exitCriteria:
      "Add a shared canonical native-host or Light-DOM adoption capability that preserves native root tag, HTML attribute typing, event currentTarget and ref semantics, classes, and children, then verify compatibility before replacing these React hosts.",
    state: "active",
    reviewMilestone: "S16 baseline hardening"
  },
  {
    id: "MFD-EX-REACT-LAYOUT-RICH-COMPOSITION",
    framework: "react",
    scope: ["panel", "section", "app-shell", "page", "page-header", "page-toolbar"],
    exceptionClass: "composition",
    reason:
      "Current React layout surfaces own semantic native roots and rich ReactNode regions such as headers, titles, descriptions, metadata, actions, breadcrumbs, toolbars, sidebars, main content, and footers. Canonical display hosts do not yet preserve that composed DOM ownership without replacement.",
    owner: "UI Platform",
    sourcePaths: [
      "packages/ui-components/src/components/Panel/Panel.tsx",
      "packages/ui-components/src/components/Section/Section.tsx",
      "packages/ui-components/src/components/AppShell/AppShell.tsx",
      "packages/ui-components/src/components/Page/Page.tsx",
      "packages/ui-components/src/components/PageHeader/PageHeader.tsx",
      "packages/ui-components/src/components/PageToolbar/PageToolbar.tsx",
      "packages/ui-elements/src/components/display.ts"
    ],
    evidence: [
      "Current React layout implementations own semantic wrapper structure and ReactNode regions while canonical display elements own Custom Element hosts and managed structure.",
      "The retained exception is tied to current composition and native-host behavior, not a completed migration task."
    ],
    exitCriteria:
      "Add framework-neutral named-region composition and native-host adoption that preserves ReactNode content, semantic roots, wrapper DOM, event/ref contracts, and consumer-owned regions; then verify current compatibility before retiring these handwritten React renderers.",
    state: "active",
    reviewMilestone: "S16 baseline hardening"
  }
];

const ids = new Set(registry.exceptions.map((entry) => entry.id));
for (const addition of additions) {
  if (!ids.has(addition.id)) registry.exceptions.push(addition);
}
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);

for (const file of [
  "docs/metadata/react-batch-5-overlay-convergence.json",
  "docs/metadata/react-batch-6-catalog-convergence.json",
  "docs/metadata/react-exception-catalog.json",
  "packages/ui-components/src/__tests__/react-batch-5-overlay-convergence.test.ts",
  "packages/ui-components/src/__tests__/react-batch-6-catalog-convergence.test.ts",
  "packages/ui-components/src/__tests__/react-exception-catalog.test.ts"
]) {
  fs.rmSync(file);
}

fs.writeFileSync(
  "scripts/verify-framework-exceptions.mjs",
  `import assert from "node:assert/strict";\nimport { existsSync, readFileSync } from "node:fs";\nimport path from "node:path";\nimport { fileURLToPath } from "node:url";\n\nconst modulePath = fileURLToPath(import.meta.url);\nconst defaultRoot = path.resolve(path.dirname(modulePath), "..");\n\nfunction scopesOf(entry) {\n  return Array.isArray(entry.scope) ? entry.scope : [entry.scope];\n}\n\nexport function verifyFrameworkExceptions(repositoryRoot = defaultRoot) {\n  const registry = JSON.parse(\n    readFileSync(path.join(repositoryRoot, "docs/metadata/framework-exceptions.json"), "utf8"),\n  );\n\n  assert.equal(registry.sourceOfTruth?.canonical, true, "framework exception metadata must remain canonical");\n  assert.equal(registry.defaultPolicy, "generated-or-generic");\n  assert.ok(Array.isArray(registry.requiredFields) && registry.requiredFields.length > 0);\n\n  const live = registry.exceptions.filter(({ state }) => ["active", "retiring"].includes(state));\n  assert.ok(live.length > 0, "at least one live framework exception is expected");\n\n  for (const entry of live) {\n    for (const field of registry.requiredFields) {\n      assert.notEqual(entry[field], undefined, \\`\\${entry.id} is missing required field \\${field}\\`);\n    }\n    assert.ok(registry.exceptionClasses.includes(entry.exceptionClass), \\`\\${entry.id} has an unknown exception class\\`);\n    assert.ok(entry.reason.length > 40, \\`\\${entry.id} reason is too weak\\`);\n    assert.ok(entry.exitCriteria.length > 40, \\`\\${entry.id} exit criteria is too weak\\`);\n    assert.ok(entry.evidence.length > 0, \\`\\${entry.id} has no evidence\\`);\n    assert.ok(entry.sourcePaths.length > 0, \\`\\${entry.id} has no source paths\\`);\n    for (const sourcePath of entry.sourcePaths) {\n      assert.equal(existsSync(path.join(repositoryRoot, sourcePath)), true, \\`\\${entry.id} source does not exist: \\${sourcePath}\\`);\n    }\n    assert.doesNotMatch(entry.reason.toLowerCase(), /historical existence|because it existed|legacy only/);\n  }\n\n  const liveReact = live.filter(({ framework }) => framework === "react");\n  const byId = new Map(liveReact.map((entry) => [entry.id, entry]));\n  assert.ok(byId.has("MFD-EX-REACT-TOAST-PROVIDER"));\n  assert.ok(byId.has("MFD-EX-REACT-USE-TOAST"));\n  assert.deepEqual(scopesOf(byId.get("MFD-EX-REACT-OVERLAY-COMPOSITION")).sort(), ["confirm-dialog", "dialog", "drawer", "popover", "toast", "tooltip"]);\n  assert.deepEqual(scopesOf(byId.get("MFD-EX-REACT-LAYOUT-NATIVE-HOST")).sort(), ["card", "inline", "stack"]);\n  assert.deepEqual(scopesOf(byId.get("MFD-EX-REACT-LAYOUT-RICH-COMPOSITION")).sort(), ["app-shell", "page", "page-header", "page-toolbar", "panel", "section"]);\n\n  return registry;\n}\n\nif (process.argv[1] && path.resolve(process.argv[1]) === modulePath) {\n  const registry = verifyFrameworkExceptions();\n  console.log(\\`Verified \\${registry.exceptions.length} framework exception records.\\`);\n}\n`,
);

fs.writeFileSync(
  "scripts/verify-framework-exceptions.test.mjs",
  `import assert from "node:assert/strict";\nimport test from "node:test";\nimport { verifyFrameworkExceptions } from "./verify-framework-exceptions.mjs";\n\ntest("framework exception registry is current and auditable", () => {\n  assert.doesNotThrow(() => verifyFrameworkExceptions());\n});\n`,
);

const packagePath = "package.json";
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
packageJson.scripts["verify:framework-exceptions"] = "node scripts/verify-framework-exceptions.mjs";
packageJson.scripts["test:framework-exceptions"] = "node --test scripts/verify-framework-exceptions.test.mjs";
if (!packageJson.scripts["verify:metadata"].includes("verify:framework-exceptions")) {
  packageJson.scripts["verify:metadata"] = packageJson.scripts["verify:metadata"].replace(
    "npm run verify:component-metadata &&",
    "npm run verify:component-metadata && npm run verify:framework-exceptions &&",
  );
}
if (!packageJson.scripts["test:contracts"].includes("test:framework-exceptions")) {
  packageJson.scripts["test:contracts"] = packageJson.scripts["test:contracts"].replace(
    "npm run test:component-metadata &&",
    "npm run test:component-metadata && npm run test:framework-exceptions &&",
  );
}
fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
