import assert from "node:assert/strict";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  documentationSystemPath,
  referencePortalPath,
  repositoryRoot,
  verifyReferenceProductArchitecture,
} from "./verify-reference-product-architecture.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(scriptDirectory, "..");

function fixture(mutator, callback) {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-reference-product-"));
  try {
    for (const relativePath of [referencePortalPath, documentationSystemPath]) {
      const source = path.join(repo, relativePath);
      const destination = path.join(root, relativePath);
      mkdirSync(path.dirname(destination), { recursive: true });
      cpSync(source, destination);
    }
    mutator?.(root);
    callback(verifyReferenceProductArchitecture({ root }));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("current repository satisfies the reference product architecture contract", () => {
  assert.equal(repositoryRoot, repo);
  assert.deepEqual(verifyReferenceProductArchitecture(), []);
});

test("rejects framework-specific semantic ownership", () =>
  fixture(
    (root) => {
      const file = path.join(root, referencePortalPath);
      const portal = JSON.parse(readFileSync(file, "utf8"));
      portal.product.semanticOwnership = "react";
      writeFileSync(file, `${JSON.stringify(portal, null, 2)}\n`);
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("semantic ownership must remain framework-neutral"),
        ),
      ),
  ));

test("rejects a missing first-class framework", () =>
  fixture(
    (root) => {
      const file = path.join(root, referencePortalPath);
      const portal = JSON.parse(readFileSync(file, "utf8"));
      delete portal.frameworks.vue;
      writeFileSync(file, `${JSON.stringify(portal, null, 2)}\n`);
    },
    (failures) =>
      assert(
        failures.some((failure) => failure.includes("must expose exactly")),
      ),
  ));

test("rejects search becoming a canonical fact owner", () =>
  fixture(
    (root) => {
      const file = path.join(root, referencePortalPath);
      const portal = JSON.parse(readFileSync(file, "utf8"));
      portal.contentOwnership.search.ownsFacts = true;
      writeFileSync(file, `${JSON.stringify(portal, null, 2)}\n`);
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes("search must explicitly own no canonical facts"),
        ),
      ),
  ));

test("rejects restoring docsRegistry as durable route authority", () =>
  fixture(
    (root) => {
      const file = path.join(root, documentationSystemPath);
      writeFileSync(
        file,
        `${readFileSync(file, "utf8")}\napps/docs/src/docsRegistry.ts\` is the executable source for documentation routes.\n`,
      );
    },
    (failures) =>
      assert(
        failures.some((failure) =>
          failure.includes(
            "must not treat docsRegistry.ts as durable route authority",
          ),
        ),
      ),
  ));
