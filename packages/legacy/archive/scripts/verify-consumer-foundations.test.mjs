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

import { verifyConsumerFoundations } from "./verify-consumer-foundations.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function withRepositoryFixture(mutator, callback) {
  const root = mkdtempSync(
    path.join(tmpdir(), "vyrnforge-consumer-foundation-"),
  );
  try {
    for (const entry of [
      "docs",
      "packages",
      "tests/consumers",
      "scripts",
      "package.json",
    ]) {
      cpSync(path.join(repositoryRoot, entry), path.join(root, entry), {
        recursive: true,
      });
    }
    mutator?.(root);
    callback(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function mutateJson(root, relativePath, update) {
  const file = path.join(root, relativePath);
  const value = JSON.parse(readFileSync(file, "utf8"));
  update(value);
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

test("repository consumer foundation contracts are internally complete", () => {
  assert.deepEqual(verifyConsumerFoundations(), []);
});

test("rejects stale Custom Elements metadata", () => {
  withRepositoryFixture(
    (root) => {
      mutateJson(root, "packages/ui-elements/custom-elements.json", (value) => {
        value.modules[0].declarations = value.modules[0].declarations.filter(
          (declaration) => declaration.tagName !== "vf-button",
        );
      });
    },
    (root) => {
      assert(
        verifyConsumerFoundations({ root }).some((failure) =>
          failure.includes("custom-elements.json is missing vf-button"),
        ),
      );
    },
  );
});

test("rejects stale Custom Elements event vocabulary", () => {
  withRepositoryFixture(
    (root) => {
      mutateJson(root, "packages/ui-elements/custom-elements.json", (value) => {
        value.vyrnforge.eventVocabulary =
          value.vyrnforge.eventVocabulary.filter(
            (eventName) => eventName !== "vf-confirm",
          );
      });
    },
    (root) => {
      assert(
        verifyConsumerFoundations({ root }).some((failure) =>
          failure.includes(
            "event vocabulary must match canonical component contracts",
          ),
        ),
      );
    },
  );
});

// Canonical contracts own event-vocabulary ordering; the typed event map must preserve set parity.
test("rejects typed event maps that diverge from canonical contracts", () => {
  withRepositoryFixture(
    (root) => {
      const eventsPath = path.join(root, "packages/ui-elements/src/events.ts");
      const eventsText = readFileSync(eventsPath, "utf8");
      writeFileSync(
        eventsPath,
        eventsText.replace(
          '  readonly "vf-confirm": VyrnForgeConfirmDetail;\n',
          "",
        ),
      );
    },
    (root) => {
      assert(
        verifyConsumerFoundations({ root }).some((failure) =>
          failure.includes(
            "canonical event detail map must cover canonical contract event vocabulary",
          ),
        ),
      );
    },
  );
});

test("rejects a React dependency in the native package", () => {
  withRepositoryFixture(
    (root) => {
      mutateJson(root, "packages/ui-elements/package.json", (value) => {
        value.dependencies.react = "19.2.7";
      });
    },
    (root) => {
      assert(
        verifyConsumerFoundations({ root }).some((failure) =>
          failure.includes("must not acquire a React dependency"),
        ),
      );
    },
  );
});

test("rejects regressed packed consumer claims", () => {
  withRepositoryFixture(
    (root) => {
      mutateJson(root, "tests/consumers/manifest.json", (value) => {
        value.fixtures.find((fixture) => fixture.id === "vue").supportClaim =
          "packed-vue-runtime-ready";
      });
    },
    (root) => {
      assert(
        verifyConsumerFoundations({ root }).some((failure) =>
          failure.includes(
            "vue manifest support claim is not a current verified claim",
          ),
        ),
      );
    },
  );
});
