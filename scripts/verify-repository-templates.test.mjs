import assert from "node:assert/strict";
import {
  copyFileSync,
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

import { verifyRepositoryTemplates } from "./verify-repository-templates.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const fixtureFiles = [
  "AGENTS.md",
  "CONTRIBUTING.md",
  ".github/pull_request_template.md",
  ".github/PULL_REQUEST_TEMPLATE/ci-cd-infrastructure.md",
  ".github/PULL_REQUEST_TEMPLATE/release.md",
  ".github/ISSUE_TEMPLATE/ci-cd-infrastructure.yml",
  ".github/ISSUE_TEMPLATE/release-readiness.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
];

function createFixture() {
  const root = mkdtempSync(path.join(tmpdir(), "vyrnforge-contributor-flow-"));
  for (const relativePath of fixtureFiles) {
    const destination = path.join(root, relativePath);
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(path.join(repositoryRoot, relativePath), destination);
  }
  return root;
}

function mutate(root, relativePath, transform) {
  const file = path.join(root, relativePath);
  const content = transform(readFileSync(file, "utf8"));
  writeFileSync(file, content, "utf8");
}

test("accepts the integration-lane contributor and agent contracts", () => {
  assert.deepEqual(verifyRepositoryTemplates(), []);
});

test("rejects agent guidance that drops the owning-lane task branch rule", () => {
  const root = createFixture();
  try {
    mutate(root, "AGENTS.md", (content) =>
      content.replace(
        "start the short-lived task branch from the owning `integration/<lane>`",
        "start a short-lived task branch",
      ),
    );
    assert(
      verifyRepositoryTemplates({ root }).some((failure) =>
        failure.includes(
          "start the short-lived task branch from the owning `integration/<lane>`",
        ),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects agent guidance that permits normal direct-to-main task work", () => {
  const root = createFixture();
  try {
    mutate(root, "AGENTS.md", (content) =>
      content.replace(
        "Do not create a normal task branch from `main`",
        "Normal task branches may start from `main`",
      ),
    );
    assert(
      verifyRepositoryTemplates({ root }).some((failure) =>
        failure.includes("Do not create a normal task branch from `main`"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects agent guidance that drops lane-to-main promotion", () => {
  const root = createFixture();
  try {
    mutate(root, "AGENTS.md", (content) =>
      content.replace(
        "`integration/<lane>` -> `main` promotion PR",
        "promotion PR",
      ),
    );
    assert(
      verifyRepositoryTemplates({ root }).some((failure) =>
        failure.includes("`integration/<lane>` -> `main` promotion PR"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects agent guidance that treats missing branch protection as permission", () => {
  const root = createFixture();
  try {
    mutate(root, "AGENTS.md", (content) =>
      content.replace(
        "Never use a missing protection rule",
        "A missing protection rule may be bypassed",
      ),
    );
    assert(
      verifyRepositoryTemplates({ root }).some((failure) =>
        failure.includes("Never use a missing protection rule"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects repository setup that drops npm ci", () => {
  const root = createFixture();
  try {
    mutate(root, "CONTRIBUTING.md", (content) =>
      content.replace("npm ci", "npm install"),
    );
    assert(
      verifyRepositoryTemplates({ root }).some((failure) =>
        failure.includes("repository setup must use npm ci"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects contributor guidance that drops persistent lane routing", () => {
  const root = createFixture();
  try {
    mutate(root, "CONTRIBUTING.md", (content) =>
      content.replace("integration/vue", "vue work branch"),
    );
    assert(
      verifyRepositoryTemplates({ root }).some((failure) =>
        failure.includes("integration/vue"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects contributor guidance that drops lane promotion", () => {
  const root = createFixture();
  try {
    mutate(root, "CONTRIBUTING.md", (content) =>
      content.replace("lane promotion", "normal merge"),
    );
    assert(
      verifyRepositoryTemplates({ root }).some((failure) =>
        failure.includes("lane promotion"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects removed aggregate commands in normal PR guidance", () => {
  const root = createFixture();
  try {
    mutate(root, ".github/pull_request_template.md", (content) =>
      content.replace("`npm run check`", "`npm run quality`"),
    );
    const failures = verifyRepositoryTemplates({ root });
    assert(
      failures.some((failure) =>
        failure.includes("removed command npm run quality"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects a PR template that drops publishable-workspace lifecycle impact", () => {
  const root = createFixture();
  try {
    mutate(root, ".github/pull_request_template.md", (content) =>
      content.replace(
        "New or changed publishable workspaces have an explicit release lifecycle classification.",
        "Package lifecycle reviewed.",
      ),
    );
    assert(
      verifyRepositoryTemplates({ root }).some((failure) =>
        failure.includes("explicit release lifecycle classification"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects a PR template that stops identifying promotion PRs", () => {
  const root = createFixture();
  try {
    mutate(root, ".github/pull_request_template.md", (content) =>
      content.replace("**Promotion PR:**", "**Merge type:**"),
    );
    assert(
      verifyRepositoryTemplates({ root }).some((failure) =>
        failure.includes("**Promotion PR:**"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects internal planning terminology in the normal PR template", () => {
  const root = createFixture();
  try {
    mutate(
      root,
      ".github/pull_request_template.md",
      (content) => `${content}\nTask ID: RS-9007\n`,
    );
    assert(
      verifyRepositoryTemplates({ root }).some((failure) =>
        failure.includes("internal task identity"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects reintroducing a retired focused template", () => {
  const root = createFixture();
  try {
    const file = path.join(
      root,
      ".github/PULL_REQUEST_TEMPLATE/component-or-package.md",
    );
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, "## Summary\n", "utf8");
    assert(
      verifyRepositoryTemplates({ root }).some((failure) =>
        failure.includes("retired focused template must stay removed"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects contributor guidance that stops delegating scope to the planner", () => {
  const root = createFixture();
  try {
    mutate(root, "CONTRIBUTING.md", (content) =>
      content.replaceAll("scripts/detect-ci-scope.mjs", "the CI system"),
    );
    assert(
      verifyRepositoryTemplates({ root }).some((failure) =>
        failure.includes("scripts/detect-ci-scope.mjs"),
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
