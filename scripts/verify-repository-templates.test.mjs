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
  writeFileSync(file, transform(readFileSync(file, "utf8")), "utf8");
}

function expectFailure(root, fragment) {
  assert(
    verifyRepositoryTemplates({ root }).some((failure) =>
      failure.includes(fragment),
    ),
  );
}

test("accepts mainline and bounded stacked contributor contracts", () => {
  assert.deepEqual(verifyRepositoryTemplates(), []);
});

test("rejects agent guidance that drops stacked dependency discipline", () => {
  const root = createFixture();
  try {
    mutate(root, "AGENTS.md", (content) =>
      content.replace(
        "use a stacked PR only when the dependency is real",
        "stack work freely",
      ),
    );
    expectFailure(root, "use a stacked PR only when the dependency is real");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects agent guidance that drops the final protected-main gate", () => {
  const root = createFixture();
  try {
    mutate(root, "AGENTS.md", (content) =>
      content.replace("full protected mainline gate", "branch checks"),
    );
    expectFailure(root, "full protected mainline gate");
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
    expectFailure(root, "repository setup must use npm ci");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects contributor guidance that drops the mainline path", () => {
  const root = createFixture();
  try {
    mutate(root, "CONTRIBUTING.md", (content) =>
      content.replace("Use a mainline PR to protected `main`", "Open any PR"),
    );
    expectFailure(root, "Use a mainline PR to protected `main`");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects contributor guidance that drops bounded integration semantics", () => {
  const root = createFixture();
  try {
    mutate(root, "CONTRIBUTING.md", (content) =>
      content.replace(
        "Temporary `integration/<initiative>` branches are allowed",
        "Integration branches are permanent",
      ),
    );
    expectFailure(
      root,
      "Temporary `integration/<initiative>` branches are allowed",
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
    expectFailure(root, "removed command npm run quality");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects a PR template that drops dependency declaration", () => {
  const root = createFixture();
  try {
    mutate(root, ".github/pull_request_template.md", (content) =>
      content.replace("**Depends on:**", "**Related:**"),
    );
    expectFailure(root, "**Depends on:**");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects a PR template that drops stacked retarget planning", () => {
  const root = createFixture();
  try {
    mutate(root, ".github/pull_request_template.md", (content) =>
      content.replace("**Retarget plan for stacked PRs:**", "**Notes:**"),
    );
    expectFailure(root, "**Retarget plan for stacked PRs:**");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects publishable-workspace lifecycle omission", () => {
  const root = createFixture();
  try {
    mutate(root, ".github/pull_request_template.md", (content) =>
      content.replace(
        "New or changed publishable workspaces have an explicit release lifecycle classification.",
        "Package lifecycle reviewed.",
      ),
    );
    expectFailure(root, "explicit release lifecycle classification");
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
    expectFailure(root, "internal task identity");
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
    expectFailure(root, "retired focused template must stay removed");
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
    expectFailure(root, "scripts/detect-ci-scope.mjs");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
