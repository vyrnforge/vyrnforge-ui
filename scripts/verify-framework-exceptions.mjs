import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const modulePath = fileURLToPath(import.meta.url);
const defaultRoot = path.resolve(path.dirname(modulePath), "..");
const forbiddenReactDuplicateSuffixes = [
  ".legacy.tsx",
  ".old.tsx",
  ".deprecated.tsx",
  ".fallback.tsx",
  ".temporary.tsx",
];

function scopesOf(entry) {
  return Array.isArray(entry.scope) ? entry.scope : [entry.scope];
}

function collectFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(absolutePath));
    else files.push(absolutePath);
  }
  return files;
}

export function verifyFrameworkExceptions(repositoryRoot = defaultRoot) {
  const registry = JSON.parse(
    readFileSync(
      path.join(repositoryRoot, "docs/metadata/framework-exceptions.json"),
      "utf8",
    ),
  );

  assert.equal(
    registry.sourceOfTruth?.canonical,
    true,
    "framework exception metadata must remain canonical",
  );
  assert.equal(registry.defaultPolicy, "generated-or-generic");
  assert.ok(
    Array.isArray(registry.requiredFields) &&
      registry.requiredFields.length > 0,
  );

  const live = registry.exceptions.filter(({ state }) =>
    ["active", "retiring"].includes(state),
  );
  assert.ok(
    live.length > 0,
    "at least one live framework exception is expected",
  );

  for (const entry of live) {
    for (const field of registry.requiredFields) {
      assert.notEqual(
        entry[field],
        undefined,
        entry.id + " is missing required field " + field,
      );
    }
    assert.ok(
      registry.exceptionClasses.includes(entry.exceptionClass),
      entry.id + " has an unknown exception class",
    );
    assert.ok(entry.reason.length > 40, entry.id + " reason is too weak");
    assert.ok(
      entry.exitCriteria.length > 40,
      entry.id + " exit criteria is too weak",
    );
    assert.ok(entry.evidence.length > 0, entry.id + " has no evidence");
    assert.ok(entry.sourcePaths.length > 0, entry.id + " has no source paths");
    for (const sourcePath of entry.sourcePaths) {
      assert.equal(
        existsSync(path.join(repositoryRoot, sourcePath)),
        true,
        entry.id + " source does not exist: " + sourcePath,
      );
    }
    assert.doesNotMatch(
      entry.reason.toLowerCase(),
      /historical existence|because it existed|legacy only/,
    );
  }

  const liveReact = live.filter(({ framework }) => framework === "react");
  const byId = new Map(liveReact.map((entry) => [entry.id, entry]));
  for (const requiredId of [
    "MFD-EX-REACT-TOAST-PROVIDER",
    "MFD-EX-REACT-USE-TOAST",
    "MFD-EX-REACT-TYPOGRAPHY-SEMANTICS",
  ]) {
    assert.ok(
      byId.has(requiredId),
      requiredId + " must remain a live exception",
    );
  }
  assert.deepEqual(
    scopesOf(byId.get("MFD-EX-REACT-OVERLAY-COMPOSITION")).sort(),
    ["confirm-dialog", "dialog", "drawer", "popover", "toast", "tooltip"],
  );
  assert.deepEqual(
    scopesOf(byId.get("MFD-EX-REACT-LAYOUT-NATIVE-HOST")).sort(),
    ["card", "inline", "stack"],
  );
  assert.deepEqual(
    scopesOf(byId.get("MFD-EX-REACT-LAYOUT-RICH-COMPOSITION")).sort(),
    ["app-shell", "page", "page-header", "page-toolbar", "panel", "section"],
  );

  const reactSourceRoot = path.join(
    repositoryRoot,
    "packages/ui-components/src/components",
  );
  for (const sourcePath of collectFiles(reactSourceRoot)) {
    const relativePath = path.relative(repositoryRoot, sourcePath);
    for (const suffix of forbiddenReactDuplicateSuffixes) {
      assert.equal(
        relativePath.endsWith(suffix),
        false,
        "dormant duplicate React implementation is forbidden: " + relativePath,
      );
    }
  }

  return registry;
}

if (process.argv[1] && path.resolve(process.argv[1]) === modulePath) {
  const registry = verifyFrameworkExceptions();
  console.log(
    "Verified " + registry.exceptions.length + " framework exception records.",
  );
}
