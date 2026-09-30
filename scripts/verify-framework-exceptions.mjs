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
  assert.equal(
    live.length,
    1,
    "SC-2108 reconciliation expects only the narrow native toast viewport mapping gap to remain live",
  );
  assert.equal(live[0]?.id, "MFD-EX-NATIVE-TOAST-VIEWPORT");

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

  const closed = registry.exceptions.filter(({ state }) => state === "closed");
  assert.equal(
    closed.length,
    registry.exceptions.length - 1,
    "SC-2108 expects every evidence-satisfied original exception to be closed",
  );
  for (const entry of closed) {
    assert.equal(
      entry.reviewMilestone,
      "S21 SC-2108 reconciliation",
      entry.id + " must record the S21 reconciliation milestone",
    );
    assert.ok(
      entry.evidence.some((item) => /SC-210[2-7]/.test(item)),
      entry.id + " must cite delivered S21 capability evidence",
    );
  }

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
