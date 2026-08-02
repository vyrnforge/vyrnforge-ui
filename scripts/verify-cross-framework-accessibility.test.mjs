import assert from "node:assert/strict";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { verifyCrossFrameworkAccessibility } from "./verify-cross-framework-accessibility.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const ignoredStaticFixtureSegments = new Set([
  "node_modules",
  "dist",
  ".angular",
  ".vite",
  "test-results",
]);

function includeStaticFixturePath(source) {
  const relative = path.relative(repositoryRoot, source);
  if (!relative || relative.startsWith("..")) return true;

  return !relative
    .split(path.sep)
    .some((segment) => ignoredStaticFixtureSegments.has(segment));
}

function fixture(mutator, callback) {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-cf7010-"));
  try {
    for (const entry of [
      ".github",
      "docs",
      "packages",
      "scripts",
      "tests",
      "package.json",
    ]) {
      cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
        recursive: true,
        filter: includeStaticFixturePath,
      });
    }
    mutator?.(root);
    callback(verifyCrossFrameworkAccessibility({ root }));
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

test("accepts honest CF-7010 manual-review-required metadata", () =>
  fixture(null, (failures) => assert.deepEqual(failures, [])));

test("rejects removal of the NVDA requirement", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "docs/metadata/cross-framework-accessibility-review.json",
      );
      const value = JSON.parse(readFileSync(file, "utf8"));
      value.manualReview.assistiveTechnology = "pending";
      writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
    },
    (failures) =>
      assert(failures.some((failure) => failure.includes("require NVDA"))),
  ));

test("rejects a runtime without Axe integration", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "scripts/verify-consumer-foundations-runtime.mjs",
      );
      writeFileSync(
        file,
        readFileSync(file, "utf8").replaceAll("axeSource", "auditSource"),
      );
    },
    (failures) =>
      assert(failures.some((failure) => failure.includes("axeSource"))),
  ));

test("evidence-complete requires a real manual evidence file", () =>
  fixture(
    (root) => {
      // Keep this regression independent from completed repository evidence.
      rmSync(
        path.join(
          root,
          "docs",
          "quality",
          "assistive-technology-results",
          "cf-7010-cross-framework-nvda.json",
        ),
        { force: true },
      );

      const file = path.join(
        root,
        "docs/metadata/cross-framework-accessibility-review.json",
      );
      const value = JSON.parse(readFileSync(file, "utf8"));
      value.program.status = "evidence-complete";
      value.supportClaim = "cross-framework-accessibility-verified";
      value.manualReview.status = "complete";
      value.unresolvedBlockers = [];
      writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("manual evidence is missing"),
        ),
      ),
  ));

test("rejects removal of text-input accessible-name forwarding", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "packages/ui-elements/src/components/inputs.ts",
      );
      writeFileSync(
        file,
        readFileSync(file, "utf8").replace(
          'control.setAttribute("aria-label", accessibleLabel)',
          'control.setAttribute("data-label", accessibleLabel)',
        ),
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("text-input accessible-name forwarding"),
        ),
      ),
  ));

test("rejects removal of status-content contrast", () =>
  fixture(
    (root) => {
      for (const file of [
        "packages/ui-components/src/styles/feedback/alert.css",
        "packages/ui-elements/src/styles/feedback/alert.css",
      ]) {
        const absolute = path.join(root, file);
        writeFileSync(
          absolute,
          readFileSync(absolute, "utf8").replace(
            ".vf-inline-message--success .vf-inline-message__content",
            ".vf-inline-message--success .vf-inline-message__body",
          ),
        );
      }
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("must apply status text contrast"),
        ),
      ),
  ));

test("rejects hardcoded framework-specific tab labels", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "scripts/verify-consumer-foundations-runtime.mjs",
      );
      writeFileSync(
        file,
        readFileSync(file, "utf8").replace(
          'const accessibilityTabs = page.getByRole("tab")',
          'const accessibilityTabs = page.getByRole("tab", { name: "Events" })',
        ),
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes('const accessibilityTabs = page.getByRole("tab")'),
        ),
      ),
  ));

test("rejects native tab focus loss after automatic activation", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "packages/ui-elements/src/components/navigation.ts",
      );
      writeFileSync(
        file,
        readFileSync(file, "utf8").replace(
          "this.#pendingFocusValue = next;",
          "",
        ),
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes(
            "native tabs must restore keyboard focus after automatic activation",
          ),
        ),
      ),
  ));

test("rejects removal of late button-content synchronization", () =>
  fixture(
    (root) => {
      const file = path.join(
        root,
        "packages/ui-elements/src/components/actions.ts",
      );
      writeFileSync(
        file,
        readFileSync(file, "utf8").replace(
          "this.observeExternalContent();",
          "",
        ),
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes(
            "native action elements must synchronize late light-DOM content",
          ),
        ),
      ),
  ));

test("static fixture excludes preserved consumer build output", () => {
  assert.equal(
    includeStaticFixturePath(
      path.join(
        repositoryRoot,
        "tests/consumers/angular/node_modules/example/index.js",
      ),
    ),
    false,
  );
  assert.equal(
    includeStaticFixturePath(
      path.join(repositoryRoot, "tests/consumers/vue/dist/index.html"),
    ),
    false,
  );
  assert.equal(
    includeStaticFixturePath(
      path.join(
        repositoryRoot,
        "tests/consumers/angular/src/app/app.component.html",
      ),
    ),
    true,
  );
});
